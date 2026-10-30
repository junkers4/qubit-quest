; Shared by every assembler file: gate numbers, the black-box base, FN, which starts an
; exported function (ELF wants its symbol type, PE does not), and on Linux the note that the
; stack is not executable.

G_X     equ 1
G_Y     equ 2
G_Z     equ 3
G_H     equ 4
G_S     equ 5
G_SDG   equ 6
G_T     equ 7
G_TDG   equ 8
G_CX    equ 9
G_CZ    equ 10
G_CS    equ 11
G_CSDG  equ 12
G_SWAP  equ 13
G_CCX   equ 14
G_BOX   equ 32          ; black box k is gate G_BOX + k

%macro FN 1
%ifidn __OUTPUT_FORMAT__, elf64
    global %1:function
%else
    global %1
%endif
%1:
%endmacro

%ifidn __OUTPUT_FORMAT__, elf64
section .note.GNU-stack noalloc noexec nowrite progbits
%endif
