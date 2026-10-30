; Drawing: the 320 x 200 frame buffer every screen is drawn into (the platform layer shows
; it scaled by a whole number, no smoothing), rectangles, the pixel font, word wrap.
; Pixels are 0x00RRGGBB.

bits 64
default rel

%include "core/data.inc"
%include "core/sim.inc"
%include "core/gfx.inc"

extern GLYPHS, ASCII

section .bss
alignb 16
FN_DATA fb, FB_W * FB_H * 4
FN_DATA text_px, 4              ; font pixel size (1, 2, 3)

section .text

; gfx_fill(color edi): the whole frame buffer
FN gfx_fill
    mov eax, edi
    lea rdi, [fb]
    mov ecx, FB_W * FB_H
    rep stosd
    ret

; gfx_rect(x edi, y esi, w edx, h ecx, color r8d), clipped to the screen
FN gfx_rect
    ; clip: x0 = max(x, 0), x1 = min(x + w, FB_W), same for y
    lea eax, [rdi + rdx]        ; x1
    lea r9d, [rsi + rcx]        ; y1
    test edi, edi
    jns .x0
    xor edi, edi
.x0:
    test esi, esi
    jns .y0
    xor esi, esi
.y0:
    cmp eax, FB_W
    jle .x1
    mov eax, FB_W
.x1:
    cmp r9d, FB_H
    jle .y1
    mov r9d, FB_H
.y1:
    sub eax, edi                ; width
    jle .out
    sub r9d, esi                ; height
    jle .out
    imul esi, esi, FB_W
    add esi, edi
    lea r10, [fb]
    lea r10, [r10 + rsi*4]      ; first pixel
    mov r11d, eax
.row:
    mov rdi, r10
    mov ecx, r11d
    mov eax, r8d
    rep stosd
    add r10, FB_W * 4
    dec r9d
    jnz .row
.out:
    ret

; gfx_pixel(x edi, y esi, color edx)
FN gfx_pixel
    cmp edi, FB_W
    jae .out
    cmp esi, FB_H
    jae .out
    imul esi, esi, FB_W
    add esi, edi
    lea rax, [fb]
    mov [rax + rsi*4], edx
.out:
    ret

; gfx_line(x0 edi, y0 esi, x1 edx, y1 ecx, color r8d): Bresenham
FN gfx_line
    push rbx
    push r12
    push r13
    push r14
    push r15
    mov r12d, edx               ; x1
    mov r13d, ecx               ; y1
    mov r14d, edx
    sub r14d, edi               ; dx
    mov eax, r14d
    neg eax
    cmovns r14d, eax            ; |dx|
    mov r9d, 1
    cmp edi, r12d
    jl .sx
    mov r9d, -1
.sx:
    mov r15d, ecx
    sub r15d, esi
    mov eax, r15d
    neg eax
    cmovs eax, r15d
    neg eax                     ; -|dy|
    mov r15d, eax
    mov r10d, 1
    cmp esi, r13d
    jl .sy
    mov r10d, -1
.sy:
    lea ebx, [r14 + r15]        ; err = dx + dy
.loop:
    push rdi
    push rsi
    push r9
    push r10
    mov edx, r8d
    call gfx_pixel
    pop r10
    pop r9
    pop rsi
    pop rdi
    cmp edi, r12d
    jne .step
    cmp esi, r13d
    je .done
.step:
    lea eax, [rbx + rbx]        ; e2
    cmp eax, r15d
    jl .noy
    add ebx, r15d
    add edi, r9d
.noy:
    cmp eax, r14d
    jg .loop
    add ebx, r14d
    add esi, r10d
    jmp .loop
.done:
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbx
    ret

; gfx_glyph(x edi, y esi, glyph edx, color ecx): one character, text_px pixels per dot
FN gfx_glyph
    push rbx
    push r12
    push r13
    push r14
    push r15
    push rbp
    sub rsp, 8
    mov r12d, edi
    mov r13d, esi
    mov r15d, ecx
    imul edx, edx, GLYPH_ROWS
    lea rbx, [GLYPHS]
    add rbx, rdx
    xor r14d, r14d              ; row
.row:
    movzx ebp, byte [rbx + r14]
    test ebp, ebp
    jz .next_row
    mov ecx, 4                  ; column 0 is bit 4
.col:
    bt ebp, ecx
    jnc .next_col
    push rcx
    mov eax, 4
    sub eax, ecx
    imul eax, [text_px]
    lea edi, [r12 + rax]
    mov eax, r14d
    imul eax, [text_px]
    lea esi, [r13 + rax]
    mov edx, [text_px]
    mov ecx, edx
    mov r8d, r15d
    call gfx_rect
    pop rcx
.next_col:
    dec ecx
    jns .col
.next_row:
    inc r14d
    cmp r14d, GLYPH_ROWS
    jb .row
    add rsp, 8
    pop rbp
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbx
    ret

; gfx_text(x edi, y esi, string rdx, color ecx, shadow r8d, count r9d): draws up to count
; glyphs (-1: all) of a string, stopping at its end or a new line; a shadow colour of
; NO_SHADOW draws none. Returns eax = the x after the text.
FN gfx_text
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    mov r12d, edi
    mov r13d, esi
    mov rbx, rdx
    mov r14d, ecx
    mov r15d, r9d
    cmp r8d, NO_SHADOW
    je .main
    ; the shadow, one font pixel (at least 1) right and down
    mov ebp, [text_px]
    shr ebp, 1
    jnz .sh
    mov ebp, 1
.sh:
    mov edi, r12d
    add edi, ebp
    mov esi, r13d
    add esi, ebp
    mov rdx, rbx
    mov ecx, r8d
    mov r8d, NO_SHADOW
    mov r9d, r15d
    call gfx_text
.main:
    mov ebp, r12d               ; x
.loop:
    test r15d, r15d
    jz .done
    movzx edx, byte [rbx]
    cmp edx, STR_NL
    jbe .done
    cmp edx, STR_SPACE
    je .adv
    mov edi, ebp
    mov esi, r13d
    mov ecx, r14d
    call gfx_glyph
.adv:
    mov eax, [text_px]
    imul eax, eax, CELL
    add ebp, eax
    inc rbx
    dec r15d
    jmp .loop
.done:
    mov eax, ebp
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; str_len(string rdi) -> eax: glyphs up to the end or a new line
FN str_len
    xor eax, eax
.l:
    cmp byte [rdi + rax], STR_NL
    jbe .e
    inc eax
    jmp .l
.e:
    ret

; text_width(string rdi) -> eax: width in screen pixels at text_px
FN text_width
    call str_len
    test eax, eax
    jz .z
    imul eax, eax, CELL
    dec eax
    imul eax, [text_px]
.z:
    ret

; ascii_to(dest rdi, ascii rsi): copy an ASCII (0-ended) string as glyphs, with STR_END;
; returns rax = the end (at the STR_END), so strings can be built in pieces
FN ascii_to
    lea rdx, [ASCII]
.l:
    movzx eax, byte [rsi]
    test eax, eax
    jz .e
    sub eax, 32
    movzx eax, byte [rdx + rax]
    mov [rdi], al
    inc rdi
    inc rsi
    jmp .l
.e:
    mov byte [rdi], STR_END
    mov rax, rdi
    ret

; num_to(dest rdi, n esi): the decimal digits of n as glyphs, with STR_END; returns the end
FN num_to
    sub rsp, 24
    mov eax, esi
    xor ecx, ecx
    mov r8d, 10
.d:
    xor edx, edx
    div r8d
    add edx, '0'
    mov [rsp + rcx], dl
    inc ecx
    test eax, eax
    jnz .d
    lea r9, [ASCII]
.w:
    dec ecx
    movzx eax, byte [rsp + rcx]
    movzx eax, byte [r9 + rax - 32]
    mov [rdi], al
    inc rdi
    test ecx, ecx
    jnz .w
    mov byte [rdi], STR_END
    mov rax, rdi
    add rsp, 24
    ret

; str_copy(dest rdi, string rsi): copy up to its STR_END; returns the end
FN str_copy
.l:
    mov al, [rsi]
    mov [rdi], al
    test al, al
    jz .e
    inc rdi
    inc rsi
    jmp .l
.e:
    mov rax, rdi
    ret

; Word wrap, as the web game does it: '\n' starts a paragraph; a paragraph's leading spaces
; indent all its lines; lines break at spaces, a word longer than a line stands alone.
; wrap_next(wrapper rdi) -> eax = 1 and the next line in the wrapper, or 0 at the end.
FN wrap_next
    push rbx
    mov rbx, [rdi + WR_PTR]
    test rbx, rbx
    jz .end
    cmp dword [rdi + WR_FRESH], 0
    je .cont
    ; a paragraph starts here: a key point ('>'), or its indent (a formula: 2 or more)
    mov dword [rdi + WR_KIND], 0
    lea rax, [ASCII]
    movzx eax, byte [rax + '>' - 32]
    cmp [rbx], al
    jne .ind0
    mov dword [rdi + WR_KIND], WK_KEY
    inc rbx
.sp0:
    cmp byte [rbx], STR_SPACE
    jne .ind0
    inc rbx
    jmp .sp0
.ind0:
    xor ecx, ecx
.ind:
    cmp byte [rbx + rcx], STR_SPACE
    jne .ind_done
    inc ecx
    jmp .ind
.ind_done:
    mov [rdi + WR_INDENT], ecx
    cmp ecx, 2
    jb .plain
    mov dword [rdi + WR_KIND], WK_FORMULA
.plain:
    add rbx, rcx
    mov dword [rdi + WR_FRESH], 0
    jmp .take
.cont:
    ; continue the paragraph: skip the spaces between words
.skip:
    cmp byte [rbx], STR_SPACE
    jne .take
    inc rbx
    jmp .skip
.take:
    mov [rdi + WR_LINE], rbx
    mov eax, [rdi + WR_INDENT]
    mov [rdi + WR_LINDENT], eax
    mov r8d, [rdi + WR_COLS]
    sub r8d, eax                ; room
    xor ecx, ecx                ; position in the line
    xor edx, edx                ; length up to the last word end that fits
    xor r9d, r9d                ; words taken
.scan:
    movzx eax, byte [rbx + rcx]
    cmp eax, STR_NL
    jbe .word_end
    cmp eax, STR_SPACE
    je .word_end
    inc ecx
    jmp .scan
.word_end:
    ; a word ends at ecx
    cmp ecx, r8d
    jbe .fits
    test r9d, r9d
    jnz .emit                   ; the line is full: emit up to edx
    mov edx, ecx                ; a long word alone
    jmp .emit_after
.fits:
    mov edx, ecx
    inc r9d
    movzx eax, byte [rbx + rcx]
    cmp eax, STR_NL
    jbe .emit_after
    ; skip spaces to the next word (they count only if a word follows on this line)
.sp:
    cmp byte [rbx + rcx], STR_SPACE
    jne .scan
    inc ecx
    jmp .sp
.emit_after:
.emit:
    mov [rdi + WR_LEN], edx
    lea rax, [rbx + rdx]        ; where the next line starts
    movzx ecx, byte [rax]
    cmp ecx, STR_END
    je .last
    cmp ecx, STR_NL
    jne .more
    inc rax                     ; next paragraph
    mov dword [rdi + WR_FRESH], 1
.more:
    mov [rdi + WR_PTR], rax
    mov eax, 1
    pop rbx
    ret
.last:
    mov qword [rdi + WR_PTR], 0
    mov eax, 1
    pop rbx
    ret
.end:
    xor eax, eax
    pop rbx
    ret

; wrap_start(wrapper rdi, string rsi, cols edx)
FN wrap_start
    mov [rdi + WR_PTR], rsi
    mov [rdi + WR_COLS], edx
    mov dword [rdi + WR_FRESH], 1
    mov dword [rdi + WR_INDENT], 0
    mov dword [rdi + WR_KIND], 0
    ret

; wrap_count(string rdi, cols esi) -> eax: how many lines the string wraps to
FN wrap_count
    push rbx
    sub rsp, WR_SIZE
    mov rbx, rdi
    mov edx, esi
    mov rsi, rbx
    mov rdi, rsp
    call wrap_start
    xor ebx, ebx
.l:
    mov rdi, rsp
    call wrap_next
    test eax, eax
    jz .e
    inc ebx
    jmp .l
.e:
    mov eax, ebx
    add rsp, WR_SIZE
    pop rbx
    ret

; draw_wrapped(x edi, y esi, string rdx, cols ecx, color r8d, first line r9d, lines [rsp+8])
; draws `lines` lines from line `first` on, LEADING apart; returns eax = the y after them
FN draw_wrapped
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, WR_SIZE + 8
    mov r12d, edi
    mov r13d, esi
    mov r14d, r8d
    mov r15d, r9d               ; lines to skip
    mov ebp, [rsp + WR_SIZE + 8 + 7*8]  ; lines to draw (the 7th argument, past 6 pushes + return)
    mov rsi, rdx
    mov edx, ecx
    lea rdi, [rsp]
    call wrap_start
.l:
    test ebp, ebp
    jz .e
    lea rdi, [rsp]
    call wrap_next
    test eax, eax
    jz .e
    test r15d, r15d
    jz .draw
    dec r15d
    jmp .l
.draw:
    mov ebx, r14d               ; key points in gold, formulas on a blue band
    cmp dword [rsp + WR_KIND], WK_KEY
    jne .band
    mov ebx, C_GOLD
.band:
    cmp dword [rsp + WR_KIND], WK_FORMULA
    jne .text
    mov edi, r12d
    lea esi, [r13 + 1]
    mov edx, [rsp + WR_COLS]
    imul edx, edx, CELL
    mov ecx, 10
    mov r8d, C_NAVY
    call gfx_rect
    mov edi, r12d
    lea esi, [r13 + 1]
    mov edx, 1
    mov ecx, 10
    mov r8d, C_BLUE
    call gfx_rect
.text:
    mov eax, [rsp + WR_LINDENT]
    imul eax, eax, CELL
    imul eax, [text_px]
    lea edi, [r12 + rax]
    mov esi, r13d
    mov rdx, [rsp + WR_LINE]
    mov ecx, ebx
    mov r8d, SHADOW
    mov r9d, [rsp + WR_LEN]
    call gfx_text
    mov eax, [text_px]
    imul eax, eax, LEADING
    add r13d, eax
    dec ebp
    jmp .l
.e:
    mov eax, r13d
    add rsp, WR_SIZE + 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret
