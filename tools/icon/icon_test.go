package main

import (
	"bytes"
	"debug/pe"
	"encoding/binary"
	"image/png"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

func images(t *testing.T) ([]int, [][]byte) {
	t.Helper()
	wd, _ := os.Getwd()
	os.Chdir("../..") // readIcon reads src/font.js from the repository root
	defer os.Chdir(wd)
	icon := readIcon()
	sizes := []int{16, 32, 48, 256}
	var res [][]byte
	for _, s := range sizes {
		img := draw(grid(icon, s >= 40), s)
		if s >= 256 {
			res = append(res, pngBytes(img))
		} else {
			res = append(res, dib(img))
		}
	}
	return sizes, res
}

// resources walks the resource tree of a .rsrc section and returns type -> id -> data.
func resources(t *testing.T, data []byte, base uint32) map[uint32]map[uint32][]byte {
	le := binary.LittleEndian
	out := map[uint32]map[uint32][]byte{}
	entries := func(off uint32) [][2]uint32 {
		n := int(le.Uint16(data[off+12:])) + int(le.Uint16(data[off+14:]))
		var e [][2]uint32
		for i := 0; i < n; i++ {
			at := off + 16 + uint32(8*i)
			e = append(e, [2]uint32{le.Uint32(data[at:]), le.Uint32(data[at+4:])})
		}
		return e
	}
	for _, typ := range entries(0) {
		out[typ[0]] = map[uint32][]byte{}
		for _, name := range entries(typ[1] & 0x7fffffff) {
			lang := entries(name[1] & 0x7fffffff)[0]
			rva, size := le.Uint32(data[lang[1]:]), le.Uint32(data[lang[1]+4:])
			out[typ[0]][name[0]] = data[rva-base : rva-base+size]
		}
	}
	return out
}

func checkIcons(t *testing.T, res map[uint32]map[uint32][]byte, sizes []int) {
	t.Helper()
	if len(res[rtIcon]) != len(sizes) || len(res[rtGroupIcon]) != 1 {
		t.Fatalf("resources: %d icons, %d groups", len(res[rtIcon]), len(res[rtGroupIcon]))
	}
	group := res[rtGroupIcon][1]
	if n := binary.LittleEndian.Uint16(group[4:]); int(n) != len(sizes) {
		t.Fatalf("group lists %d icons", n)
	}
	for i, s := range sizes {
		e := group[6+14*i:]
		data := res[rtIcon][uint32(binary.LittleEndian.Uint16(e[12:]))]
		if int(binary.LittleEndian.Uint32(e[8:])) != len(data) {
			t.Errorf("size %d: group says %d bytes, resource has %d", s, binary.LittleEndian.Uint32(e[8:]), len(data))
		}
		if s >= 256 {
			if img, err := png.Decode(bytes.NewReader(data)); err != nil || img.Bounds().Dx() != 256 {
				t.Errorf("256 icon is not a 256 PNG: %v", err)
			}
		} else if w := binary.LittleEndian.Uint32(data[4:]); int(w) != s {
			t.Errorf("icon %d is %d wide", s, w)
		}
	}
}

// REQ-063: the Windows program carries the game's icon. The resource object is read back as
// COFF, then linked into a real .exe and read back from it.
func TestWindowsIcon(t *testing.T) {
	sizes, res := images(t)
	obj := syso("amd64", sizes, res)
	f, err := pe.NewFile(bytes.NewReader(obj))
	if err != nil {
		t.Fatal(err)
	}
	sec := f.Section(".rsrc")
	if sec == nil || len(sec.Relocs) != len(sizes)+1 {
		t.Fatalf("no .rsrc or wrong relocations: %+v", sec)
	}
	data, _ := sec.Data()
	checkIcons(t, resources(t, data, 0), sizes)

	if _, err := exec.LookPath("go"); err != nil {
		t.Skip("no go to link with")
	}
	dir := t.TempDir()
	must := func(err error) {
		if err != nil {
			t.Fatal(err)
		}
	}
	must(os.WriteFile(filepath.Join(dir, "go.mod"), []byte("module x\n\ngo 1.22\n"), 0o644))
	must(os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main\n\nfunc main() {}\n"), 0o644))
	must(os.WriteFile(filepath.Join(dir, "rsrc_windows_amd64.syso"), obj, 0o644))
	cmd := exec.Command("go", "build", "-o", "x.exe", ".")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "GOOS=windows", "GOARCH=amd64", "CGO_ENABLED=0")
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("%v\n%s", err, out)
	}
	exe, err := pe.Open(filepath.Join(dir, "x.exe"))
	must(err)
	defer exe.Close()
	sec = exe.Section(".rsrc")
	if sec == nil {
		t.Fatal("the .exe has no .rsrc")
	}
	data, _ = sec.Data()
	checkIcons(t, resources(t, data, sec.VirtualAddress), sizes)
}
