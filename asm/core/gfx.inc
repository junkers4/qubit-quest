; The screen and the font metrics, shared by the core and the platform layers.

FB_W        equ 320
FB_H        equ 200
CELL        equ 6           ; glyph advance in font pixels
LEADING     equ 11          ; font pixels between two lines
NO_SHADOW   equ 0xff000000
SHADOW      equ 0x3c0808    ; the dark red text shadow

; colours (the BlackBreak palette)
C_BG        equ 0x0d0c0b
C_WHITE     equ 0xf4f0e0
C_GOLD      equ 0xfcc030
C_RED       equ 0xb01818
C_GREEN     equ 0x30c030
C_DIM       equ 0x7a7468
C_BLUE      equ 0x5c5cfc
C_NAVY      equ 0x04042c
C_DARKRED   equ 0x3c0808
C_PURPLE    equ 0xa050e0

; a word wrapper (wrap_start / wrap_next)
WR_PTR      equ 0           ; where the next line starts (0: no more)
WR_LINE     equ 8           ; the line: start
WR_LEN      equ 16          ;   glyphs
WR_LINDENT  equ 20          ;   indent (cells)
WR_COLS     equ 24
WR_INDENT   equ 28          ; indent of the current paragraph
WR_FRESH    equ 32          ; 1: a paragraph starts at WR_PTR
WR_KIND     equ 36          ; the paragraph: 0 plain, WK_KEY ('>' first), WK_FORMULA (indented)
WR_SIZE     equ 40

WK_KEY      equ 1
WK_FORMULA  equ 2

; exported storage: FN_DATA name, bytes
%macro FN_DATA 2
    global %1
%1: resb %2
%endmacro
