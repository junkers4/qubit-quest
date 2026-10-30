package main

// The Windows program's icon: a COFF object (.syso) with one .rsrc section holding the icon
// resources (RT_ICON per size and one RT_GROUP_ICON), which `go build` links into the .exe.
// Layout from the PE/COFF specification (learn.microsoft.com/windows/win32/debug/pe-format,
// "The .rsrc Section") and the icon resource formats (GRPICONDIR / GRPICONDIRENTRY).

import (
	"bytes"
	"encoding/binary"
	"image"
)

const (
	rtIcon      = 3
	rtGroupIcon = 14
	langEnUS    = 0x0409
)

// machines: COFF machine type and the relocation type for a 32-bit image-relative address.
var machines = map[string][2]uint16{
	"amd64": {0x8664, 3}, // IMAGE_REL_AMD64_ADDR32NB
	"arm64": {0xaa64, 2}, // IMAGE_REL_ARM64_ADDR32NB
	"386":   {0x014c, 7}, // IMAGE_REL_I386_DIR32NB
}

// dib is an icon image in the classic form: BITMAPINFOHEADER with double height, 32-bit BGRA
// rows bottom-up, then the 1-bit AND mask (all zero: the alpha channel decides).
func dib(img *image.RGBA) []byte {
	w, h := img.Rect.Dx(), img.Rect.Dy()
	maskRow := (w + 31) / 32 * 4
	var b bytes.Buffer
	binary.Write(&b, binary.LittleEndian, struct {
		Size                   uint32
		Width, Height          int32
		Planes, BitCount       uint16
		Compression, SizeImage uint32
		XPels, YPels           int32
		ClrUsed, ClrImportant  uint32
	}{40, int32(w), int32(2 * h), 1, 32, 0, uint32(w*h*4 + maskRow*h), 0, 0, 0, 0})
	for y := h - 1; y >= 0; y-- {
		for x := 0; x < w; x++ {
			c := img.RGBAAt(x, y)
			b.Write([]byte{c.B, c.G, c.R, c.A})
		}
	}
	b.Write(make([]byte, maskRow*h))
	return b.Bytes()
}

type resEntry struct {
	id   uint16
	data []byte
}

// syso builds the object file for one architecture. icons[i] is the resource data of the
// icon of size sizes[i] (a DIB, or PNG for 256).
func syso(arch string, sizes []int, icons [][]byte) []byte {
	mach := machines[arch]

	var group bytes.Buffer
	binary.Write(&group, binary.LittleEndian, [3]uint16{0, 1, uint16(len(icons))})
	for i, data := range icons {
		dim := byte(sizes[i])
		if sizes[i] >= 256 {
			dim = 0
		}
		group.Write([]byte{dim, dim, 0, 0})
		binary.Write(&group, binary.LittleEndian, []uint16{1, 32})
		binary.Write(&group, binary.LittleEndian, uint32(len(data)))
		binary.Write(&group, binary.LittleEndian, uint16(i+1))
	}

	// type -> names -> one language each -> data
	var iconRes []resEntry
	for i, data := range icons {
		iconRes = append(iconRes, resEntry{uint16(i + 1), data})
	}
	types := []struct {
		id    uint16
		items []resEntry
	}{
		{rtIcon, iconRes},
		{rtGroupIcon, []resEntry{{1, group.Bytes()}}},
	}

	// Sizes of the directory part: every table is 16 bytes plus 8 per entry; data entries 16.
	dirSize := func(entries int) int { return 16 + 8*entries }
	total := 0
	nItems := 0
	for _, t := range types {
		nItems += len(t.items)
	}
	rootSize := dirSize(len(types))
	nameTables := 0
	for _, t := range types {
		nameTables += dirSize(len(t.items))
	}
	langTables := nItems * dirSize(1)
	dataEntries := nItems * 16
	total = rootSize + nameTables + langTables + dataEntries

	sec := make([]byte, total)
	le := binary.LittleEndian
	putDir := func(at, entries int) {
		le.PutUint16(sec[at+14:], uint16(entries)) // NumberOfIdEntries
	}
	putEntry := func(at int, id uint16, offset uint32) {
		le.PutUint32(sec[at:], uint32(id))
		le.PutUint32(sec[at+4:], offset)
	}

	var relocs []uint32 // offsets of the data RVAs, which the linker fixes up
	var blobs bytes.Buffer
	dataStart := total
	nameAt := rootSize
	langAt := rootSize + nameTables
	entryAt := langAt + langTables
	putDir(0, len(types))
	for ti, t := range types {
		putEntry(16+8*ti, t.id, 0x80000000|uint32(nameAt))
		putDir(nameAt, len(t.items))
		for ii, it := range t.items {
			putEntry(nameAt+16+8*ii, it.id, 0x80000000|uint32(langAt))
			putDir(langAt, 1)
			putEntry(langAt+16, langEnUS, uint32(entryAt))
			for blobs.Len()%8 != 0 {
				blobs.WriteByte(0)
			}
			le.PutUint32(sec[entryAt:], uint32(dataStart+blobs.Len())) // RVA, relative to .rsrc
			le.PutUint32(sec[entryAt+4:], uint32(len(it.data)))
			relocs = append(relocs, uint32(entryAt))
			blobs.Write(it.data)
			langAt += dirSize(1)
			entryAt += 16
		}
		nameAt += dirSize(len(t.items))
	}
	sec = append(sec, blobs.Bytes()...)
	for len(sec)%8 != 0 {
		sec = append(sec, 0)
	}

	const fileHeader, sectionHeader = 20, 40
	rawAt := fileHeader + sectionHeader
	relocAt := rawAt + len(sec)
	symAt := relocAt + 10*len(relocs)

	var out bytes.Buffer
	binary.Write(&out, le, struct {
		Machine              uint16
		NumberOfSections     uint16
		TimeDateStamp        uint32
		PointerToSymbolTable uint32
		NumberOfSymbols      uint32
		SizeOfOptionalHeader uint16
		Characteristics      uint16
	}{mach[0], 1, 0, uint32(symAt), 1, 0, 0})
	binary.Write(&out, le, struct {
		Name                 [8]byte
		VirtualSize          uint32
		VirtualAddress       uint32
		SizeOfRawData        uint32
		PointerToRawData     uint32
		PointerToRelocations uint32
		PointerToLineNumbers uint32
		NumberOfRelocations  uint16
		NumberOfLineNumbers  uint16
		Characteristics      uint32
	}{[8]byte{'.', 'r', 's', 'r', 'c'}, 0, 0, uint32(len(sec)), uint32(rawAt), uint32(relocAt), 0,
		uint16(len(relocs)), 0, 0x40000040}) // initialized data, readable
	out.Write(sec)
	for _, r := range relocs {
		binary.Write(&out, le, r)
		binary.Write(&out, le, uint32(0)) // symbol 0: the section
		binary.Write(&out, le, mach[1])
	}
	// symbol 0: .rsrc, static, in section 1
	out.Write([]byte{'.', 'r', 's', 'r', 'c', 0, 0, 0})
	binary.Write(&out, le, uint32(0))
	binary.Write(&out, le, int16(1))
	binary.Write(&out, le, uint16(0))
	out.Write([]byte{3, 0})
	binary.Write(&out, le, uint32(4)) // empty string table
	return out.Bytes()
}
