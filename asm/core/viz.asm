; Pictures for the mind's eye: the hardware drawings of the lessons, Bloch spheres seen in
; perspective, turning a vector about a gate's axis (for the animation), and numbers as text.

bits 64
default rel

%include "core/sim.inc"
%include "core/data.inc"
%include "core/gfx.inc"

extern PICS, PIC_COLORS
extern gfx_rect, gfx_pixel, gfx_line, gfx_circle

; the sphere's view, as the lessons describe it: x goes right (|+>), z up (|0>), y comes out
; of the screen towards you (|+i>, drawn down and left)
;   screen x = cx + r (x - VX y),  screen y = cy - r (z - VY y)
section .rodata
align 8
VX:         dq 0.45
VY:         dq 0.35
HALF:       dq 0.5
ONE:        dq 1.0
SMALL:      dq 0.05
STEP:       dq 0.13089969389957471      ; 2 pi / 48
TWO_PI:     dq 6.28318530717958647692
RAD2DEG:    dq 57.295779513082320876
POW10:      dq 1.0, 10.0, 100.0, 1000.0
IPOW10:     dd 1, 10, 100, 1000

C_EQ_FRONT  equ 0x3c3c9c
C_EQ_BACK   equ 0x24244c
C_AXIS      equ 0x1c1c4c
C_SHADE     equ 0x3a3850

section .text

; draw_pic(n edi, x esi, y edx): hardware drawing n (0-based) with its top left at (x, y)
FN draw_pic
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    imul edi, edi, PIC_SIZE
    lea rbx, [PICS]
    add rbx, rdi
    mov r12, [rbx + PIC_DATA]
    mov r13d, [rbx + PIC_W]
    mov r14d, esi               ; left
    mov r15d, edx               ; row y
    xor ebp, ebp                ; x in the row
.l:
    movzx ecx, byte [r12]       ; run length
    movzx eax, byte [r12 + 1]   ; colour
    add r12, 2
    test ecx, ecx
    jz .e
    test eax, eax
    jz .skip
    lea rdx, [PIC_COLORS]
    mov r8d, [rdx + rax*4]
    lea edi, [r14 + rbp]
    mov esi, r15d
    mov edx, ecx
    push rcx
    mov ecx, 1
    call gfx_rect
    pop rcx
.skip:
    add ebp, ecx
    cmp ebp, r13d
    jb .l
    xor ebp, ebp
    inc r15d
    jmp .l
.e:
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; proj: the point (xmm0, xmm1, xmm2) = (x, y, z) on the sphere at (r12d, r13d), radius r14d
; -> eax, edx = screen x, y (keeps xmm0..xmm2)
proj:
    cvtsi2sd xmm5, r14d
    movsd xmm3, xmm1
    mulsd xmm3, [VX]
    movsd xmm4, xmm0
    subsd xmm4, xmm3            ; x - VX y
    mulsd xmm4, xmm5
    cvtsd2si eax, xmm4
    add eax, r12d
    movsd xmm3, xmm1
    mulsd xmm3, [VY]
    movsd xmm4, xmm2
    subsd xmm4, xmm3            ; z - VY y
    mulsd xmm4, xmm5
    cvtsd2si edx, xmm4
    neg edx
    add edx, r13d
    ret

; sphere(cx edi, cy esi, r edx, vector rcx = 3 doubles, outline colour r8d)
FN sphere
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 72                 ; [rsp]: x y z; [rsp+24]: last point; [rsp+32] k; [rsp+40] c s
    mov r12d, edi
    mov r13d, esi
    mov r14d, edx
    mov rbx, rcx
    mov r15d, r8d
    ; the axes, faintly: z up the middle, x across, y towards the viewer
    mov edi, r12d
    mov esi, r13d
    sub esi, r14d
    mov edx, r12d
    mov ecx, r13d
    add ecx, r14d
    mov r8d, C_AXIS
    call gfx_line
    mov edi, r12d
    sub edi, r14d
    mov esi, r13d
    mov edx, r12d
    add edx, r14d
    mov ecx, r13d
    mov r8d, C_AXIS
    call gfx_line
    xorpd xmm0, xmm0
    movsd xmm1, [ONE]
    xorpd xmm2, xmm2
    call proj
    mov edi, r12d
    mov esi, r13d
    mov ecx, edx
    mov edx, eax
    mov r8d, C_AXIS
    call gfx_line
    ; the equator: the front half as a line, the back half dotted
    mov dword [rsp + 32], 0
.eq:
    fild dword [rsp + 32]
    fmul qword [STEP]
    fsincos
    fstp qword [rsp + 40]       ; cos
    fstp qword [rsp + 48]       ; sin
    movsd xmm0, [rsp + 40]
    movsd xmm1, [rsp + 48]
    xorpd xmm2, xmm2
    call proj
    xorpd xmm6, xmm6
    comisd xmm1, xmm6           ; the near half (y >= 0) solid
    jb .back
    cmp dword [rsp + 32], 0
    je .first
    push rax
    push rdx
    mov edi, [rsp + 16 + 24]
    mov esi, [rsp + 16 + 28]
    mov ecx, edx
    mov edx, eax
    mov r8d, C_EQ_FRONT
    call gfx_line
    pop rdx
    pop rax
    jmp .first
.back:
    test dword [rsp + 32], 1
    jnz .first
    mov edi, eax
    mov esi, edx
    mov edx, C_EQ_BACK
    push rax
    push rdi
    push rsi
    sub rsp, 8
    mov edx, C_EQ_BACK
    call gfx_pixel
    add rsp, 8
    pop rsi
    pop rdi
    pop rax
    mov edx, esi
    mov eax, edi
.first:
    mov [rsp + 24], eax
    mov [rsp + 28], edx
    inc dword [rsp + 32]
    cmp dword [rsp + 32], 49
    jb .eq
    ; the outline
    mov edi, r12d
    mov esi, r13d
    mov edx, r14d
    mov ecx, r15d
    call gfx_circle
    ; the poles: |0> on top (bright), |1> below
    mov edi, r12d
    mov esi, r13d
    sub esi, r14d
    dec edi
    dec esi
    mov edx, 3
    mov ecx, 3
    mov r8d, C_WHITE
    call gfx_rect
    mov edi, r12d
    dec edi
    mov esi, r13d
    add esi, r14d
    dec esi
    mov edx, 3
    mov ecx, 3
    mov r8d, C_DIM
    call gfx_rect
    ; the state: a shadow on the equator's plane, a dotted drop to it, the arrow
    movsd xmm0, [rbx]
    movsd xmm1, [rbx + 8]
    movsd xmm2, [rbx + 16]
    movsd xmm6, xmm0
    mulsd xmm6, xmm6
    movsd xmm7, xmm1
    mulsd xmm7, xmm7
    addsd xmm6, xmm7
    movsd xmm7, xmm2
    mulsd xmm7, xmm7
    addsd xmm6, xmm7
    sqrtsd xmm6, xmm6           ; length
    comisd xmm6, [SMALL]
    jb .mixed
    xorpd xmm2, xmm2
    call proj                   ; the shadow
    mov [rsp + 24], eax
    mov [rsp + 28], edx
    lea edi, [rax - 1]
    lea esi, [rdx - 1]
    mov edx, 3
    mov ecx, 3
    mov r8d, C_SHADE
    call gfx_rect
    movsd xmm0, [rbx]
    movsd xmm1, [rbx + 8]
    movsd xmm2, [rbx + 16]
    call proj                   ; the tip
    mov ebp, eax
    mov [rsp + 32], edx
    ; the drop from the tip to the shadow, every other pixel
    mov ecx, [rsp + 28]
.drop:
    cmp ecx, [rsp + 32]
    je .arrow
    test ecx, 1
    jz .dn
    mov edi, [rsp + 24]
    mov esi, ecx
    mov edx, C_SHADE
    push rcx
    sub rsp, 8
    call gfx_pixel
    add rsp, 8
    pop rcx
.dn:
    mov eax, [rsp + 32]
    cmp ecx, eax
    jl .up
    dec ecx
    jmp .drop
.up:
    inc ecx
    jmp .drop
.arrow:
    mov edi, r12d
    mov esi, r13d
    mov edx, ebp
    mov ecx, [rsp + 32]
    mov r8d, C_GREEN
    call gfx_line
    lea edi, [rbp - 1]
    mov esi, [rsp + 32]
    dec esi
    mov edx, 3
    mov ecx, 3
    mov r8d, C_GREEN
    call gfx_rect
    jmp .out
.mixed:                         ; no direction at all: entangled through and through
    lea edi, [r12 - 1]
    lea esi, [r13 - 1]
    mov edx, 3
    mov ecx, 3
    mov r8d, C_PURPLE
    call gfx_rect
.out:
    add rsp, 72
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; vec_rotate(v rdi = 3 doubles, in place; axis rsi = 3 doubles, unit; angle xmm0): Rodrigues,
; v' = v cos a + (k x v) sin a + k (k . v)(1 - cos a)
FN vec_rotate
    sub rsp, 24
    movsd [rsp], xmm0
    fld qword [rsp]
    fsincos
    fstp qword [rsp]            ; cos
    fstp qword [rsp + 8]        ; sin
    movsd xmm6, [rsp]           ; c
    movsd xmm7, [rsp + 8]       ; s
    ; k . v
    movsd xmm0, [rsi]
    mulsd xmm0, [rdi]
    movsd xmm1, [rsi + 8]
    mulsd xmm1, [rdi + 8]
    addsd xmm0, xmm1
    movsd xmm1, [rsi + 16]
    mulsd xmm1, [rdi + 16]
    addsd xmm0, xmm1
    movsd xmm5, [ONE]
    subsd xmm5, xmm6
    mulsd xmm5, xmm0            ; (k . v)(1 - c)
    ; k x v = (ky vz - kz vy, kz vx - kx vz, kx vy - ky vx)
    movsd xmm0, [rsi + 8]
    mulsd xmm0, [rdi + 16]
    movsd xmm1, [rsi + 16]
    mulsd xmm1, [rdi + 8]
    subsd xmm0, xmm1            ; cx
    movsd xmm1, [rsi + 16]
    mulsd xmm1, [rdi]
    movsd xmm2, [rsi]
    mulsd xmm2, [rdi + 16]
    subsd xmm1, xmm2            ; cy
    movsd xmm2, [rsi]
    mulsd xmm2, [rdi + 8]
    movsd xmm3, [rsi + 8]
    mulsd xmm3, [rdi]
    subsd xmm2, xmm3            ; cz
%macro ROT 2 ; component offset, cross product register: v'[c] = v c + (k x v) s + k (k.v)(1-c)
    movsd xmm3, [rdi + %1]
    mulsd xmm3, xmm6
    movsd xmm4, %2
    mulsd xmm4, xmm7
    addsd xmm3, xmm4
    movsd xmm4, [rsi + %1]
    mulsd xmm4, xmm5
    addsd xmm3, xmm4
    movsd [rsp + %1], xmm3      ; v is still read by the other components
%endmacro
    ROT 0, xmm0
    ROT 8, xmm1
    ROT 16, xmm2
    movsd xmm0, [rsp]
    movsd [rdi], xmm0
    movsd xmm0, [rsp + 8]
    movsd [rdi + 8], xmm0
    movsd xmm0, [rsp + 16]
    movsd [rdi + 16], xmm0
    add rsp, 24
    ret

; fmt_num(dest rdi, value xmm0, decimals esi (0..3), signed edx) -> rax = the end (at its 0):
; the value as ASCII, rounded, e.g. "+0.707", "-1.00", "50.0"
FN fmt_num
    push rbx
    lea rax, [POW10]
    movsd xmm1, [rax + rsi*8]
    movsd xmm2, xmm0
    xorpd xmm3, xmm3
    xor r8d, r8d                ; negative?
    comisd xmm2, xmm3
    jae .pos
    mov r8d, 1
    subsd xmm3, xmm2
    movsd xmm2, xmm3
.pos:
    mulsd xmm2, xmm1
    cvtsd2si eax, xmm2          ; |value| * 10^d, rounded
    test eax, eax
    jnz .s
    xor r8d, r8d                ; no "-0.000"
.s:
    test edx, edx
    jz .int
    mov byte [rdi], '+'
    test r8d, r8d
    jz .sg
    mov byte [rdi], '-'
.sg:
    inc rdi
.int:
    cvttsd2si ecx, xmm1         ; 10^d
    xor edx, edx
    div ecx                     ; eax = whole part, edx = fraction
    mov ebx, edx
    ; the whole part
    sub rsp, 16
    xor ecx, ecx
    mov r10d, 10
.d:
    xor edx, edx
    div r10d
    add dl, '0'
    mov [rsp + rcx], dl
    inc ecx
    test eax, eax
    jnz .d
.w:
    dec ecx
    mov al, [rsp + rcx]
    mov [rdi], al
    inc rdi
    test ecx, ecx
    jnz .w
    add rsp, 16
    test esi, esi
    jz .end
    mov byte [rdi], '.'
    inc rdi
    ; the fraction, with its leading zeros: digit i = fraction / 10^i mod 10
    mov ecx, esi
.f:
    test ecx, ecx
    jz .end
    dec ecx
    mov eax, ebx
    xor edx, edx
    lea r10, [IPOW10]
    div dword [r10 + rcx*4]
    xor edx, edx
    mov r10d, 10
    div r10d
    add dl, '0'
    mov [rdi], dl
    inc rdi
    jmp .f
.end:
    mov byte [rdi], 0
    mov rax, rdi
    pop rbx
    ret

; fmt_deg(dest rdi, re xmm0, im xmm1) -> rax = the end: the phase angle in whole degrees,
; signed ("+90", "-45", "+180"), ASCII
FN fmt_deg
    sub rsp, 24
    movsd [rsp], xmm1
    movsd [rsp + 8], xmm0
    fld qword [rsp]             ; im
    fld qword [rsp + 8]         ; re
    fpatan                      ; atan2(im, re)
    fmul qword [RAD2DEG]
    fistp dword [rsp + 16]
    mov eax, [rsp + 16]
    cvtsi2sd xmm0, eax
    xor esi, esi
    mov edx, 1
    call fmt_num
    add rsp, 24
    ret

; draw_motion(n edi, x esi, y edx, frame ecx): the moving parts of drawing n at this frame
FN draw_motion
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 56                 ; [rsp] point x, y (doubles); [rsp+16] scratch
    imul edi, edi, PIC_SIZE
    lea rax, [PICS]
    mov rbx, [rax + rdi + PIC_MOTION]
    test rbx, rbx
    jz .out
    mov r12d, esi
    mov r13d, edx
    mov r14d, ecx
    mov ebp, [rbx]              ; parts
    add rbx, 4
.part:
    test ebp, ebp
    jz .out
    ; f = ((t + phase) mod period) / period
    mov eax, r14d
    add eax, [rbx + MO_PHASE]
    xor edx, edx
    div dword [rbx + MO_PERIOD]
    cvtsi2sd xmm0, edx
    cvtsi2sd xmm1, dword [rbx + MO_PERIOD]
    divsd xmm0, xmm1
    movsd [rsp + 16], xmm0      ; f
    mov eax, [rbx + MO_KIND]
    cmp eax, MK_PATH
    je .path
    ; the others turn: w = 2 pi f; cos and sin
    movsd xmm0, [rsp + 16]
    mulsd xmm0, [TWO_PI]
    movsd [rsp + 24], xmm0
    fld qword [rsp + 24]
    fsincos
    fstp qword [rsp + 32]       ; cos
    fstp qword [rsp + 40]       ; sin
    cvtsi2sd xmm2, dword [rbx + MO_POINTS]      ; centre x
    cvtsi2sd xmm3, dword [rbx + MO_POINTS + 4]  ; centre y
    cvtsi2sd xmm4, dword [rbx + MO_POINTS + 8]  ; d x
    cvtsi2sd xmm5, dword [rbx + MO_POINTS + 12] ; d y
    cmp eax, MK_SWING
    je .swing
    cmp eax, MK_SPIN
    je .spin
    ; wobble: c + d sin w
    mulsd xmm4, [rsp + 40]
    mulsd xmm5, [rsp + 40]
    addsd xmm2, xmm4
    addsd xmm3, xmm5
    movsd [rsp], xmm2
    movsd [rsp + 8], xmm3
    jmp .dot
.swing:                         ; a line from c - d cos w to c + d cos w
    mulsd xmm4, [rsp + 32]
    mulsd xmm5, [rsp + 32]
    movsd xmm0, xmm2
    addsd xmm0, xmm4
    movsd xmm1, xmm3
    addsd xmm1, xmm5
    subsd xmm2, xmm4
    subsd xmm3, xmm5
    cvtsd2si edi, xmm2
    cvtsd2si esi, xmm3
    cvtsd2si edx, xmm0
    cvtsd2si ecx, xmm1
    add edi, r12d
    add esi, r13d
    add edx, r12d
    add ecx, r13d
    mov r8d, [rbx + MO_COLOR]
    call gfx_line
    jmp .next
.spin:                          ; a line from c to c + r (cos w, -sin w), and its tip
    movsd xmm0, xmm4
    mulsd xmm0, [rsp + 32]
    addsd xmm0, xmm2
    movsd xmm1, xmm4
    mulsd xmm1, [rsp + 40]
    movsd xmm6, xmm3
    subsd xmm6, xmm1
    cvtsd2si r15d, xmm0
    add r15d, r12d
    cvtsd2si eax, xmm6
    add eax, r13d
    mov [rsp + 48], eax
    cvtsd2si edi, xmm2
    cvtsd2si esi, xmm3
    add edi, r12d
    add esi, r13d
    mov edx, r15d
    mov ecx, eax
    mov r8d, [rbx + MO_COLOR]
    call gfx_line
    lea edi, [r15 - 1]
    mov esi, [rsp + 48]
    dec esi
    mov edx, 2
    mov ecx, 2
    mov r8d, [rbx + MO_COLOR]
    call gfx_rect
    jmp .next
.path:
    ; the total length, then the point that far along
    xorpd xmm7, xmm7
    mov ecx, [rbx + MO_N]
    dec ecx
    lea rsi, [rbx + MO_POINTS]
.len:
    test ecx, ecx
    jz .lend
    call seg_len
    addsd xmm7, xmm0
    add rsi, 8
    dec ecx
    jmp .len
.lend:
    mulsd xmm7, [rsp + 16]      ; how far along
    mov ecx, [rbx + MO_N]
    dec ecx
    lea rsi, [rbx + MO_POINTS]
.walk:
    call seg_len
    cmp ecx, 1
    je .here                    ; the last segment
    comisd xmm7, xmm0
    jbe .here
    subsd xmm7, xmm0
    add rsi, 8
    dec ecx
    jmp .walk
.here:                          ; a + (b - a) min(1, rest / length)
    xorpd xmm1, xmm1
    comisd xmm0, xmm1
    je .u0
    divsd xmm7, xmm0
    movsd xmm1, [ONE]
    minsd xmm7, xmm1
    jmp .u
.u0:
    xorpd xmm7, xmm7
.u:
    cvtsi2sd xmm2, dword [rsi]
    cvtsi2sd xmm3, dword [rsi + 4]
    cvtsi2sd xmm4, dword [rsi + 8]
    cvtsi2sd xmm5, dword [rsi + 12]
    subsd xmm4, xmm2
    subsd xmm5, xmm3
    mulsd xmm4, xmm7
    mulsd xmm5, xmm7
    addsd xmm2, xmm4
    addsd xmm3, xmm5
    movsd [rsp], xmm2
    movsd [rsp + 8], xmm3
.dot:                           ; a square of the part's size, centred
    movsd xmm0, [rsp]
    cvtsd2si edi, xmm0
    movsd xmm0, [rsp + 8]
    cvtsd2si esi, xmm0
    mov eax, [rbx + MO_SIZE]
    shr eax, 1
    sub edi, eax
    sub esi, eax
    add edi, r12d
    add esi, r13d
    mov edx, [rbx + MO_SIZE]
    mov ecx, edx
    mov r8d, [rbx + MO_COLOR]
    call gfx_rect
.next:
    mov eax, [rbx + MO_N]
    lea rbx, [rbx + MO_POINTS + rax*8]
    dec ebp
    jmp .part
.out:
    add rsp, 56
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; xmm0 = the length of the segment from the point at rsi to the next one (keeps rsi, ecx, xmm7)
seg_len:
    cvtsi2sd xmm0, dword [rsi + 8]
    cvtsi2sd xmm1, dword [rsi]
    subsd xmm0, xmm1
    mulsd xmm0, xmm0
    cvtsi2sd xmm1, dword [rsi + 12]
    cvtsi2sd xmm2, dword [rsi + 4]
    subsd xmm1, xmm2
    mulsd xmm1, xmm1
    addsd xmm0, xmm1
    sqrtsd xmm0, xmm0
    ret
