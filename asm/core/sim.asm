; The qubit simulator of the assembler Qubit Quest: a state vector of complex doubles and the
; gates of the game, in x86-64 with SSE2. It does what src/sim.js does (the reference, itself
; checked against Qiskit); tests/test_asm.py runs every case of tests/sim_cases.json through it.
;
; A state of n qubits is 2^n amplitudes, each two doubles (real, imaginary) = 16 bytes.
; Qubit q is bit (n-1-q) of the index: qubit 0 is the LEFT digit of a ket, as in the game.
;
; An op is 4 bytes: gate, a, b, c (the wires). Gates are the G_* numbers below; a gate number
; G_BOX+k runs black box k from the box table (ops pointer, op count, per box).
;
; Calling convention of the whole core (both systems): arguments in rdi, rsi, rdx, rcx, r8,
; r9, result in rax / xmm0; rbx, rbp, r12-r15 are kept. No red zone.

bits 64
default rel

%include "core/sim.inc"

section .rodata
align 16
R2:     dq 0.70710678118654752440
ONE:    dq 1.0
EPS:    dq 1.0e-6
align 16
ABSMASK: dq 0x7fffffffffffffff, 0x7fffffffffffffff

; 2x2 matrices [a b; c d], each entry (re, im), for gates 1..8 (X Y Z H S SDG T TDG)
align 16
MATS:
    dq 0.0,0.0,  1.0,0.0,  1.0,0.0,  0.0,0.0                   ; X
    dq 0.0,0.0,  0.0,-1.0, 0.0,1.0,  0.0,0.0                   ; Y
    dq 1.0,0.0,  0.0,0.0,  0.0,0.0,  -1.0,0.0                  ; Z
    dq 0.70710678118654752440,0.0, 0.70710678118654752440,0.0
    dq 0.70710678118654752440,0.0, -0.70710678118654752440,0.0 ; H
    dq 1.0,0.0,  0.0,0.0,  0.0,0.0,  0.0,1.0                   ; S
    dq 1.0,0.0,  0.0,0.0,  0.0,0.0,  0.0,-1.0                  ; SDG
    dq 1.0,0.0,  0.0,0.0,  0.0,0.0
    dq 0.70710678118654752440,0.70710678118654752440           ; T
    dq 1.0,0.0,  0.0,0.0,  0.0,0.0
    dq 0.70710678118654752440,-0.70710678118654752440          ; TDG

section .text

; mask of qubit q (ecx) among n (esi) -> eax = 1 << (n-1-q); uses ecx
%macro QMASK 2 ; dest, qubit register (32-bit)
    mov ecx, esi
    dec ecx
    sub ecx, %2
    mov %1, 1
    shl %1, cl
%endmacro

; qs_zero(state rdi, n esi): |00..0>

FN qs_zero
    mov ecx, esi
    mov eax, 1
    shl eax, cl                 ; 2^n amplitudes
    shl eax, 1                  ; 2 doubles each
    mov ecx, eax
    xor eax, eax
    push rdi
    rep stosq
    pop rdi
    mov rax, [ONE]
    mov [rdi], rax
    ret

; qs_apply(state rdi, n esi, op rdx): one gate (not a box)

FN qs_apply
    push rbx
    push r12
    push r13
    push r14
    push r15
    movzx eax, byte [rdx]       ; gate
    movzx r12d, byte [rdx+1]    ; a
    movzx r13d, byte [rdx+2]    ; b
    movzx r14d, byte [rdx+3]    ; c
    mov ecx, esi
    mov r15d, 1
    shl r15d, cl                ; dimension
    cmp eax, G_TDG
    jbe .one
    cmp eax, G_CX
    je .cx
    cmp eax, G_CCX
    je .ccx
    cmp eax, G_SWAP
    je .swap
    cmp eax, G_CZ
    jb .done
    cmp eax, G_CSDG
    ja .done
    ; CZ, CS, CSDG: multiply the amplitudes with a = b = 1 by -1, i, -i
    QMASK r8d, r12d
    QMASK r9d, r13d
    or r8d, r9d                 ; both bits
    mov r11d, eax
    xor ebx, ebx
.cp_loop:
    mov r10d, ebx
    and r10d, r8d
    cmp r10d, r8d
    jne .cp_next
    mov r10, rbx
    shl r10, 4
    movsd xmm0, [rdi+r10]       ; re
    movsd xmm1, [rdi+r10+8]     ; im
    xorpd xmm2, xmm2
    cmp r11d, G_CZ
    jne .cp_s
    subsd xmm2, xmm0            ; -re
    movsd [rdi+r10], xmm2
    xorpd xmm2, xmm2
    subsd xmm2, xmm1            ; -im
    movsd [rdi+r10+8], xmm2
    jmp .cp_next
.cp_s:
    cmp r11d, G_CS
    jne .cp_sdg
    subsd xmm2, xmm1            ; i * (re + i im) = -im + i re
    movsd [rdi+r10], xmm2
    movsd [rdi+r10+8], xmm0
    jmp .cp_next
.cp_sdg:                        ; -i * (re + i im) = im - i re
    subsd xmm2, xmm0
    movsd [rdi+r10], xmm1
    movsd [rdi+r10+8], xmm2
.cp_next:
    inc ebx
    cmp ebx, r15d
    jb .cp_loop
    jmp .done

.cx:                            ; flip b where a = 1
    QMASK r8d, r12d             ; controls
    mov r14d, r13d              ; target
    jmp .flip
.ccx:                           ; flip c where a = b = 1
    QMASK r8d, r12d
    QMASK r9d, r13d
    or r8d, r9d
.flip:
    QMASK r9d, r14d             ; target mask
    xor ebx, ebx
.fl_loop:
    mov r10d, ebx
    and r10d, r8d
    cmp r10d, r8d
    jne .fl_next
    test ebx, r9d
    jnz .fl_next
    mov r10d, ebx
    mov r11d, ebx
    or r11d, r9d
    call swap_amps
.fl_next:
    inc ebx
    cmp ebx, r15d
    jb .fl_loop
    jmp .done

.swap:                          ; exchange a and b: each pair once, a set and b clear
    QMASK r8d, r12d
    QMASK r9d, r13d
    xor ebx, ebx
.sw_loop:
    test ebx, r8d
    jz .sw_next
    test ebx, r9d
    jnz .sw_next
    mov r10d, ebx
    mov r11d, ebx
    xor r11d, r8d
    xor r11d, r9d
    call swap_amps
.sw_next:
    inc ebx
    cmp ebx, r15d
    jb .sw_loop
    jmp .done

.one:                           ; [a b; c d] on qubit a
    test eax, eax
    jz .done
    dec eax
    shl eax, 6                  ; 64 bytes per matrix
    lea r11, [MATS]
    add r11, rax
    QMASK r8d, r12d
    xor ebx, ebx
.one_loop:
    test ebx, r8d
    jnz .one_next
    mov r9, rbx
    shl r9, 4                   ; x = state[i]
    mov r10d, ebx
    or r10d, r8d
    shl r10, 4                  ; y = state[i | mask]
    movsd xmm0, [rdi+r9]        ; xr
    movsd xmm1, [rdi+r9+8]      ; xi
    movsd xmm2, [rdi+r10]       ; yr
    movsd xmm3, [rdi+r10+8]     ; yi
    ; new x = a*x + b*y
    lea rax, [r11]
    call cmul2
    movsd [rdi+r9], xmm4
    movsd [rdi+r9+8], xmm5
    ; new y = c*x + d*y
    lea rax, [r11+32]
    call cmul2
    movsd [rdi+r10], xmm4
    movsd [rdi+r10+8], xmm5
.one_next:
    inc ebx
    cmp ebx, r15d
    jb .one_loop

.done:
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbx
    ret

; xmm4 + i xmm5 = m0 * (xmm0 + i xmm1) + m1 * (xmm2 + i xmm3), m0 = [rax], m1 = [rax+16]
; keeps xmm0..xmm3; uses xmm6, xmm7
cmul2:
    movsd xmm4, [rax]           ; m0r
    mulsd xmm4, xmm0
    movsd xmm6, [rax+8]         ; m0i
    mulsd xmm6, xmm1
    subsd xmm4, xmm6            ; m0r xr - m0i xi
    movsd xmm6, [rax+16]        ; m1r
    mulsd xmm6, xmm2
    addsd xmm4, xmm6
    movsd xmm6, [rax+24]        ; m1i
    mulsd xmm6, xmm3
    subsd xmm4, xmm6
    movsd xmm5, [rax]
    mulsd xmm5, xmm1            ; m0r xi
    movsd xmm6, [rax+8]
    mulsd xmm6, xmm0            ; m0i xr
    addsd xmm5, xmm6
    movsd xmm6, [rax+16]
    mulsd xmm6, xmm3            ; m1r yi
    addsd xmm5, xmm6
    movsd xmm6, [rax+24]
    mulsd xmm6, xmm2            ; m1i yr
    addsd xmm5, xmm6
    ret

; exchange amplitudes r10d and r11d of the state at rdi
swap_amps:
    shl r10, 4
    shl r11, 4
    movupd xmm0, [rdi+r10]
    movupd xmm1, [rdi+r11]
    movupd [rdi+r10], xmm1
    movupd [rdi+r11], xmm0
    ret

; qs_run(state rdi, n esi, ops rdx, count ecx, boxes r8): run ops in order; boxes is a table
; of {ops pointer (8 bytes), count (8 bytes)} per box, or 0

FN qs_run
    push rbx
    push rbp
    push r12
    push r13
    push r14
    sub rsp, 8
    mov rbx, rdx
    mov ebp, ecx
    mov r12, rdi
    mov r13d, esi
    mov r14, r8
.loop:
    test ebp, ebp
    jz .end
    movzx eax, byte [rbx]
    cmp eax, G_BOX
    jb .gate
    sub eax, G_BOX
    test r14, r14
    jz .next
    shl rax, 4
    mov rdx, [r14+rax]
    mov rcx, [r14+rax+8]
    mov rdi, r12
    mov esi, r13d
    mov r8, r14
    call qs_run
    jmp .next
.gate:
    mov rdi, r12
    mov esi, r13d
    mov rdx, rbx
    call qs_apply
.next:
    add rbx, 4
    dec ebp
    jmp .loop
.end:
    add rsp, 8
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; qs_prob(state rdi, i esi) -> xmm0 = |amplitude i|^2

FN qs_prob
    mov eax, esi
    shl rax, 4
    movsd xmm0, [rdi+rax]
    mulsd xmm0, xmm0
    movsd xmm1, [rdi+rax+8]
    mulsd xmm1, xmm1
    addsd xmm0, xmm1
    ret

; qs_same(a rdi, b rsi, n edx) -> eax = 1 if a and b are the same state up to a global
; phase: | <a|b> | = 1 within EPS

FN qs_same
    mov ecx, edx
    mov eax, 1
    shl eax, cl
    xorpd xmm0, xmm0            ; re of sum conj(a) b
    xorpd xmm1, xmm1            ; im
    xor ecx, ecx
.loop:
    mov rdx, rcx
    shl rdx, 4
    movsd xmm2, [rdi+rdx]       ; ar
    movsd xmm3, [rdi+rdx+8]     ; ai
    movsd xmm4, [rsi+rdx]       ; br
    movsd xmm5, [rsi+rdx+8]     ; bi
    movsd xmm6, xmm2
    mulsd xmm6, xmm4
    addsd xmm0, xmm6            ; + ar br
    movsd xmm6, xmm3
    mulsd xmm6, xmm5
    addsd xmm0, xmm6            ; + ai bi
    movsd xmm6, xmm2
    mulsd xmm6, xmm5
    addsd xmm1, xmm6            ; + ar bi
    movsd xmm6, xmm3
    mulsd xmm6, xmm4
    subsd xmm1, xmm6            ; - ai br
    inc ecx
    cmp ecx, eax
    jb .loop
    mulsd xmm0, xmm0
    mulsd xmm1, xmm1
    addsd xmm0, xmm1
    sqrtsd xmm0, xmm0
    subsd xmm0, [ONE]
    andpd xmm0, [ABSMASK]
    xor eax, eax
    comisd xmm0, [EPS]
    setb al
    ret

; reduced(state rdi, n esi, keep edx = mask of kept qubits, rho rcx): the reduced density
; matrix of the kept qubits (in ascending qubit order), d x d complex, d = 2^(kept count)
; rho[a][b] = sum over i, j with the same other bits of x_i conj(x_j)
reduced:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    mov r12, rdi
    mov r13d, esi
    mov r14d, edx               ; keep mask over qubits (bit q = qubit q)
    mov r15, rcx
    ; index-bit mask of the kept qubits, and d
    xor ebp, ebp                ; kept index bits
    xor r8d, r8d                ; kept count
    xor r9d, r9d                ; q
.km:
    cmp r9d, r13d
    jae .km_done
    bt r14d, r9d
    jnc .km_next
    mov ecx, r13d
    dec ecx
    sub ecx, r9d
    mov eax, 1
    shl eax, cl
    or ebp, eax
    inc r8d
.km_next:
    inc r9d
    jmp .km
.km_done:
    mov ecx, r8d
    mov eax, 1
    shl eax, cl
    mov r10d, eax               ; d
    imul eax, eax
    shl eax, 1                  ; d*d complex = 2 d^2 doubles
    mov ecx, eax
    mov rdi, r15
    xor eax, eax
    rep stosq
    mov ecx, r13d
    mov ebx, 1
    shl ebx, cl                 ; dimension
    xor r8d, r8d                ; i
.i_loop:
    xor r9d, r9d                ; j
.j_loop:
    mov eax, r8d
    xor eax, r9d
    mov edx, ebp
    not edx
    test eax, edx               ; other bits differ?
    jnz .j_next
    ; a = kept bits of i packed (ascending qubit order = descending index bit), b likewise
    mov edi, r8d
    call pack
    mov r11d, eax               ; a
    mov edi, r9d
    call pack                   ; b in eax
    imul r11d, r10d
    add r11d, eax
    shl r11, 4                  ; offset of rho[a][b]
    mov eax, r8d
    shl rax, 4
    mov edx, r9d
    shl rdx, 4
    movsd xmm0, [r12+rax]       ; xr
    movsd xmm1, [r12+rax+8]     ; xi
    movsd xmm2, [r12+rdx]       ; yr
    movsd xmm3, [r12+rdx+8]     ; yi
    movsd xmm4, xmm0
    mulsd xmm4, xmm2
    movsd xmm5, xmm1
    mulsd xmm5, xmm3
    addsd xmm4, xmm5            ; xr yr + xi yi
    addsd xmm4, [r15+r11]
    movsd [r15+r11], xmm4
    movsd xmm4, xmm1
    mulsd xmm4, xmm2
    movsd xmm5, xmm0
    mulsd xmm5, xmm3
    subsd xmm4, xmm5            ; xi yr - xr yi
    addsd xmm4, [r15+r11+8]
    movsd [r15+r11+8], xmm4
.j_next:
    inc r9d
    cmp r9d, ebx
    jb .j_loop
    inc r8d
    cmp r8d, ebx
    jb .i_loop
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; pack: eax = the bits of index edi at the kept qubits (r14d mask, n = r13d), qubit 0 first
pack:
    xor eax, eax
    xor ecx, ecx                ; q
.p:
    cmp ecx, r13d
    jae .p_done
    bt r14d, ecx
    jnc .p_next
    push rcx
    mov edx, edi
    neg ecx
    add ecx, r13d
    dec ecx                     ; index bit n-1-q
    shr edx, cl
    and edx, 1
    pop rcx
    shl eax, 1
    or eax, edx
.p_next:
    inc ecx
    jmp .p
.p_done:
    ret

; qs_matches(state rdi, goal rsi, n edx, keep ecx, flags r8d) -> eax = 1 if the state meets
; the goal: flags & 1 = only the chances count; else keep = 0: the same state up to global
; phase; else the reduced states of the kept qubits (mask) agree entry by entry within EPS

FN qs_matches
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 2*8*8*16 + 8       ; two 8x8 complex matrices (up to 3 kept qubits)
    mov r12, rdi
    mov r13, rsi
    mov r14d, edx
    mov r15d, ecx
    test r8d, 1
    jnz .probs
    test r15d, r15d
    jnz .reduced
    mov rdi, r12
    mov rsi, r13
    mov edx, r14d
    call qs_same
    jmp .out
.probs:
    mov ecx, r14d
    mov ebx, 1
    shl ebx, cl
    xor ebp, ebp
.pl:
    mov rdi, r12
    mov esi, ebp
    call qs_prob
    movsd xmm7, xmm0
    mov rdi, r13
    mov esi, ebp
    call qs_prob
    subsd xmm7, xmm0
    andpd xmm7, [ABSMASK]
    comisd xmm7, [EPS]
    jae .no
    inc ebp
    cmp ebp, ebx
    jb .pl
    mov eax, 1
    jmp .out
.reduced:
    mov rdi, r12
    mov esi, r14d
    mov edx, r15d
    lea rcx, [rsp]
    call reduced
    mov rdi, r13
    mov esi, r14d
    mov edx, r15d
    lea rcx, [rsp + 8*8*16]
    call reduced
    popcnt ecx, r15d
    mov ebx, 1
    shl ebx, cl
    imul ebx, ebx               ; d^2 entries
    xor ebp, ebp
.rl:
    mov rax, rbp
    shl rax, 4
    movsd xmm0, [rsp+rax]
    subsd xmm0, [rsp+rax + 8*8*16]
    movsd xmm1, [rsp+rax+8]
    subsd xmm1, [rsp+rax+8 + 8*8*16]
    mulsd xmm0, xmm0
    mulsd xmm1, xmm1
    addsd xmm0, xmm1
    sqrtsd xmm0, xmm0
    comisd xmm0, [EPS]
    jae .no
    inc ebp
    cmp ebp, ebx
    jb .rl
    mov eax, 1
    jmp .out
.no:
    xor eax, eax
.out:
    add rsp, 2*8*8*16 + 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret
