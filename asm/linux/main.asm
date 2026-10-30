; Qubit Quest on Linux: a window through X11 (Xlib), files through system calls. Shows the
; core's 320 x 200 frame buffer scaled by the largest whole number that fits the window,
; centred, no smoothing; passes keys and clicks to the core. Progress is saved in
; $XDG_CONFIG_HOME/qubit-quest/progress.dat (else ~/.config/...; QQ_SAVE names another file).
;
;   qubit-quest        play
;   qubit-quest -all   every level unlocked

bits 64
default rel

%include "core/sim.inc"
%include "core/gfx.inc"
%include "core/game.inc"

extern XOpenDisplay, XDefaultScreen, XRootWindow, XDefaultVisual, XDefaultDepth
extern XCreateSimpleWindow, XStoreName, XSelectInput, XInternAtom, XSetWMProtocols
extern XMapWindow, XDefaultGC, XPending, XNextEvent, XLookupString, XCreateImage
extern XPutImage, XFlush, XDestroyImage, XCloseDisplay, XChangeProperty, XSetWMNormalHints
extern malloc, getenv
extern game_init, game_key, game_click, game_draw, game_quit, fb, ICON, ICON_COLORS

KeyPress        equ 2
ButtonPress     equ 4
Expose          equ 12
ConfigureNotify equ 22
ClientMessage   equ 33
EVENT_MASK      equ 1 | 4 | 0x8000 | 0x20000   ; keys, buttons, exposure, structure
ZPixmap         equ 2
XA_CARDINAL     equ 6

SYS_READ        equ 0
SYS_WRITE       equ 1
SYS_OPEN        equ 2
SYS_CLOSE       equ 3
SYS_NANOSLEEP   equ 35
SYS_MKDIR       equ 83
O_RDONLY        equ 0
O_WRONLY_CREAT_TRUNC equ 1 | 0x40 | 0x200

ICON_PX         equ 2                          ; the 16 x 16 icon at 32 x 32

section .rodata
title:      db "Qubit Quest", 0
wm_del_name: db "WM_DELETE_WINDOW", 0
net_icon:   db "_NET_WM_ICON", 0
arg_all:    db "-all", 0
env_save:   db "QQ_SAVE", 0
env_xdg:    db "XDG_CONFIG_HOME", 0
env_home:   db "HOME", 0
sub_config: db "/.config", 0
sub_dir:    db "/qubit-quest", 0
sub_file:   db "/progress.dat", 0
no_display: db "qubit-quest: cannot open the X display (is DISPLAY set?)", 10
no_display_len equ $ - no_display
align 8
frame_time: dq 0, 33000000                     ; 33 ms: about 30 frames a second

section .bss
alignb 16
event:      resb 192
dpy:        resq 1
win:        resq 1
gc:         resq 1
visual:     resq 1
img:        resq 1
imgbuf:     resq 1
wm_delete:  resq 1
keysym:     resq 1
icon_data:  resq 2 + 32 * 32
depth:      resd 1
screen:     resd 1
ww:         resd 1          ; window size
wh:         resd 1
iw:         resd 1          ; image size
ih:         resd 1
scale:      resd 1
ox:         resd 1
oy:         resd 1
kbuf:       resb 16
save_dir:   resb 512        ; the directory, then the file name after it
save_path:  resb 512

section .text

global main
main:                           ; main(argc edi, argv rsi)
    push rbp
    mov rbp, rsp
    push rbx
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8                  ; rsp is 16-aligned from here on
    ; -all?
    xor r12d, r12d
    mov ebx, edi
    mov r13, rsi
    mov r14d, 1
.args:
    cmp r14d, ebx
    jge .args_done
    mov rdi, [r13 + r14*8]
    lea rsi, [arg_all]
    call streq
    test eax, eax
    jz .an
    mov r12d, 1
.an:
    inc r14d
    jmp .args
.args_done:
    call find_save_path
    mov edi, r12d
    call game_init

    xor edi, edi
    call XOpenDisplay
    test rax, rax
    jnz .opened
    mov eax, SYS_WRITE
    mov edi, 2
    lea rsi, [no_display]
    mov edx, no_display_len
    syscall
    mov eax, 1
    jmp .ret
.opened:
    mov [dpy], rax
    mov rdi, rax
    call XDefaultScreen
    mov [screen], eax
    mov rdi, [dpy]
    mov esi, [screen]
    call XDefaultVisual
    mov [visual], rax
    mov rdi, [dpy]
    mov esi, [screen]
    call XDefaultDepth
    mov [depth], eax
    mov rdi, [dpy]
    mov esi, [screen]
    call XDefaultGC
    mov [gc], rax
    mov rdi, [dpy]
    mov esi, [screen]
    call XRootWindow
    ; XCreateSimpleWindow(dpy, root, x, y, w, h, border width, border, background)
    mov dword [ww], FB_W * 3
    mov dword [wh], FB_H * 3
    mov rdi, [dpy]
    mov rsi, rax
    xor edx, edx
    xor ecx, ecx
    mov r8d, FB_W * 3
    mov r9d, FB_H * 3
    sub rsp, 8
    push C_BG
    push 0
    push 0
    call XCreateSimpleWindow
    add rsp, 32
    mov [win], rax
    mov rdi, [dpy]
    mov rsi, [win]
    lea rdx, [title]
    call XStoreName
    mov rdi, [dpy]
    mov rsi, [win]
    mov edx, EVENT_MASK
    call XSelectInput
    mov rdi, [dpy]
    lea rsi, [wm_del_name]
    xor edx, edx
    call XInternAtom
    mov [wm_delete], rax
    mov rdi, [dpy]
    mov rsi, [win]
    lea rdx, [wm_delete]
    mov ecx, 1
    call XSetWMProtocols
    call set_icon
    mov rdi, [dpy]
    mov rsi, [win]
    call XMapWindow

.loop:
    mov rdi, [dpy]
    call XPending
    test eax, eax
    jz .frame
    mov rdi, [dpy]
    lea rsi, [event]
    call XNextEvent
    call handle_event
    test eax, eax
    jnz .quit
    jmp .loop
.frame:
    call game_draw
    cmp dword [game_quit], 0
    jne .quit
    call present
    mov eax, SYS_NANOSLEEP
    lea rdi, [frame_time]
    xor esi, esi
    syscall
    jmp .loop
.quit:
    mov rdi, [dpy]
    call XCloseDisplay
    xor eax, eax
.ret:
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbx
    pop rbp
    ret

; handle_event -> eax = 1 to quit
handle_event:
    push rbx
    mov eax, [event]
    cmp eax, KeyPress
    je .key
    cmp eax, ButtonPress
    je .button
    cmp eax, ConfigureNotify
    je .configure
    cmp eax, ClientMessage
    je .client
    xor eax, eax
    pop rbx
    ret
.key:
    lea rdi, [event]
    lea rsi, [kbuf]
    mov edx, 8
    lea rcx, [keysym]
    xor r8d, r8d
    call XLookupString
    mov ebx, eax                ; characters
    mov rax, [keysym]
    mov edi, K_ENTER
    cmp rax, 0xff0d
    je .send
    cmp rax, 0xff8d             ; keypad Enter
    je .send
    mov edi, K_ESC
    cmp rax, 0xff1b
    je .send
    mov edi, K_BACK
    cmp rax, 0xff08
    je .send
    mov edi, K_LEFT
    cmp rax, 0xff51
    je .send
    mov edi, K_UP
    cmp rax, 0xff52
    je .send
    mov edi, K_RIGHT
    cmp rax, 0xff53
    je .send
    mov edi, K_DOWN
    cmp rax, 0xff54
    je .send
    cmp ebx, 1
    jne .none
    movzx edi, byte [kbuf]
    cmp edi, 32
    jb .none
    cmp edi, 126
    ja .none
.send:
    call game_key
    jmp .none
.button:
    cmp dword [event + 84], 1   ; the left button
    jne .none
    ; window -> screen pixels
    mov eax, [event + 64]
    sub eax, [ox]
    js .none
    cdq
    idiv dword [scale]
    mov ebx, eax
    cmp ebx, FB_W
    jge .none
    mov eax, [event + 68]
    sub eax, [oy]
    js .none
    cdq
    idiv dword [scale]
    cmp eax, FB_H
    jge .none
    mov edi, ebx
    mov esi, eax
    call game_click
    jmp .none
.configure:
    mov eax, [event + 56]
    mov [ww], eax
    mov eax, [event + 60]
    mov [wh], eax
    jmp .none
.client:
    mov rax, [event + 56]
    cmp rax, [wm_delete]
    jne .none
    mov eax, 1
    pop rbx
    ret
.none:
    xor eax, eax
    pop rbx
    ret

; present: the frame buffer, scaled, into an XImage the size of the window, then on screen
present:
    push rbx
    push rbp
    push r12
    push r13
    push r14
    push r15
    sub rsp, 8
    mov eax, [ww]
    cmp eax, [iw]
    jne .new
    mov eax, [wh]
    cmp eax, [ih]
    jne .new
    cmp qword [img], 0
    jne .fill
.new:
    cmp qword [img], 0
    je .alloc
    mov rdi, [img]
    call XDestroyImage          ; frees the buffer too
    mov qword [img], 0
.alloc:
    mov eax, [ww]
    mov [iw], eax
    mov eax, [wh]
    mov [ih], eax
    mov eax, [iw]
    imul eax, [ih]
    shl rax, 2
    mov rdi, rax
    call malloc
    test rax, rax
    jz .out
    mov [imgbuf], rax
    ; XCreateImage(dpy, visual, depth, ZPixmap, offset, data, w, h, pad, bytes per line)
    mov rdi, [dpy]
    mov rsi, [visual]
    mov edx, [depth]
    mov ecx, ZPixmap
    xor r8d, r8d
    mov r9, [imgbuf]
    push 0
    push 32
    mov eax, [ih]
    push rax
    mov eax, [iw]
    push rax
    call XCreateImage
    add rsp, 32
    mov [img], rax
    ; the scale and the margins
    mov eax, [iw]
    xor edx, edx
    mov ecx, FB_W
    div ecx
    mov ebx, eax
    mov eax, [ih]
    xor edx, edx
    mov ecx, FB_H
    div ecx
    cmp eax, ebx
    cmovb ebx, eax
    cmp ebx, 1
    jge .s
    mov ebx, 1
.s:
    mov [scale], ebx
    imul eax, ebx, FB_W
    mov ecx, [iw]
    sub ecx, eax
    sar ecx, 1
    mov [ox], ecx
    imul eax, ebx, FB_H
    mov ecx, [ih]
    sub ecx, eax
    sar ecx, 1
    mov [oy], ecx
.fill:
    ; every row of the image: margin, the scaled pixels of one frame buffer row, margin
    mov rdi, [imgbuf]
    xor r12d, r12d              ; image row
    mov r13d, [scale]
.row:
    cmp r12d, [ih]
    jae .put
    mov eax, r12d
    sub eax, [oy]
    js .blank
    xor edx, edx
    div r13d
    cmp eax, FB_H
    jae .blank
    imul eax, eax, FB_W
    lea rsi, [fb]
    lea rsi, [rsi + rax*4]
    mov eax, C_BG
    mov ecx, [ox]
    test ecx, ecx
    jle .px
    rep stosd
.px:
    mov r14d, FB_W
    mov r15d, [ox]              ; x so far (for clipping when the window is too small)
.p:
    mov eax, [rsi]
    add rsi, 4
    mov ecx, r13d
    mov edx, [iw]
    sub edx, r15d
    jle .rowend
    cmp ecx, edx
    cmova ecx, edx
    add r15d, ecx
    rep stosd
    dec r14d
    jnz .p
.rowend:
    mov ecx, [iw]
    sub ecx, r15d
    jle .next
    mov eax, C_BG
    rep stosd
    jmp .next
.blank:
    mov eax, C_BG
    mov ecx, [iw]
    rep stosd
.next:
    ; keep rdi on the row start: rows are iw pixels
    mov eax, r12d
    inc eax
    imul eax, [iw]
    mov rdi, [imgbuf]
    lea rdi, [rdi + rax*4]
    inc r12d
    jmp .row
.put:
    ; XPutImage(dpy, win, gc, img, src x, src y, dest x, dest y, w, h)
    mov rdi, [dpy]
    mov rsi, [win]
    mov rdx, [gc]
    mov rcx, [img]
    xor r8d, r8d
    xor r9d, r9d
    mov eax, [ih]
    push rax
    mov eax, [iw]
    push rax
    push 0
    push 0
    call XPutImage
    add rsp, 32
    mov rdi, [dpy]
    call XFlush
.out:
    add rsp, 8
    pop r15
    pop r14
    pop r13
    pop r12
    pop rbp
    pop rbx
    ret

; the window icon (_NET_WM_ICON: width, height, then ARGB pixels, one per long)
set_icon:
    push rbx
    lea rdi, [icon_data]
    mov qword [rdi], 16 * ICON_PX
    mov qword [rdi + 8], 16 * ICON_PX
    xor ebx, ebx                ; icon pixel of the 32 x 32
.l:
    mov eax, ebx
    and eax, 31
    shr eax, 1                  ; x / 2
    mov ecx, ebx
    shr ecx, 6                  ; y / 2 = (i / 32) / 2
    shl ecx, 4
    add eax, ecx
    lea rcx, [ICON]
    movzx eax, byte [rcx + rax]
    mov edx, 0xff000000 | C_BG
    test eax, eax
    jz .p
    lea rcx, [ICON_COLORS]
    mov edx, [rcx + rax*4]
    or edx, 0xff000000
.p:
    lea rdi, [icon_data]
    mov [rdi + 16 + rbx*8], rdx
    inc ebx
    cmp ebx, 32 * 32
    jb .l
    mov rdi, [dpy]
    lea rsi, [net_icon]
    xor edx, edx
    call XInternAtom
    ; XChangeProperty(dpy, win, property, type, format, mode, data, elements)
    mov rdi, [dpy]
    mov rsi, [win]
    mov rdx, rax
    mov ecx, XA_CARDINAL
    mov r8d, 32
    xor r9d, r9d
    push 2 + 32 * 32
    lea rax, [icon_data]
    push rax
    call XChangeProperty
    add rsp, 16
    pop rbx
    ret

; eax = 1 if the C strings rdi and rsi are equal
streq:
.l:
    mov al, [rdi]
    cmp al, [rsi]
    jne .no
    test al, al
    jz .yes
    inc rdi
    inc rsi
    jmp .l
.yes:
    mov eax, 1
    ret
.no:
    xor eax, eax
    ret

; strcat_to(dest rdi, src rsi) -> rax = the end of dest (at its 0)
strcat_to:
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

; where progress is saved: QQ_SAVE, or the config directory
find_save_path:
    push rbx
    lea rdi, [env_save]
    call getenv
    test rax, rax
    jz .config
    lea rdi, [save_path]
    mov rsi, rax
    call strcat_to
    mov byte [save_dir], 0
    pop rbx
    ret
.config:
    lea rdi, [env_xdg]
    call getenv
    test rax, rax
    jz .home
    cmp byte [rax], 0
    je .home
    lea rdi, [save_dir]
    mov rsi, rax
    call strcat_to
    jmp .dir
.home:
    lea rdi, [env_home]
    call getenv
    test rax, rax
    jz .none
    lea rdi, [save_dir]
    mov rsi, rax
    call strcat_to
    mov rdi, rax
    lea rsi, [sub_config]
    call strcat_to
.dir:
    ; save_dir = .../config; save_path = save_dir/qubit-quest/progress.dat
    lea rdi, [save_path]
    lea rsi, [save_dir]
    call strcat_to
    mov rdi, rax
    lea rsi, [sub_dir]
    call strcat_to
    mov rdi, rax
    lea rsi, [sub_file]
    call strcat_to
    pop rbx
    ret
.none:
    mov byte [save_path], 0
    pop rbx
    ret

; plat_save(buffer rdi, bytes esi)
global plat_save
plat_save:
    push rbx
    push r12
    push r13
    mov r12, rdi
    mov r13d, esi
    cmp byte [save_path], 0
    je .out
    cmp byte [save_dir], 0
    je .open
    ; make the config directory and ours (an existing one is fine)
    mov eax, SYS_MKDIR
    lea rdi, [save_dir]
    mov esi, 0o755
    syscall
    ; save_path without its file name is our directory
    lea rdi, [save_path]
    call last_slash
    mov byte [rax], 0
    mov rbx, rax
    mov eax, SYS_MKDIR
    lea rdi, [save_path]
    mov esi, 0o755
    syscall
    mov byte [rbx], '/'
.open:
    mov eax, SYS_OPEN
    lea rdi, [save_path]
    mov esi, O_WRONLY_CREAT_TRUNC
    mov edx, 0o644
    syscall
    test eax, eax
    js .out
    mov ebx, eax
    mov eax, SYS_WRITE
    mov edi, ebx
    mov rsi, r12
    mov edx, r13d
    syscall
    mov eax, SYS_CLOSE
    mov edi, ebx
    syscall
.out:
    pop r13
    pop r12
    pop rbx
    ret

; plat_load(buffer rdi, bytes esi) -> eax = bytes read
global plat_load
plat_load:
    push rbx
    push r12
    push r13
    mov r12, rdi
    mov r13d, esi
    xor eax, eax
    cmp byte [save_path], 0
    je .out
    mov eax, SYS_OPEN
    lea rdi, [save_path]
    mov esi, O_RDONLY
    syscall
    test eax, eax
    js .none
    mov ebx, eax
    mov eax, SYS_READ
    mov edi, ebx
    mov rsi, r12
    mov edx, r13d
    syscall
    push rax
    mov eax, SYS_CLOSE
    mov edi, ebx
    syscall
    pop rax
    test eax, eax
    jns .out
.none:
    xor eax, eax
.out:
    pop r13
    pop r12
    pop rbx
    ret

; rax = the last '/' in the C string rdi
last_slash:
    xor eax, eax
.l:
    mov cl, [rdi]
    test cl, cl
    jz .e
    cmp cl, '/'
    jne .n
    mov rax, rdi
.n:
    inc rdi
    jmp .l
.e:
    ret
