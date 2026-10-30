// Draws the desktop app icon from the game's own pixel icon (ICON in src/font.js): the qubit
// icon on the dark background in a red pixel frame, scaled by whole numbers, no smoothing.
// Writes desktop/icon.png (256 x 256), desktop/icon.ico (16, 32, 48, 256) and the Windows
// resource objects desktop/rsrc_windows_{amd64,arm64}.syso that put the icon in the .exe.
//
//	go run ./tools/icon
package main

import (
	"bytes"
	"encoding/binary"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
	"regexp"
	"strings"
)

var pal = map[byte]color.RGBA{
	'Y': {0xfc, 0xc0, 0x30, 255},
	'W': {0xf4, 0xf0, 0xe0, 255},
	'P': {0xf4, 0xf0, 0xe0, 255},
	'b': {0x5c, 0x5c, 0xfc, 255},
	'G': {0x30, 0xc0, 0x30, 255},
}

var (
	bg    = color.RGBA{0x0d, 0x0c, 0x0b, 255}
	red   = color.RGBA{0xb0, 0x18, 0x18, 255}
	shade = color.RGBA{0x3c, 0x08, 0x08, 255}
)

// readIcon takes the 16 x 16 icon rows out of src/font.js, so the two never differ.
func readIcon() []string {
	src, err := os.ReadFile("src/font.js")
	if err != nil {
		log.Fatal(err)
	}
	block := regexp.MustCompile(`(?s)const ICON = \[(.*?)\];`).FindSubmatch(src)
	if block == nil {
		log.Fatal("no ICON in src/font.js")
	}
	var rows []string
	for _, m := range regexp.MustCompile(`'([^']*)'`).FindAllSubmatch(block[1], -1) {
		rows = append(rows, string(m[1]))
	}
	if len(rows) != 16 || len(strings.Join(rows, "")) != 256 {
		log.Fatalf("ICON is not 16 x 16")
	}
	return rows
}

// grid is the icon in cells: 20 x 20 with a two-tone red frame, or the bare 16 x 16 for tiny sizes.
func grid(icon []string, framed bool) [][]color.RGBA {
	n, off := 16, 0
	if framed {
		n, off = 20, 2
	}
	g := make([][]color.RGBA, n)
	for y := range g {
		g[y] = make([]color.RGBA, n)
		for x := range g[y] {
			switch {
			case framed && (x == 0 || y == 0 || x == n-1 || y == n-1):
				g[y][x] = red
			case framed && (x == 1 || y == 1 || x == n-2 || y == n-2):
				g[y][x] = shade
			default:
				g[y][x] = bg
			}
		}
	}
	for y, row := range icon {
		for x := 0; x < len(row); x++ {
			if c, ok := pal[row[x]]; ok {
				g[y+off][x+off] = c
			}
		}
	}
	return g
}

// draw scales the grid by the largest whole number that fits size, centred on the background.
func draw(g [][]color.RGBA, size int) *image.RGBA {
	img := image.NewRGBA(image.Rect(0, 0, size, size))
	f := size / len(g)
	pad := (size - f*len(g)) / 2
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			img.Set(x, y, bg)
		}
	}
	for y, row := range g {
		for x, c := range row {
			for dy := 0; dy < f; dy++ {
				for dx := 0; dx < f; dx++ {
					img.Set(pad+x*f+dx, pad+y*f+dy, c)
				}
			}
		}
	}
	return img
}

func pngBytes(img image.Image) []byte {
	var b bytes.Buffer
	if err := png.Encode(&b, img); err != nil {
		log.Fatal(err)
	}
	return b.Bytes()
}

// ico packs PNG images into an .ico file (PNG entries work on Windows Vista and later).
func ico(sizes []int, images [][]byte) []byte {
	var b bytes.Buffer
	binary.Write(&b, binary.LittleEndian, [3]uint16{0, 1, uint16(len(images))})
	offset := 6 + 16*len(images)
	for i, data := range images {
		dim := byte(sizes[i])
		if sizes[i] >= 256 {
			dim = 0 // 0 means 256
		}
		b.Write([]byte{dim, dim, 0, 0})
		binary.Write(&b, binary.LittleEndian, []uint16{1, 32})
		binary.Write(&b, binary.LittleEndian, []uint32{uint32(len(data)), uint32(offset)})
		offset += len(data)
	}
	for _, data := range images {
		b.Write(data)
	}
	return b.Bytes()
}

func main() {
	icon := readIcon()
	sizes := []int{16, 32, 48, 256}
	var images, res [][]byte
	for _, s := range sizes {
		img := draw(grid(icon, s >= 40), s)
		images = append(images, pngBytes(img))
		if s >= 256 {
			res = append(res, pngBytes(img))
		} else {
			res = append(res, dib(img))
		}
	}
	must(os.WriteFile("desktop/icon.png", images[len(images)-1], 0o644))
	must(os.WriteFile("desktop/icon.ico", ico(sizes, images), 0o644))
	for _, arch := range []string{"amd64", "arm64"} {
		must(os.WriteFile("desktop/rsrc_windows_"+arch+".syso", syso(arch, sizes, res), 0o644))
	}
}

func must(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
