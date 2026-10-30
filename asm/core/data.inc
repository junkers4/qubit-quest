; The layout of the generated game data (asm/gen/data.asm, written by tools/asm-data.js from
; the same levels, font and texts the web game uses). Only data: every rule that works on it
; is in the core.

; strings: glyph numbers, ended by STR_END; STR_NL starts a new paragraph
STR_END     equ 0
STR_NL      equ 1
STR_SPACE   equ 2
GLYPH_ROWS  equ 11          ; 2 accent rows + up to 9 rows (lower case has descenders)

; a level: 32 bytes
LV_TITLE    equ 0           ; string
LV_STEPS    equ 8           ; first step
LV_NSTEPS   equ 16
LV_WORLD    equ 24          ; 0-based
LV_SIZE     equ 32

; a step: 24 qwords
ST_TYPE     equ 0           ; T_TEXT, T_QUIZ, T_CIRCUIT
ST_TITLE    equ 8           ; text: title; quiz: question; circuit: goal
ST_BODY     equ 16          ; text: body; quiz: why (after a right answer)
ST_ELI5     equ 24          ; string
ST_HINT     equ 32          ; circuit: string
ST_OPTS     equ 40          ; quiz: pointer to option strings
ST_NOPTS    equ 48
ST_ANSWER   equ 56          ; 0-based
ST_QUBITS   equ 64
ST_GATES    equ 72          ; circuit: palette, one gate number per byte
ST_NGATES   equ 80
ST_PAR      equ 88
ST_SETUP    equ 96          ; ops (4 bytes each)
ST_NSETUP   equ 104
ST_AFTER    equ 112
ST_NAFTER   equ 120
ST_BOXES    equ 128         ; box table for qs_run: {ops, count} per box
ST_SOL      equ 136
ST_NSOL     equ 144
ST_KEEP     equ 152         ; goal qubits mask (0: the whole state)
ST_FLAGS    equ 160         ; 1: only the chances count
ST_LIMITS   equ 168         ; per palette gate: most uses (255: no limit), bytes
ST_ALLOW    equ 176         ; per palette gate: pointer to wire rules, or 0
ST_BOXNAMES equ 184         ; per box: name string
ST_PIC      equ 192         ; text: hardware drawing number + 1, or 0
ST_DEMO     equ 200         ; text: a demo circuit's ops, or 0
ST_NDEMO    equ 208
ST_DEMOQ    equ 216         ;   its qubits
ST_SIZE     equ 224

; a hardware drawing (PICS): RLE runs within rows, 2 bytes each: length, colour (0: none);
; a run of length 0 ends the drawing
PIC_DATA    equ 0
PIC_W       equ 8
PIC_H       equ 12
PIC_MOTION  equ 16          ; its moving parts, or 0
PIC_SIZE    equ 24

; moving parts (PIC_MOTION): a count, then per part 6 dwords and its points (2 dwords each)
MO_KIND     equ 0           ; MK_* below
MO_COLOR    equ 4
MO_SIZE     equ 8
MO_PERIOD   equ 12          ; frames for one round
MO_PHASE    equ 16
MO_N        equ 20          ; points
MO_POINTS   equ 24
MK_PATH     equ 1           ; a dot along the points
MK_SWING    equ 2           ; a line through point 0, swinging along point 1 (a direction)
MK_SPIN     equ 3           ; a line from point 0 turning, radius = point 1's x
MK_WOBBLE   equ 4           ; a dot about point 0, along point 1

T_TEXT      equ 0
T_QUIZ      equ 1
T_CIRCUIT   equ 2

; a wire rule list (ST_ALLOW): count, then 3 bytes per rule (wires; symmetric gates sorted)
