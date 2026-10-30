; plat_save / plat_load for the tests: progress lives in memory, so a test can read it,
; change it, and start the game again on it.

bits 64
default rel

%include "core/sim.inc"

section .bss
FN_STORE:
global saved, saved_len
saved:      resb 256
saved_len:  resd 1

section .text

; plat_save(buffer rdi, bytes esi)
FN plat_save
    mov ecx, esi
    mov [saved_len], esi
    mov rsi, rdi
    lea rdi, [saved]
    rep movsb
    ret

; plat_load(buffer rdi, bytes esi) -> eax = bytes read
FN plat_load
    mov ecx, [saved_len]
    cmp ecx, esi
    cmova ecx, esi
    mov eax, ecx
    lea rsi, [saved]
    rep movsb
    ret
