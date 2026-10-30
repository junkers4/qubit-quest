; Qubit Quest, the game: screens, rules and input, in x86-64 assembler. The same game as the
; web version (src/game.js): a title, a map of the 60 levels in 8 worlds, and in each level
; lesson pages, quizzes and circuit puzzles, with an ELI5 window and hints. The content is
; data from asm/gen/data.asm; the qubits are simulated by core/sim.asm.
;
; The platform layer (linux/ or win/) calls:
;   game_init(flags edi)       once; flag 1 unlocks every level
;   game_key(code edi)         a key (ASCII, or a K_* code)
;   game_click(x edi, y esi)   a click, in screen pixels (0..319, 0..199)
;   game_draw()                draws the screen into fb; then game_quit says whether to quit
; and provides plat_save(buffer rdi, bytes esi) and plat_load(buffer rdi, bytes esi) -> eax.

bits 64
default rel

%include "core/sim.inc"
%include "core/data.inc"
%include "core/gfx.inc"
%include "core/game.inc"

extern LEVELS, LEVEL_COUNT, STEPS, WORLDS, WORLD_COUNT, GATE_LABELS, GATE_TIPS, GATE_KEYS
extern ASCII, ICON, ICON_COLORS
extern fb, text_px
extern gfx_fill, gfx_rect, gfx_text, gfx_line, gfx_pixel, text_width, str_len
extern wrap_count, draw_wrapped, ascii_to, num_to, str_copy
extern qs_zero, qs_run, qs_matches, qs_prob
extern plat_save, plat_load
extern U_TITLE, U_TAGLINE, U_START, U_SELECT, U_QUIT, U_SPINOFF, U_CORE, U_WORLD, U_DONE
extern U_RIGHT, U_WRONG, U_SOLVED, U_STATE, U_PICK2, U_PICKT, U_PICKC2, U_NOTALLOWED
extern U_BOXRAN, U_DONENEXT, U_ELI5TITLE, U_HINT, U_MAPKEYS, U_TEXTKEYS, U_QUIZKEYS
extern U_CIRCKEYS, U_SOLVEDKEYS, U_OVKEYS, U_OVLAST, U_OVERPAR, U_LIMIT, U_FULL, U_PAR

MAXOPS      equ 16
MAXHITS     equ 64
SAVE_BYTES  equ 68              ; "QQS1" + stars of 64 levels

SC_TITLE    equ 0
SC_MAP      equ 1
SC_LEVEL    equ 2
SC_DONE     equ 3

OV_NONE     equ 0
OV_ELI5     equ 1
OV_HINT     equ 2

TEXT_LINES  equ 13              ; lesson lines per page
OV_LINES    equ 12              ; window lines per page
COLS        equ 50              ; characters per screen line
OV_COLS     equ 45

section .rodata
SAVE_MAGIC: db "QQS1"
A_Q0:       db "Q0", 0
A_SLASH:    db "/", 0
A_KET:      db "|000>", 0

section .bss
alignb 16
c_start:    resb 16 * 8         ; up to 3 qubits
c_goal:     resb 16 * 8
c_now:      resb 16 * 8
c_ops:      resb 4 * MAXOPS
save_buf:   resb SAVE_BYTES
stars:      resb 64
tbuf:       resb 256            ; strings built for one draw
hits:       resb 20 * MAXHITS   ; x, y, w, h, code
nhits:      resd 1
FN_DATA game_quit, 4
FN_DATA game_screen, 4
FN_DATA game_level, 4
FN_DATA game_step, 4
FN_DATA game_overlay, 4
FN_DATA game_solved, 4          ; circuit solved / quiz answered right
unlock_all: resd 1
menu_sel:   resd 1
map_world:  resd 1
map_sel:    resd 1
page:       resd 1
pages:      resd 1
pen:        resd 1              ; stars lost in this level
last_stars: resd 1
done_mask:  resq 1              ; steps of this level already done
ov_page:    resd 1
ov_pages:   resd 1
frame:      resd 1
q_tries:    resd 1
q_wrong:    resd 1              ; wrong options picked (bits)
c_nops:     resd 1
c_sel:      resd 1              ; chosen wire
c_pick:     resd 1              ; palette index + 1 of a gate waiting for wires, or 0
c_pickn:    resd 1
c_pickw:    resd 4
c_info:     resq 1              ; string under the palette, or 0

section .text

; ------------------------------------------------------------------ small helpers
%macro RECT 5
    mov edi, %1
    mov esi, %2
    mov edx, %3
    mov ecx, %4
    mov r8d, %5
    call gfx_rect
%endmacro

; TEXT x, y, string (qword), colour: with the shadow, the whole line
%macro TEXT 4
    mov edi, %1
    mov esi, %2
    mov rdx, %3
    mov ecx, %4
    mov r8d, SHADOW
    mov r9d, -1
    call gfx_text
%endmacro

; rax = the current level record
level_ptr:
    mov eax, [game_level]
    shl rax, 5
    lea rdx, [LEVELS]
    add rax, rdx
    ret

; rax = the current step record
step_ptr:
    call level_ptr
    mov rax, [rax + LV_STEPS]
    mov edx, [game_step]
    imul edx, edx, ST_SIZE
    add rax, rdx
    ret

; hit_add(x edi, y esi, w edx, h ecx, code r8d): a clickable box for this frame
hit_add:
    mov eax, [nhits]
    cmp eax, MAXHITS
    jae .out
    imul r9d, eax, 20
    lea r10, [hits]
    add r10, r9
    mov [r10], edi
    mov [r10 + 4], esi
    mov [r10 + 8], edx
    mov [r10 + 12], ecx
    mov [r10 + 16], r8d
    inc eax
    mov [nhits], eax
.out:
    ret

; text_center(y edi, string rsi, colour edx)
text_center:
    push rbx
    push r12
    push r13
    mov r12d, edi
    mov rbx, rsi
    mov r13d, edx
    mov rdi, rsi
    call text_width
    mov edi, FB_W
    sub edi, eax
    sar edi, 1
    mov esi, r12d
    mov rdx, rbx
    mov ecx, r13d
    mov r8d, SHADOW
    mov r9d, -1
    call gfx_text
    pop r13
    pop r12
    pop rbx
    ret

; box(x edi, y esi, w edx, h ecx, fill r8d, border r9d)
box:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    mov r12d, edi
    mov r13d, esi
    mov r14d, edx
    mov r15d, ecx
    mov ebx, r9d
    call gfx_rect               ; the fill
    RECT r12d, r13d, r14d, 1, ebx
    lea ebp, [r13 + r15 - 1]
    RECT r12d, ebp, r14d, 1, ebx
    RECT r12d, r13d, 1, r15d, ebx
    lea ebp, [r12 + r14 - 1]
    RECT ebp, r13d, 1, r15d, ebx
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; the red pixel frame round the screen
draw_frame:
    RECT 0, 0, FB_W, 2, C_RED
    RECT 0, FB_H - 2, FB_W, 2, C_RED
    RECT 0, 0, 2, FB_H, C_RED
    RECT FB_W - 2, 0, 2, FB_H, C_RED
    RECT 2, 2, FB_W - 4, 1, C_DARKRED
    RECT 2, FB_H - 3, FB_W - 4, 1, C_DARKRED
    RECT 2, 2, 1, FB_H - 4, C_DARKRED
    RECT FB_W - 3, 2, 1, FB_H - 4, C_DARKRED
    ret

; footer(string rsi): the key line at the bottom
footer:
    mov rdx, rsi
    TEXT 8, FB_H - 14, rdx, C_DIM
    ret

; stars of the night sky: fixed dots, a few twinkle
draw_sky:
    push rbx
    push r12
    mov ebx, 12345              ; the same sky every frame
    mov r12d, 46
.l:
    imul ebx, ebx, 1103515245
    add ebx, 12345
    mov eax, ebx
    shr eax, 8
    xor edx, edx
    mov ecx, FB_W - 8
    div ecx
    lea edi, [rdx + 4]
    imul ebx, ebx, 1103515245
    add ebx, 12345
    mov eax, ebx
    shr eax, 8
    xor edx, edx
    mov ecx, 150
    div ecx
    lea esi, [rdx + 4]
    mov edx, C_DIM
    mov eax, [frame]
    add eax, r12d
    and eax, 31
    jnz .p
    mov edx, C_WHITE
.p:
    call gfx_pixel
    dec r12d
    jnz .l
    pop r12
    pop rbx
    ret

; the qubit icon at (x edi, y esi), f screen pixels per icon pixel (edx)
draw_icon:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    mov r12d, edi
    mov r13d, esi
    mov r14d, edx
    xor ebx, ebx
.l:
    lea rax, [ICON]
    movzx eax, byte [rax + rbx]
    test eax, eax
    jz .n
    lea rcx, [ICON_COLORS]
    mov r8d, [rcx + rax*4]
    mov eax, ebx
    and eax, 15
    imul eax, r14d
    lea edi, [r12 + rax]
    mov eax, ebx
    shr eax, 4
    imul eax, r14d
    lea esi, [r13 + rax]
    mov edx, r14d
    mov ecx, r14d
    call gfx_rect
.n:
    inc ebx
    cmp ebx, 256
    jb .l
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; draw_stars(x edi, y esi, count edx, size ecx): three squares, gold for those earned
draw_stars:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    sub rsp, 8
    mov r12d, edi
    mov r13d, esi
    mov r14d, edx
    mov ebp, ecx
    xor ebx, ebx
.l:
    mov r8d, C_GOLD
    cmp ebx, r14d
    jb .c
    mov r8d, C_DARKRED
.c:
    lea eax, [rbp + 2]
    imul eax, ebx
    lea edi, [r12 + rax]
    mov esi, r13d
    mov edx, ebp
    mov ecx, ebp
    call gfx_rect
    inc ebx
    cmp ebx, 3
    jb .l
    add rsp, 8
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; eax = 1 if level edi is open to play
unlocked:
    mov eax, 1
    cmp dword [unlock_all], 0
    jne .y
    test edi, edi
    jz .y
    lea rcx, [stars]
    cmp byte [rcx + rdi], 0
    jne .y
    cmp byte [rcx + rdi - 1], 0
    jne .y
    xor eax, eax
.y:
    ret

; eax = the first level with no stars yet (or 0)
first_open:
    xor eax, eax
    lea rcx, [stars]
.l:
    cmp rax, [LEVEL_COUNT]
    jae .none
    cmp byte [rcx + rax], 0
    je .y
    inc eax
    jmp .l
.none:
    xor eax, eax
.y:
    ret

; ------------------------------------------------------------------ save and load
save_progress:
    lea rdi, [save_buf]
    mov eax, [SAVE_MAGIC]
    mov [rdi], eax
    lea rsi, [stars]
    lea rdi, [save_buf + 4]
    mov ecx, 64
    rep movsb
    lea rdi, [save_buf]
    mov esi, SAVE_BYTES
    jmp plat_save

load_progress:
    lea rdi, [save_buf]
    mov esi, SAVE_BYTES
    call plat_load
    cmp eax, SAVE_BYTES
    jne .out
    mov eax, [save_buf]
    cmp eax, [SAVE_MAGIC]
    jne .out
    lea rsi, [save_buf + 4]
    lea rdi, [stars]
    mov ecx, 64
    rep movsb
.out:
    ret

; ------------------------------------------------------------------ the game's rules
FN game_init
    and edi, 1
    mov [unlock_all], edi
    mov dword [game_screen], SC_TITLE
    call load_progress
    ret

start_level:                    ; edi = level
    mov [game_level], edi
    mov dword [game_step], 0
    mov dword [pen], 0
    mov qword [done_mask], 0
    mov dword [game_screen], SC_LEVEL
    mov dword [page], 0
    jmp enter_step

; resets the step's own state; a puzzle gets its start and goal states
enter_step:
    push rbx
    push r12
    push r13
    mov dword [game_overlay], OV_NONE
    mov dword [game_solved], 0
    mov dword [q_tries], 0
    mov dword [q_wrong], 0
    mov dword [c_nops], 0
    mov dword [c_sel], 0
    mov dword [c_pick], 0
    mov qword [c_info], 0
    call step_ptr
    mov rbx, rax
    cmp qword [rbx + ST_TYPE], T_CIRCUIT
    jne .out
    mov r12d, [rbx + ST_QUBITS]
    lea rdi, [c_start]
    mov esi, r12d
    call qs_zero
    lea rdi, [c_start]
    mov esi, r12d
    mov rdx, [rbx + ST_SETUP]
    mov ecx, [rbx + ST_NSETUP]
    mov r8, [rbx + ST_BOXES]
    call qs_run
    lea rsi, [c_start]
    lea rdi, [c_goal]
    mov ecx, 16
    rep movsq
    lea rdi, [c_goal]
    mov esi, r12d
    mov rdx, [rbx + ST_SOL]
    mov ecx, [rbx + ST_NSOL]
    mov r8, [rbx + ST_BOXES]
    call qs_run
    lea rdi, [c_goal]
    mov esi, r12d
    mov rdx, [rbx + ST_AFTER]
    mov ecx, [rbx + ST_NAFTER]
    mov r8, [rbx + ST_BOXES]
    call qs_run
.out:
    pop r13
    pop r12
    pop rbx
    ret

; eax = 1 if the player may go on from this step
can_next:
    mov eax, 1
    mov ecx, [game_step]
    bt qword [done_mask], rcx
    jc .y
    call step_ptr
    cmp qword [rax + ST_TYPE], T_TEXT
    je .yes
    mov eax, [game_solved]
    ret
.yes:
    mov eax, 1
.y:
    ret

go_next:
    call can_next
    test eax, eax
    jz .out
    mov ecx, [game_step]
    bts qword [done_mask], rcx
    call step_ptr
    cmp qword [rax + ST_TYPE], T_TEXT
    jne .step
    mov eax, [page]
    inc eax
    cmp eax, [pages]
    jae .step
    mov [page], eax
    ret
.step:
    call level_ptr
    mov ecx, [game_step]
    inc ecx
    cmp rcx, [rax + LV_NSTEPS]
    jae .finish
    mov [game_step], ecx
    mov dword [page], 0
    jmp enter_step
.finish:                        ; stars = max(1, 3 - pen)
    mov eax, 3
    sub eax, [pen]
    cmp eax, 1
    jge .s
    mov eax, 1
.s:
    mov [last_stars], eax
    mov ecx, [game_level]
    lea rdx, [stars]
    cmp [rdx + rcx], al
    jae .keep
    mov [rdx + rcx], al
.keep:
    mov dword [game_screen], SC_DONE
    call save_progress
.out:
    ret

go_back:
    call step_ptr
    cmp qword [rax + ST_TYPE], T_TEXT
    jne .step
    cmp dword [page], 0
    je .step
    dec dword [page]
    ret
.step:
    cmp dword [game_step], 0
    je .out
    dec dword [game_step]
    call enter_step
    mov dword [page], 999       ; the last page (clamped when drawn)
.out:
    ret

; a quiz answer (edi = option)
answer:
    cmp dword [game_solved], 0
    jne .out
    call step_ptr
    cmp rdi, [rax + ST_NOPTS]
    jae .out
    cmp rdi, [rax + ST_ANSWER]
    jne .wrong
    mov dword [game_solved], 1
    mov ecx, [game_step]
    bts qword [done_mask], rcx
    ret
.wrong:
    bts dword [q_wrong], edi
    cmp dword [q_tries], 0
    jne .t
    inc dword [pen]
.t:
    inc dword [q_tries]
.out:
    ret

; eax = how many wires gate number edi takes (0: a black box)
arity:
    xor eax, eax
    cmp edi, G_BOX
    jae .out
    mov eax, 1
    cmp edi, G_TDG
    jbe .out
    mov eax, 2
    cmp edi, G_SWAP
    jbe .out
    mov eax, 3
.out:
    ret

; eax = 1 for a gate that does not care which wire is which (CZ CS CS† SWAP)
symmetric:
    xor eax, eax
    cmp edi, G_CZ
    jb .out
    cmp edi, G_SWAP
    ja .out
    mov eax, 1
.out:
    ret

; place a gate: palette index edi
place:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    mov r12d, edi
    call step_ptr
    mov rbx, rax
    cmp qword [rbx + ST_TYPE], T_CIRCUIT
    jne .out
    cmp dword [game_solved], 0
    jne .out
    cmp r12, [rbx + ST_NGATES]
    jae .out
    ; room = max(solution, par) + 4
    mov eax, [rbx + ST_NSOL]
    mov ecx, [rbx + ST_PAR]
    cmp eax, ecx
    cmovb eax, ecx
    add eax, 4
    cmp eax, MAXOPS
    jbe .r
    mov eax, MAXOPS
.r:
    cmp [c_nops], eax
    jb .room
    lea rax, [U_FULL]
    mov rax, [rax]
    mov [c_info], rax
    jmp .out
.room:
    mov rax, [rbx + ST_GATES]
    movzx r13d, byte [rax + r12] ; the gate
    ; a limit on this gate?
    mov rax, [rbx + ST_LIMITS]
    movzx ebp, byte [rax + r12]
    cmp ebp, 255
    je .nolimit
    xor ecx, ecx
    xor edx, edx
    lea rsi, [c_ops]
.cnt:
    cmp ecx, [c_nops]
    jae .cnted
    movzx eax, byte [rsi + rcx*4]
    cmp eax, r13d
    jne .cn
    inc edx
.cn:
    inc ecx
    jmp .cnt
.cnted:
    cmp edx, ebp
    jb .nolimit
    lea rax, [U_LIMIT]
    mov rax, [rax]
    mov [c_info], rax
    jmp .out
.nolimit:
    cmp dword [c_pick], 0       ; a second tap cancels the gate waiting for wires
    je .new
    mov dword [c_pick], 0
    mov qword [c_info], 0
    jmp .out
.new:
    mov edi, r13d
    call arity
    mov r14d, eax
    sub rsp, 8
    mov dword [rsp], 0
    mov [rsp], r13b
    test r14d, r14d
    jz .push1                   ; a box: [g]
    cmp r14d, [rbx + ST_QUBITS]
    ja .pop_out
    mov eax, [c_sel]
    mov [rsp + 1], al
    cmp r14d, 1
    je .push1
    cmp dword [rbx + ST_QUBITS], 2
    jne .pick
    ; two wires on two qubits: the other one is the only choice
    mov edi, r13d
    call symmetric
    test eax, eax
    jz .ordered
    mov word [rsp + 1], 0x0100  ; [g, 0, 1]
    jmp .push1
.ordered:
    mov eax, 1
    sub eax, [c_sel]
    mov [rsp + 2], al
.push1:
    mov edi, [rsp]
    mov esi, r12d
    call push_op
    jmp .pop_out
.pick:
    lea eax, [r12 + 1]
    mov [c_pick], eax
    mov eax, [c_sel]
    mov [c_pickw], eax
    mov dword [c_pickn], 1
    mov edi, r13d
    mov esi, 1
    call pick_prompt
.pop_out:
    add rsp, 8
.out:
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; pick_prompt(gate edi, wires chosen esi): what to tap next
pick_prompt:
    lea rax, [U_PICK2]
    cmp edi, G_CX
    jne .c
    lea rax, [U_PICKT]
.c:
    cmp edi, G_CCX
    jne .s
    lea rax, [U_PICKC2]
    cmp esi, 1
    je .s
    lea rax, [U_PICKT]
.s:
    mov rax, [rax]
    mov [c_info], rax
    ret

; a wire tapped (edi): choose it, or give it to the gate waiting for wires
wire:
    push rbx
    push r12
    push r13
    sub rsp, 8
    mov r12d, edi
    call step_ptr
    mov rbx, rax
    cmp qword [rbx + ST_TYPE], T_CIRCUIT
    jne .out
    cmp r12, [rbx + ST_QUBITS]
    jae .out
    cmp dword [c_pick], 0
    jne .give
    mov [c_sel], r12d
    jmp .out
.give:
    mov ecx, [c_pickn]
    xor eax, eax
.in:                            ; already chosen?
    cmp eax, ecx
    jae .add
    lea rdx, [c_pickw]
    cmp [rdx + rax*4], r12d
    je .out
    inc eax
    jmp .in
.add:
    lea rdx, [c_pickw]
    mov [rdx + rcx*4], r12d
    inc ecx
    mov [c_pickn], ecx
    mov eax, [c_pick]
    dec eax
    mov rdx, [rbx + ST_GATES]
    movzx r13d, byte [rdx + rax]
    cmp r13d, G_CCX
    jne .need
    cmp ecx, 2
    jne .need
    cmp dword [rbx + ST_QUBITS], 3
    jne .need
    mov eax, 3                  ; the target is the wire left
    sub eax, [c_pickw]
    sub eax, [c_pickw + 4]
    mov [c_pickw + 8], eax
    mov dword [c_pickn], 3
    mov ecx, 3
.need:
    mov edi, r13d
    call arity
    cmp ecx, eax
    jae .complete
    mov edi, r13d
    mov esi, ecx
    call pick_prompt
    jmp .out
.complete:
    mov r8d, [c_pick]
    dec r8d                     ; palette index
    mov dword [c_pick], 0
    mov eax, [c_pickw]
    mov ecx, [c_pickw + 4]
    mov edx, [c_pickw + 8]
    mov edi, r13d
    push rax
    push rcx
    push rdx
    call symmetric
    mov r9d, eax
    pop rdx
    pop rcx
    pop rax
    cmp r13d, G_CCX
    je .sort
    test r9d, r9d
    jz .build
.sort:                          ; the first two wires in order
    cmp eax, ecx
    jbe .build
    xchg eax, ecx
.build:                         ; op = g | a << 8 | b << 16 | c << 24 (c only for CCX)
    cmp r13d, G_CCX
    je .three
    xor edx, edx
.three:
    mov edi, r13d
    shl eax, 8
    or edi, eax
    shl ecx, 16
    or edi, ecx
    shl edx, 24
    or edi, edx
    mov esi, r8d
    call push_op
.out:
    add rsp, 8
    pop r13
    pop r12
    pop rbx
    ret

; push_op(op edi = 4 bytes, palette index esi): add the gate if the rules allow it
push_op:
    push rbx
    push r12
    push r13
    mov r12d, edi
    mov r13d, esi
    call step_ptr
    mov rbx, rax
    ; the wire rules for this gate
    mov rax, [rbx + ST_ALLOW]
    mov rax, [rax + r13*8]
    test rax, rax
    jz .ok
    movzx r11d, byte [rax]      ; rules
    inc rax
    push rax
    movzx edi, r12b
    call arity
    mov edx, eax                ; wires to compare
    pop rax
.rule:
    test r11d, r11d
    jz .no
    xor r8d, r8d
.w:
    cmp r8d, edx
    jae .ok                     ; every wire matched this rule
    lea ecx, [r8 * 8 + 8]
    mov r9d, r12d
    shr r9d, cl                 ; wire r8 of the op
    and r9d, 0xff
    movzx r10d, byte [rax + r8]
    cmp r9d, r10d
    jne .next
    inc r8d
    jmp .w
.next:
    add rax, 3
    dec r11d
    jmp .rule
.no:
    lea rax, [U_NOTALLOWED]
    mov rax, [rax]
    mov [c_info], rax
    jmp .out
.ok:
    mov eax, [c_nops]
    lea rcx, [c_ops]
    mov [rcx + rax*4], r12d
    inc eax
    mov [c_nops], eax
    ; the tip for the gate
    movzx eax, r12b
    cmp eax, G_BOX
    jb .tip
    lea rax, [U_BOXRAN]
    mov rax, [rax]
    jmp .info
.tip:
    lea rcx, [GATE_TIPS]
    mov rax, [rcx + rax*8]
.info:
    mov [c_info], rax
    call check
.out:
    pop r13
    pop r12
    pop rbx
    ret

; run the circuit into c_now; eax = 1 if it meets the goal
run_now:
    push rbx
    push r12
    call step_ptr
    mov rbx, rax
    mov r12d, [rbx + ST_QUBITS]
    lea rsi, [c_start]
    lea rdi, [c_now]
    mov ecx, 16
    rep movsq
    lea rdi, [c_now]
    mov esi, r12d
    lea rdx, [c_ops]
    mov ecx, [c_nops]
    mov r8, [rbx + ST_BOXES]
    call qs_run
    lea rdi, [c_now]
    mov esi, r12d
    mov rdx, [rbx + ST_AFTER]
    mov ecx, [rbx + ST_NAFTER]
    mov r8, [rbx + ST_BOXES]
    call qs_run
    lea rdi, [c_now]
    lea rsi, [c_goal]
    mov edx, r12d
    mov ecx, [rbx + ST_KEEP]
    mov r8d, [rbx + ST_FLAGS]
    call qs_matches
    pop r12
    pop rbx
    ret

check:
    call run_now
    test eax, eax
    jz .out
    mov dword [game_solved], 1
    mov ecx, [game_step]
    bts qword [done_mask], rcx
    call step_ptr
    mov ecx, [c_nops]
    cmp rcx, [rax + ST_PAR]
    jbe .out
    inc dword [pen]
.out:
    ret

undo:
    cmp dword [c_pick], 0
    je .op
    mov dword [c_pick], 0
    mov qword [c_info], 0
    ret
.op:
    cmp dword [game_solved], 0
    jne .out
    cmp dword [c_nops], 0
    je .out
    dec dword [c_nops]
    mov qword [c_info], 0
.out:
    ret

open_overlay:                   ; edi = OV_ELI5 or OV_HINT
    mov [game_overlay], edi
    mov dword [ov_page], 0
    ret

; ------------------------------------------------------------------ input
FN game_click
    ; the last box drawn under the point wins
    mov eax, [nhits]
    lea r10, [hits]
.l:
    test eax, eax
    jz .none
    dec eax
    imul ecx, eax, 20
    mov edx, [r10 + rcx]
    cmp edi, edx
    jl .l
    add edx, [r10 + rcx + 8]
    cmp edi, edx
    jge .l
    mov edx, [r10 + rcx + 4]
    cmp esi, edx
    jl .l
    add edx, [r10 + rcx + 12]
    cmp esi, edx
    jge .l
    mov edi, [r10 + rcx + 16]
    jmp game_key
.none:
    ret

FN game_key
    push rbx
    push r12
    sub rsp, 8
    mov ebx, edi
    cmp ebx, 'A'                ; letters as lower case
    jb .lc
    cmp ebx, 'Z'
    ja .lc
    add ebx, 32
.lc:
    mov eax, [game_screen]
    cmp eax, SC_TITLE
    je .title
    cmp eax, SC_MAP
    je .map
    cmp eax, SC_DONE
    je .done
    jmp .level

.title:
    cmp ebx, K_UP
    jne .t1
    mov eax, [menu_sel]
    add eax, 2
    xor edx, edx
    mov ecx, 3
    div ecx
    mov [menu_sel], edx
    jmp .out
.t1:
    cmp ebx, K_DOWN
    jne .t2
    mov eax, [menu_sel]
    inc eax
    xor edx, edx
    mov ecx, 3
    div ecx
    mov [menu_sel], edx
    jmp .out
.t2:
    mov eax, ebx
    sub eax, K_ITEM
    cmp eax, 3
    jae .t3
    mov [menu_sel], eax
    jmp .t_go
.t3:
    cmp ebx, K_ENTER
    je .t_go
    cmp ebx, ' '
    jne .out
.t_go:
    mov eax, [menu_sel]
    cmp eax, 0
    jne .t_map
    call first_open
    mov edi, eax
    call start_level
    jmp .out
.t_map:
    cmp eax, 1
    jne .t_quit
    call first_open
    mov [map_sel], eax
    call level_world
    mov [map_world], eax
    mov dword [game_screen], SC_MAP
    jmp .out
.t_quit:
    mov dword [game_quit], 1
    jmp .out

.map:
    mov eax, ebx
    sub eax, K_LEVEL
    cmp rax, [LEVEL_COUNT]
    jae .m0
    mov [map_sel], eax
    jmp .m_go
.m0:
    cmp ebx, K_UP
    jne .m1
    cmp dword [map_sel], 0
    je .out
    dec dword [map_sel]
    jmp .m_world
.m1:
    cmp ebx, K_DOWN
    jne .m2
    mov eax, [map_sel]
    inc eax
    cmp rax, [LEVEL_COUNT]
    jae .out
    mov [map_sel], eax
    jmp .m_world
.m2:
    cmp ebx, K_RIGHT
    jne .m3
    mov eax, [map_world]
    inc eax
    cmp rax, [WORLD_COUNT]
    jae .out
    mov edi, eax
    call world_first
    mov [map_sel], eax
    jmp .m_world
.m3:
    cmp ebx, K_LEFT
    jne .m4
    mov eax, [map_world]
    test eax, eax
    jz .out
    lea edi, [rax - 1]
    call world_first
    mov [map_sel], eax
    jmp .m_world
.m4:
    cmp ebx, K_ESC
    jne .m5
    mov dword [game_screen], SC_TITLE
    jmp .out
.m5:
    cmp ebx, K_ENTER
    je .m_go
    cmp ebx, ' '
    jne .out
.m_go:
    mov edi, [map_sel]
    call unlocked
    test eax, eax
    jz .out
    mov edi, [map_sel]
    call start_level
    jmp .out
.m_world:
    mov eax, [map_sel]
    call level_world
    mov [map_world], eax
    jmp .out

.done:
    cmp ebx, K_ESC
    je .d_map
    cmp ebx, K_ENTER
    je .d_next
    cmp ebx, ' '
    je .d_next
    cmp ebx, K_ITEM
    jne .out
.d_next:
    mov eax, [game_level]
    inc eax
    cmp rax, [LEVEL_COUNT]
    jae .d_map
    mov edi, eax
    call start_level
    jmp .out
.d_map:
    mov eax, [game_level]
    mov [map_sel], eax
    call level_world
    mov [map_world], eax
    mov dword [game_screen], SC_MAP
    jmp .out

.level:
    cmp dword [game_overlay], OV_NONE
    je .lv
    cmp ebx, K_ESC
    je .ov_close
    cmp ebx, K_LEFT
    jne .ov1
    cmp dword [ov_page], 0
    je .out
    dec dword [ov_page]
    jmp .out
.ov1:
    cmp ebx, K_ENTER
    je .ov_next
    cmp ebx, K_RIGHT
    je .ov_next
    cmp ebx, ' '
    je .ov_next
    cmp ebx, K_ITEM
    jne .out
.ov_next:
    mov eax, [ov_page]
    inc eax
    cmp eax, [ov_pages]
    jae .ov_close
    mov [ov_page], eax
    jmp .out
.ov_close:
    mov dword [game_overlay], OV_NONE
    jmp .out

.lv:
    call step_ptr
    mov r12, rax
    cmp ebx, K_ESC
    jne .l1
    mov eax, [game_level]
    mov [map_sel], eax
    call level_world
    mov [map_world], eax
    mov dword [game_screen], SC_MAP
    jmp .out
.l1:
    cmp ebx, K_ENTER
    je .l_next
    cmp ebx, K_RIGHT
    je .l_next
    cmp ebx, K_NEXT
    je .l_next
    cmp ebx, ' '
    jne .l2
    cmp qword [r12 + ST_TYPE], T_CIRCUIT
    je .out
.l_next:
    call go_next
    jmp .out
.l2:
    cmp ebx, K_LEFT
    jne .l3
    call go_back
    jmp .out
.l3:
    cmp ebx, 'e'
    jne .l4
    mov edi, OV_ELI5
    call open_overlay
    jmp .out
.l4:
    mov rax, [r12 + ST_TYPE]
    cmp rax, T_QUIZ
    je .quiz
    cmp rax, T_CIRCUIT
    je .circ
    jmp .out
.quiz:
    mov eax, ebx
    sub eax, '1'
    cmp eax, 4
    jb .q_ans
    mov eax, ebx
    sub eax, K_ITEM
    cmp eax, 4
    jae .out
.q_ans:
    mov edi, eax
    call answer
    jmp .out
.circ:
    cmp ebx, '?'
    jne .c1
    mov edi, OV_HINT
    call open_overlay
    jmp .out
.c1:
    cmp ebx, K_BACK
    je .c_undo
    cmp ebx, 'u'
    jne .c2
.c_undo:
    call undo
    jmp .out
.c2:
    cmp ebx, K_UP
    jne .c3
    cmp dword [c_pick], 0
    jne .out
    mov eax, [c_sel]
    add eax, [r12 + ST_QUBITS]
    dec eax
    xor edx, edx
    div dword [r12 + ST_QUBITS]
    mov [c_sel], edx
    jmp .out
.c3:
    cmp ebx, K_DOWN
    jne .c4
    cmp dword [c_pick], 0
    jne .out
    mov eax, [c_sel]
    inc eax
    xor edx, edx
    div dword [r12 + ST_QUBITS]
    mov [c_sel], edx
    jmp .out
.c4:
    mov eax, ebx
    sub eax, '0'
    cmp eax, 3
    jb .c_wire
    mov eax, ebx
    sub eax, K_WIRE
    cmp eax, 3
    jae .c5
.c_wire:
    mov edi, eax
    call wire
    jmp .out
.c5:
    mov eax, ebx
    sub eax, K_GATE
    cmp eax, 16
    jae .c6
    mov edi, eax
    call place
    jmp .out
.c6:
    ; a key: a black box named by that letter, else the gate with that key
    cmp ebx, 'a'
    jb .out
    cmp ebx, 'z'
    ja .out
    mov rcx, [r12 + ST_BOXNAMES]
    test rcx, rcx
    jz .c_gate
    lea rax, [ASCII]
    movzx r8d, byte [rax + rbx - 32] ; the letter's glyph (upper case)
    xor r9d, r9d                ; palette index
.c_box:
    cmp r9, [r12 + ST_NGATES]
    jae .c_gate
    mov rax, [r12 + ST_GATES]
    movzx eax, byte [rax + r9]
    sub eax, G_BOX
    jb .c_bn
    mov rdx, [rcx + rax*8]      ; the box's name
    movzx edx, byte [rdx]
    cmp edx, r8d
    jne .c_bn
    mov edi, r9d
    call place
    jmp .out
.c_bn:
    inc r9d
    jmp .c_box
.c_gate:
    lea rcx, [GATE_KEYS]
    mov eax, 1
.c_g:                           ; which gate has this key
    cmp eax, G_CCX
    ja .out
    cmp [rcx + rax], bl
    je .c_found
    inc eax
    jmp .c_g
.c_found:
    xor r9d, r9d                ; is it in the palette?
.c_p:
    cmp r9, [r12 + ST_NGATES]
    jae .out
    mov rdx, [r12 + ST_GATES]
    movzx edx, byte [rdx + r9]
    cmp edx, eax
    je .c_place
    inc r9d
    jmp .c_p
.c_place:
    mov edi, r9d
    call place
.out:
    add rsp, 8
    pop r12
    pop rbx
    ret

; eax = the world of level eax
level_world:
    shl rax, 5
    lea rdx, [LEVELS]
    mov rax, [rdx + rax + LV_WORLD]
    ret

; eax = the first level of world edi
world_first:
    xor eax, eax
    lea rdx, [LEVELS]
.l:
    cmp rax, [LEVEL_COUNT]
    jae .n
    mov rcx, rax
    shl rcx, 5
    cmp [rdx + rcx + LV_WORLD], rdi
    je .y
    inc eax
    jmp .l
.n:
    xor eax, eax
.y:
    ret

; ------------------------------------------------------------------ drawing
FN game_draw
    push rbx
    sub rsp, 16
    inc dword [frame]
    mov dword [nhits], 0
    mov dword [text_px], 1
    mov edi, C_BG
    call gfx_fill
    mov eax, [game_screen]
    cmp eax, SC_TITLE
    jne .m
    call draw_title
    jmp .f
.m:
    cmp eax, SC_MAP
    jne .d
    call draw_map
    jmp .f
.d:
    cmp eax, SC_DONE
    jne .l
    call draw_done
    jmp .f
.l:
    call draw_level
.f:
    call draw_frame
    add rsp, 16
    pop rbx
    ret

draw_title:
    push rbx
    push rbp
    push r12
    sub rsp, 16
    call draw_sky
    mov edi, (FB_W - 48) / 2
    mov esi, 10
    mov edx, 3
    call draw_icon
    mov dword [text_px], 3
    lea rsi, [U_TITLE]
    mov rsi, [rsi]
    mov edi, 56
    mov edx, C_GOLD
    call text_center
    mov dword [text_px], 1
    lea rsi, [U_TAGLINE]
    mov rsi, [rsi]
    mov edi, 92
    mov edx, C_WHITE
    call text_center
    ; the menu
    xor ebx, ebx
.item:
    imul ebp, ebx, 16
    add ebp, 108
    mov edi, (FB_W - 120) / 2
    mov esi, ebp
    mov edx, 120
    mov ecx, 13
    mov r8d, C_NAVY
    mov r9d, C_BLUE
    cmp ebx, [menu_sel]
    jne .b
    mov r9d, C_GOLD
.b:
    call box
    mov edi, (FB_W - 120) / 2
    mov esi, ebp
    mov edx, 120
    mov ecx, 13
    lea r8d, [rbx + K_ITEM]
    call hit_add
    lea rax, [U_START]          ; U_START, U_SELECT, U_QUIT are next to each other
    mov rsi, [rax + rbx*8]
.t:
    lea edi, [rbp + 1]
    mov edx, C_WHITE
    cmp ebx, [menu_sel]
    jne .c
    mov edx, C_GOLD
.c:
    call text_center
    inc ebx
    cmp ebx, 3
    jb .item
    lea rsi, [U_SPINOFF]
    mov rsi, [rsi]
    mov edi, 160
    mov edx, C_DIM
    call text_center
    lea rax, [U_CORE]
    mov rdx, [rax]
    TEXT 168, 184, rdx, C_DIM
    add rsp, 16
    pop r12
    pop rbp
    pop rbx
    ret

draw_map:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    sub rsp, 16
    ; "WORLD n: TITLE"
    lea rsi, [U_WORLD]
    mov rsi, [rsi]
    lea rdi, [tbuf]
    call str_copy
    mov rdi, rax
    mov byte [rdi], STR_SPACE
    inc rdi
    mov esi, [map_world]
    inc esi
    call num_to
    mov rdi, rax
    lea rax, [ASCII]
    movzx eax, byte [rax + ':' - 32]
    mov [rdi], al
    mov byte [rdi + 1], STR_SPACE
    add rdi, 2
    mov eax, [map_world]
    lea rcx, [WORLDS]
    mov rsi, [rcx + rax*8]
    call str_copy
    lea rdx, [tbuf]
    TEXT 8, 6, rdx, C_GOLD
    ; the levels of this world
    xor ebx, ebx                ; level
    mov ebp, 22                 ; y
.l:
    cmp rbx, [LEVEL_COUNT]
    jae .e
    mov rax, rbx
    shl rax, 5
    lea rcx, [LEVELS]
    mov eax, [rcx + rax + LV_WORLD]
    cmp eax, [map_world]
    jne .n
    cmp ebx, [map_sel]
    jne .ns
    RECT 6, ebp, FB_W - 12, 11, C_NAVY
.ns:
    mov edi, 6
    mov esi, ebp
    mov edx, FB_W - 12
    mov ecx, 11
    lea r8d, [rbx + K_LEVEL]
    call hit_add
    mov edi, ebx
    call unlocked
    mov r12d, C_WHITE
    test eax, eax
    jnz .op
    mov r12d, C_DIM
.op:
    cmp ebx, [map_sel]
    jne .num
    test eax, eax
    jz .num
    mov r12d, C_GOLD
.num:
    lea rdi, [tbuf]
    lea esi, [rbx + 1]
    call num_to
    lea rdx, [tbuf]
    lea esi, [rbp - 1]
    TEXT 10, esi, rdx, C_DIM
    mov rax, rbx
    shl rax, 5
    lea rcx, [LEVELS]
    mov rdx, [rcx + rax + LV_TITLE]
    lea esi, [rbp - 1]
    TEXT 30, esi, rdx, r12d
    lea rcx, [stars]
    movzx edx, byte [rcx + rbx]
    mov edi, 286
    lea esi, [rbp + 3]
    mov ecx, 5
    call draw_stars
    add ebp, 11
.n:
    inc ebx
    jmp .l
.e:
    lea rsi, [U_MAPKEYS]
    mov rsi, [rsi]
    call footer
    add rsp, 16
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

draw_done:
    push rbx
    sub rsp, 16
    call draw_sky
    mov dword [text_px], 2
    lea rsi, [U_DONE]
    mov rsi, [rsi]
    mov edi, 50
    mov edx, C_GOLD
    call text_center
    mov dword [text_px], 1
    call level_ptr
    mov rsi, [rax + LV_TITLE]
    mov edi, 84
    mov edx, C_WHITE
    call text_center
    mov edi, (FB_W - 46) / 2
    mov esi, 104
    mov edx, [last_stars]
    mov ecx, 14
    call draw_stars
    lea rsi, [U_DONENEXT]
    mov rsi, [rsi]
    mov edi, 140
    mov edx, C_DIM
    call text_center
    mov edi, 0
    mov esi, 0
    mov edx, FB_W
    mov ecx, FB_H
    mov r8d, K_ITEM
    call hit_add
    add rsp, 16
    pop rbx
    ret

; the header of a level: its title, and step / steps
draw_header:
    push rbx
    call level_ptr
    mov rbx, rax
    mov rdx, [rbx + LV_TITLE]
    TEXT 8, 4, rdx, C_GOLD
    lea rdi, [tbuf]
    mov esi, [game_step]
    inc esi
    call num_to
    mov rdi, rax
    lea rsi, [A_SLASH]
    call ascii_to
    mov rdi, rax
    mov esi, [rbx + LV_NSTEPS]
    call num_to
    lea rdi, [tbuf]
    call text_width
    mov edi, FB_W - 8
    sub edi, eax
    lea rdx, [tbuf]
    TEXT edi, 4, rdx, C_DIM
    pop rbx
    ret

draw_level:
    push rbx
    sub rsp, 16
    call draw_header
    call step_ptr
    mov rbx, rax
    mov rax, [rbx + ST_TYPE]
    cmp rax, T_TEXT
    jne .q
    call draw_text_step
    jmp .ov
.q:
    cmp rax, T_QUIZ
    jne .c
    call draw_quiz
    jmp .ov
.c:
    call draw_circuit
.ov:
    cmp dword [game_overlay], OV_NONE
    je .out
    call draw_overlay
.out:
    add rsp, 16
    pop rbx
    ret

draw_text_step:
    push rbx
    push r12
    sub rsp, 8
    call step_ptr
    mov rbx, rax
    mov rdx, [rbx + ST_TITLE]
    TEXT 8, 17, rdx, C_GOLD
    mov rdi, [rbx + ST_BODY]
    mov esi, COLS
    call wrap_count
    add eax, TEXT_LINES - 1
    xor edx, edx
    mov ecx, TEXT_LINES
    div ecx
    cmp eax, 1
    jge .p
    mov eax, 1
.p:
    mov [pages], eax
    mov ecx, [page]             ; clamp (back from the next step asks for the last page)
    cmp ecx, eax
    jb .c
    lea ecx, [rax - 1]
    mov [page], ecx
.c:
    imul r9d, ecx, TEXT_LINES
    mov edi, 8
    mov esi, 31
    mov rdx, [rbx + ST_BODY]
    mov ecx, COLS
    mov r8d, C_WHITE
    push TEXT_LINES
    push TEXT_LINES
    call draw_wrapped
    add rsp, 16
    ; the page and the keys
    cmp dword [pages], 1
    je .k
    lea rdi, [tbuf]
    mov esi, [page]
    inc esi
    call num_to
    mov rdi, rax
    lea rsi, [A_SLASH]
    call ascii_to
    mov rdi, rax
    mov esi, [pages]
    call num_to
    lea rdx, [tbuf]
    TEXT 284, FB_H - 14, rdx, C_GOLD
.k:
    lea rsi, [U_TEXTKEYS]
    mov rsi, [rsi]
    call footer
    mov edi, 0                  ; a click anywhere on the page goes on
    mov esi, 14
    mov edx, FB_W
    mov ecx, FB_H - 30
    mov r8d, K_NEXT
    call hit_add
    add rsp, 8
    pop r12
    pop rbx
    ret

draw_quiz:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    sub rsp, 16
    call step_ptr
    mov rbx, rax
    mov edi, 8
    mov esi, 17
    mov rdx, [rbx + ST_TITLE]
    mov ecx, COLS
    mov r8d, C_WHITE
    xor r9d, r9d
    push 5
    push 5
    call draw_wrapped
    add rsp, 16
    lea ebp, [rax + 4]          ; y of the first option
    xor r12d, r12d
.opt:
    cmp r12, [rbx + ST_NOPTS]
    jae .fb
    mov edi, 8
    mov esi, ebp
    mov edx, FB_W - 16
    mov ecx, 13
    mov r8d, C_NAVY
    mov r9d, C_BLUE
    call box
    mov edi, 8
    mov esi, ebp
    mov edx, FB_W - 16
    mov ecx, 13
    lea r8d, [r12 + K_ITEM]
    call hit_add
    lea rdi, [tbuf]
    lea esi, [r12 + 1]
    call num_to
    lea rdx, [tbuf]
    lea esi, [rbp + 1]
    TEXT 12, esi, rdx, C_GOLD
    mov r13d, C_WHITE
    bt dword [q_wrong], r12d
    jnc .ok
    mov r13d, C_RED
.ok:
    cmp dword [game_solved], 0
    je .draw
    cmp r12, [rbx + ST_ANSWER]
    jne .draw
    mov r13d, C_GREEN
.draw:
    mov rax, [rbx + ST_OPTS]
    mov rdx, [rax + r12*8]
    lea esi, [rbp + 1]
    TEXT 24, esi, rdx, r13d
    add ebp, 15
    inc r12d
    jmp .opt
.fb:
    add ebp, 2
    cmp dword [game_solved], 0
    je .wrong
    lea rax, [U_RIGHT]
    mov rdx, [rax]
    TEXT 8, ebp, rdx, C_GREEN
    add ebp, LEADING
    mov edi, 8
    mov esi, ebp
    mov rdx, [rbx + ST_BODY]
    mov ecx, COLS
    mov r8d, C_WHITE
    xor r9d, r9d
    mov eax, FB_H - 16
    sub eax, ebp
    xor edx, edx
    mov ecx, LEADING
    div ecx
    push rax
    push rax
    mov ecx, COLS
    mov rdx, [rbx + ST_BODY]
    call draw_wrapped
    add rsp, 16
    jmp .k
.wrong:
    cmp dword [q_tries], 0
    je .k
    lea rax, [U_WRONG]
    mov rdx, [rax]
    TEXT 8, ebp, rdx, C_RED
.k:
    lea rsi, [U_QUIZKEYS]
    cmp dword [game_solved], 0
    je .ks
    lea rsi, [U_TEXTKEYS]
.ks:
    mov rsi, [rsi]
    call footer
    add rsp, 16
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; y of wire q (edi) -> eax
wire_y:
    imul eax, edi, 20
    add eax, 66
    ret

; a control dot on wire edi at x esi
dot:
    push rbx
    mov ebx, esi
    call wire_y
    lea esi, [rax - 1]
    lea edi, [rbx + 4]
    mov edx, 3
    mov ecx, 3
    mov r8d, r12d
    call gfx_rect
    pop rbx
    ret

; the CNOT target (a ring with a cross) on wire edi at x esi
target:
    push rbx
    push rbp
    sub rsp, 8
    mov ebx, esi
    call wire_y
    mov ebp, eax
    lea edi, [rbx + 2]
    lea esi, [rbp - 3]
    mov edx, 7
    mov ecx, 7
    mov r8d, C_BG
    mov r9d, r12d
    call box
    lea edi, [rbx + 5]
    lea esi, [rbp - 3]
    RECT edi, esi, 1, 7, r12d
    lea edi, [rbx + 2]
    RECT edi, ebp, 7, 1, r12d
    add rsp, 8
    pop rbp
    pop rbx
    ret

; a gate box with a label on wire edi at x esi, label string rdx
gate_box:
    push rbx
    push rbp
    push r13
    mov ebx, esi
    mov r13, rdx
    call wire_y
    mov ebp, eax
    lea esi, [rbp - 6]
    mov edi, ebx
    mov edx, 11
    mov ecx, 11
    mov r8d, C_NAVY
    mov r9d, C_BLUE
    cmp r12d, C_DIM
    jne .b
    mov r9d, C_DIM
.b:
    call box
    mov rdi, r13
    call str_len
    lea edi, [rbx + 3]
    cmp eax, 1
    je .x
    mov edi, ebx
.x:
    lea esi, [rbp - 7]
    TEXT edi, esi, r13, r12d
    pop r13
    pop rbp
    pop rbx
    ret

; a vertical line at x esi + 5 from wire edi to wire edx
vline:
    push rbx
    push rbp
    push r13
    mov ebx, esi
    mov r13d, edx
    call wire_y
    mov ebp, eax
    mov edi, r13d
    call wire_y
    cmp eax, ebp
    jge .o
    xchg eax, ebp
.o:
    sub eax, ebp
    inc eax
    lea edi, [rbx + 5]
    RECT edi, ebp, 1, eax, r12d
    pop r13
    pop rbp
    pop rbx
    ret

; draw_op(x edi, op esi = 4 bytes, dim edx): one gate of the circuit
draw_op:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    mov ebx, edi                ; x
    mov r13d, esi
    mov r12d, C_WHITE           ; ink
    test edx, edx
    jz .ink
    mov r12d, C_DIM
.ink:
    movzx r14d, r13b            ; gate
    mov r15d, r13d
    shr r15d, 8                 ; wires a, b, c in bytes
    cmp r14d, G_BOX
    jae .box
    cmp r14d, G_TDG
    ja .two
    movzx edi, r15b
    mov esi, ebx
    lea rax, [GATE_LABELS]
    mov rdx, [rax + r14*8]
    call gate_box
    jmp .out
.two:
    movzx edi, r15b             ; the line from a to b (CCX: through all three)
    movzx edx, r15w
    shr edx, 8
    mov esi, ebx
    call vline
    cmp r14d, G_CCX
    jne .t2
    movzx edi, r15b
    mov edx, r15d
    shr edx, 16
    and edx, 0xff
    mov esi, ebx
    call vline
    movzx edx, r15w
    shr edx, 8
    mov edi, edx
    mov edx, r15d
    shr edx, 16
    and edx, 0xff
    mov esi, ebx
    call vline
.t2:
    movzx edi, r15b
    mov esi, ebx
    cmp r14d, G_SWAP
    je .swap
    call dot                    ; every two-wire gate but SWAP has a dot on a
    movzx edi, r15w
    shr edi, 8
    mov esi, ebx
    cmp r14d, G_CX
    jne .cz
    call target
    jmp .out
.cz:
    cmp r14d, G_CZ
    jne .cs
    call dot
    jmp .out
.cs:
    cmp r14d, G_CCX
    jne .csl
    call dot
    mov edi, r15d
    shr edi, 16
    and edi, 0xff
    mov esi, ebx
    call target
    jmp .out
.csl:                           ; CS, CS†: a dot, and S / S† on b
    lea rax, [GATE_LABELS]
    mov rdx, [rax + G_S*8]
    cmp r14d, G_CSDG
    jne .csd
    mov rdx, [rax + G_SDG*8]
.csd:
    call gate_box
    jmp .out
.swap:
    call cross
    movzx edi, r15w
    shr edi, 8
    mov esi, ebx
    call cross
    jmp .out
.box:                           ; a black box over every wire
    call step_ptr
    mov rbp, rax
    mov edi, 0
    call wire_y
    mov r13d, eax
    mov edi, [rbp + ST_QUBITS]
    dec edi
    call wire_y
    sub eax, r13d
    add eax, 15
    mov ecx, eax
    lea esi, [r13 - 7]
    mov edi, ebx
    mov edx, 11
    mov r8d, C_NAVY
    mov r9d, C_PURPLE
    call box
    mov rax, [rbp + ST_BOXNAMES]
    lea ecx, [r14 - G_BOX]
    mov rdx, [rax + rcx*8]
    mov edi, [rbp + ST_QUBITS]
    dec edi
    call wire_y
    add eax, r13d
    shr eax, 1
    lea esi, [rax - 7]
    lea edi, [rbx + 3]
    TEXT edi, esi, rdx, C_GOLD
.out:
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; the SWAP mark on wire edi at x esi
cross:
    push rbx
    push rbp
    sub rsp, 8
    mov ebx, esi
    call wire_y
    mov ebp, eax
    lea edi, [rbx + 2]
    lea esi, [rbp - 3]
    lea edx, [rbx + 8]
    lea ecx, [rbp + 3]
    mov r8d, r12d
    call gfx_line
    lea edi, [rbx + 8]
    lea esi, [rbp - 3]
    lea edx, [rbx + 2]
    lea ecx, [rbp + 3]
    mov r8d, r12d
    call gfx_line
    add rsp, 8
    pop rbp
    pop rbx
    ret

; draw_ops(ops rdi, count esi, x edx, dim ecx) -> eax = x after them
draw_ops:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    mov rbx, rdi
    mov ebp, esi
    mov r12d, edx
    mov r13d, ecx
.l:
    test ebp, ebp
    jz .e
    mov edi, r12d
    mov esi, [rbx]
    mov edx, r13d
    call draw_op
    add rbx, 4
    add r12d, 12
    dec ebp
    jmp .l
.e:
    mov eax, r12d
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

draw_circuit:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    call step_ptr
    mov rbx, rax
    mov r15d, [rbx + ST_QUBITS]
    ; the goal
    mov edi, 8
    mov esi, 15
    mov rdx, [rbx + ST_TITLE]
    mov ecx, COLS
    mov r8d, C_GOLD
    xor r9d, r9d
    push 3
    push 3
    call draw_wrapped
    add rsp, 16
    ; the wires and their labels
    xor ebp, ebp
.wire:
    cmp ebp, r15d
    jae .ops
    mov edi, ebp
    call wire_y
    mov r13d, eax
    RECT 22, r13d, 182, 1, C_DIM
    lea rsi, [A_Q0]
    lea rdi, [tbuf]
    call ascii_to
    lea rax, [ASCII]
    movzx eax, byte [rax + rbp + '0' - 32]
    mov [tbuf + 1], al
    mov r12d, C_WHITE
    cmp ebp, [c_sel]
    jne .lab
    cmp dword [c_pick], 0
    jne .lab
    mov r12d, C_GOLD
    lea esi, [r13 - 1]
    RECT 3, esi, 2, 3, C_GOLD
.lab:
    ; wires already chosen for the gate waiting: gold too
    mov ecx, [c_pickn]
    cmp dword [c_pick], 0
    je .lab2
.pw:
    test ecx, ecx
    jz .lab2
    dec ecx
    lea rdx, [c_pickw]
    cmp [rdx + rcx*4], ebp
    jne .pw
    mov r12d, C_GOLD
.lab2:
    lea esi, [r13 - 7]
    lea rdx, [tbuf]
    TEXT 7, esi, rdx, r12d
    lea esi, [r13 - 9]
    mov edi, 2
    mov edx, 202
    mov ecx, 19
    lea r8d, [rbp + K_WIRE]
    call hit_add
    inc ebp
    jmp .wire
.ops:
    mov rdi, [rbx + ST_SETUP]
    mov esi, [rbx + ST_NSETUP]
    mov edx, 26
    mov ecx, 1
    call draw_ops
    lea rdi, [c_ops]
    mov esi, [c_nops]
    mov edx, eax
    xor ecx, ecx
    call draw_ops
    mov rdi, [rbx + ST_AFTER]
    mov esi, [rbx + ST_NAFTER]
    mov edx, eax
    mov ecx, 1
    call draw_ops
    ; the palette
    mov ebp, 8                  ; x
    xor r12d, r12d
.pal:
    cmp r12, [rbx + ST_NGATES]
    jae .state
    mov rax, [rbx + ST_GATES]
    movzx eax, byte [rax + r12]
    cmp eax, G_BOX
    jb .gl
    mov rcx, [rbx + ST_BOXNAMES]
    mov r13, [rcx + rax*8 - G_BOX*8]
    jmp .gw
.gl:
    lea rcx, [GATE_LABELS]
    mov r13, [rcx + rax*8]
.gw:
    mov rdi, r13
    call text_width
    lea r14d, [rax + 8]         ; tile width
    mov edi, ebp
    mov esi, 134
    mov edx, r14d
    mov ecx, 13
    mov r8d, C_NAVY
    mov r9d, C_BLUE
    lea eax, [r12 + 1]
    cmp eax, [c_pick]
    jne .tb
    mov r9d, C_GOLD
.tb:
    call box
    mov edi, ebp
    mov esi, 134
    mov edx, r14d
    mov ecx, 13
    lea r8d, [r12 + K_GATE]
    call hit_add
    lea edi, [rbp + 4]
    TEXT edi, 135, r13, C_WHITE
    lea ebp, [rbp + r14 + 4]
    inc r12d
    jmp .pal
.state:
    call draw_state
    ; the line under the palette
    cmp dword [game_solved], 0
    je .info
    lea rax, [U_SOLVED]
    mov rdx, [rax]
    TEXT 8, 151, rdx, C_GREEN
    mov ecx, [c_nops]
    cmp rcx, [rbx + ST_PAR]
    jbe .keys
    lea rax, [U_OVERPAR]
    mov rdx, [rax]
    TEXT 8, 162, rdx, C_DIM
    jmp .keys
.info:
    mov rdx, [c_info]
    test rdx, rdx
    jz .keys
    mov edi, 8
    mov esi, 151
    mov ecx, COLS
    mov r8d, C_WHITE
    xor r9d, r9d
    push 2
    push 2
    call draw_wrapped
    add rsp, 16
.keys:
    lea rsi, [U_CIRCKEYS]
    cmp dword [game_solved], 0
    je .ks
    lea rsi, [U_SOLVEDKEYS]
.ks:
    mov rsi, [rsi]
    call footer
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; the state now: per basis state its ket, a bar for the chance, a dial for the phase
draw_state:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 24
    call run_now
    call step_ptr
    mov r15d, [rax + ST_QUBITS]
    lea rax, [U_STATE]
    mov rdx, [rax]
    TEXT 212, 46, rdx, C_DIM
    mov ecx, r15d
    mov r14d, 1
    shl r14d, cl                ; basis states
    xor ebx, ebx
.row:
    cmp ebx, r14d
    jae .out
    imul ebp, ebx, 9
    add ebp, 57
    ; "|010>"
    lea rsi, [A_KET]
    lea rdi, [rsp]
    mov ecx, 8
    rep movsb
    mov ecx, r15d
    xor edx, edx
.bit:
    cmp edx, r15d
    jae .bitd
    mov eax, ebx
    push rcx
    mov ecx, r15d
    sub ecx, edx
    dec ecx
    shr eax, cl
    pop rcx
    and eax, 1
    add al, '0'
    mov [rsp + 1 + rdx], al
    inc edx
    jmp .bit
.bitd:
    mov byte [rsp + 1 + rdx], '>'
    mov byte [rsp + 2 + rdx], 0
    lea rdi, [tbuf]
    lea rsi, [rsp]
    call ascii_to
    lea esi, [rbp - 3]
    lea rdx, [tbuf]
    TEXT 212, esi, rdx, C_WHITE
    ; the bar
    RECT 246, ebp, 46, 5, C_NAVY
    lea rdi, [c_now]
    mov esi, ebx
    call qs_prob
    mov eax, 46                 ; width = round(p * 46)
    cvtsi2sd xmm1, eax
    mulsd xmm0, xmm1
    cvtsd2si r12d, xmm0
    test r12d, r12d
    jle .dial
    RECT 246, ebp, r12d, 5, C_GOLD
.dial:
    ; a line from the dial's centre in the amplitude's direction
    mov eax, ebx
    shl rax, 4
    lea rcx, [c_now]
    movsd xmm0, [rcx + rax]
    movsd xmm1, [rcx + rax + 8]
    movsd xmm2, xmm0
    mulsd xmm2, xmm2
    movsd xmm3, xmm1
    mulsd xmm3, xmm3
    addsd xmm2, xmm3
    sqrtsd xmm2, xmm2           ; |z|
    mov eax, 1000
    cvtsi2sd xmm3, eax
    movsd xmm4, xmm2
    mulsd xmm4, xmm3
    mov eax, 1
    cvtsi2sd xmm5, eax
    comisd xmm4, xmm5           ; |z| < 0.001: no phase to show
    jb .next
    mov eax, 3
    cvtsi2sd xmm3, eax
    divsd xmm0, xmm2
    mulsd xmm0, xmm3
    divsd xmm1, xmm2
    mulsd xmm1, xmm3
    cvtsd2si r12d, xmm0         ; rounds to nearest
    cvtsd2si r13d, xmm1
    lea edi, [rbp - 1]
    RECT 297, edi, 7, 7, C_DARKRED
    mov edi, 300
    lea esi, [rbp + 2]
    lea edx, [r12 + 300]
    lea ecx, [rbp + 2]
    sub ecx, r13d
    mov r8d, C_WHITE
    call gfx_line
.next:
    inc ebx
    jmp .row
.out:
    add rsp, 24
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; the ELI5 or hint window over the step
draw_overlay:
    push rbx
    push rbp
    sub rsp, 8
    call step_ptr
    mov rbx, rax
    mov edi, 12
    mov esi, 12
    mov edx, FB_W - 24
    mov ecx, FB_H - 24
    mov r8d, C_NAVY
    mov r9d, C_BLUE
    call box
    xor edi, edi                ; the window takes every click
    xor esi, esi
    mov edx, FB_W
    mov ecx, FB_H
    mov r8d, K_ITEM
    call hit_add
    lea rax, [U_ELI5TITLE]
    mov rbp, [rbx + ST_ELI5]
    cmp dword [game_overlay], OV_HINT
    jne .t
    lea rax, [U_HINT]
    mov rbp, [rbx + ST_HINT]
.t:
    mov rdx, [rax]
    TEXT 20, 17, rdx, C_GOLD
    test rbp, rbp
    jz .out
    mov rdi, rbp
    mov esi, OV_COLS
    call wrap_count
    add eax, OV_LINES - 1
    xor edx, edx
    mov ecx, OV_LINES
    div ecx
    cmp eax, 1
    jge .p
    mov eax, 1
.p:
    mov [ov_pages], eax
    mov ecx, [ov_page]
    cmp ecx, eax
    jb .c
    lea ecx, [rax - 1]
    mov [ov_page], ecx
.c:
    imul r9d, ecx, OV_LINES
    mov edi, 20
    mov esi, 31
    mov rdx, rbp
    mov ecx, OV_COLS
    mov r8d, C_WHITE
    push OV_LINES
    push OV_LINES
    call draw_wrapped
    add rsp, 16
    lea rsi, [U_OVKEYS]
    mov eax, [ov_page]
    inc eax
    cmp eax, [ov_pages]
    jb .k
    lea rsi, [U_OVLAST]
.k:
    mov rdx, [rsi]
    TEXT 20, FB_H - 28, rdx, C_DIM
.out:
    add rsp, 8
    pop rbp
    pop rbx
    ret
