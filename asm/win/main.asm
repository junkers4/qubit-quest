; Qubit Quest on Windows: a Win32 window (user32, gdi32), files through kernel32. Shows the
; core's 320 x 200 frame buffer scaled by the largest whole number that fits the window,
; centred, no smoothing (StretchDIBits, COLORONCOLOR); passes keys and clicks to the core.
; Progress is saved in %APPDATA%\QubitQuest\progress.dat (QQ_SAVE names another file).
;
;   qubit-quest.exe        play
;   qubit-quest.exe -all   every level unlocked
;
; Win64 calls: rcx, rdx, r8, r9, then the stack above 32 bytes of shadow space, rsp 16-aligned.
; The core is called the core's way (rdi, rsi), only from the main loop.

bits 64
default rel

%include "core/sim.inc"
%include "core/gfx.inc"
%include "core/game.inc"

extern GetModuleHandleA, GetCommandLineA, GetEnvironmentVariableA, ExitProcess, Sleep
extern CreateDirectoryA, CreateFileA, ReadFile, WriteFile, CloseHandle
extern RegisterClassExA, CreateWindowExA, DefWindowProcA, PostQuitMessage, PeekMessageA
extern TranslateMessage, DispatchMessageA, LoadIconA, LoadCursorA, AdjustWindowRect
extern GetDC, ReleaseDC, GetClientRect, FillRect
extern CreateSolidBrush, StretchDIBits, SetStretchBltMode
extern game_init, game_key, game_click, game_draw, game_quit, fb

WM_DESTROY      equ 0x0002
WM_PAINT        equ 0x000f
WM_ERASEBKGND   equ 0x0014
WM_QUIT         equ 0x0012
WM_KEYDOWN      equ 0x0100
WM_CHAR         equ 0x0102
WM_LBUTTONDOWN  equ 0x0201
WS_OVERLAPPEDWINDOW equ 0x00cf0000
WS_VISIBLE      equ 0x10000000
CW_USEDEFAULT   equ 0x80000000
IDC_ARROW       equ 32512
PM_REMOVE       equ 1
COLORONCOLOR    equ 3
SRCCOPY         equ 0x00cc0020
GENERIC_READ    equ 0x80000000
GENERIC_WRITE   equ 0x40000000
CREATE_ALWAYS   equ 2
OPEN_EXISTING   equ 3
FILE_ATTRIBUTE_NORMAL equ 0x80

EV_KEY          equ 1
EV_CLICK        equ 2
QUEUE           equ 64

section .rodata
class_name: db "QubitQuest", 0
title:      db "Qubit Quest", 0
arg_all:    db "-all", 0
env_save:   db "QQ_SAVE", 0
env_appdata: db "APPDATA", 0
sub_dir:    db "\QubitQuest", 0
sub_file:   db "\progress.dat", 0
align 4
; BITMAPINFOHEADER of the frame buffer: 320 x -200 (top-down), 32 bits
bmi:        dd 40, FB_W, -FB_H
            dw 1, 32
            dd 0, 0, 0, 0, 0, 0

section .bss
alignb 16
wc:         resb 80         ; WNDCLASSEXA
msg:        resb 48         ; MSG
rect:       resb 16         ; RECT
crect:      resb 16
hinst:      resq 1
hwnd:       resq 1
brush:      resq 1
queue:      resd 3 * QUEUE  ; kind, a, b
qhead:      resd 1
qtail:      resd 1
scale:      resd 1
ox:         resd 1
oy:         resd 1
flags:      resd 1
io_count:   resd 1
save_dir:   resb 300
save_path:  resb 320

section .text

global start
start:
    sub rsp, 104                ; shadow space and room for 9 stack arguments; aligned
    call GetCommandLineA
    mov rcx, rax
    lea rdx, [arg_all]
    call contains
    mov [flags], eax
    call find_save_path
    mov edi, [flags]
    call game_init

    xor ecx, ecx
    call GetModuleHandleA
    mov [hinst], rax
    mov ecx, C_BG               ; COLORREF is 0x00BBGGRR
    call rgb_to_colorref
    mov ecx, eax
    call CreateSolidBrush
    mov [brush], rax

    lea rbx, [wc]
    mov dword [rbx], 80
    mov dword [rbx + 4], 3      ; CS_HREDRAW | CS_VREDRAW
    lea rax, [wndproc]
    mov [rbx + 8], rax
    mov rax, [hinst]
    mov [rbx + 24], rax
    mov rcx, rax
    mov edx, 1                  ; the icon resource (win/qubit-quest.rc)
    call LoadIconA
    mov [rbx + 32], rax
    mov [rbx + 72], rax
    xor ecx, ecx
    mov edx, IDC_ARROW
    call LoadCursorA
    mov [rbx + 40], rax
    mov rax, [brush]
    mov [rbx + 48], rax
    lea rax, [class_name]
    mov [rbx + 64], rax
    mov rcx, rbx
    call RegisterClassExA

    ; a window whose inside is 960 x 600 (scale 3)
    lea rcx, [rect]
    mov dword [rcx], 0
    mov dword [rcx + 4], 0
    mov dword [rcx + 8], FB_W * 3
    mov dword [rcx + 12], FB_H * 3
    mov edx, WS_OVERLAPPEDWINDOW
    xor r8d, r8d
    call AdjustWindowRect
    ; CreateWindowExA(ex style, class, title, style, x, y, w, h, parent, menu, instance, param)
    xor ecx, ecx
    lea rdx, [class_name]
    lea r8, [title]
    mov r9d, WS_OVERLAPPEDWINDOW | WS_VISIBLE
    mov dword [rsp + 32], CW_USEDEFAULT
    mov dword [rsp + 40], CW_USEDEFAULT
    mov eax, [rect + 8]
    sub eax, [rect]
    mov [rsp + 48], rax
    mov eax, [rect + 12]
    sub eax, [rect + 4]
    mov [rsp + 56], rax
    mov qword [rsp + 64], 0
    mov qword [rsp + 72], 0
    mov rax, [hinst]
    mov [rsp + 80], rax
    mov qword [rsp + 88], 0
    call CreateWindowExA
    mov [hwnd], rax
    test rax, rax
    jz .exit

.loop:
    lea rcx, [msg]
    xor edx, edx
    xor r8d, r8d
    xor r9d, r9d
    mov dword [rsp + 32], PM_REMOVE
    call PeekMessageA
    test eax, eax
    jz .events
    cmp dword [msg + 8], WM_QUIT
    je .exit
    lea rcx, [msg]
    call TranslateMessage
    lea rcx, [msg]
    call DispatchMessageA
    jmp .loop
.events:                        ; what the window procedure queued, to the core
    mov eax, [qhead]
    cmp eax, [qtail]
    je .frame
    imul ecx, eax, 12
    lea rdx, [queue]
    add rdx, rcx
    inc eax
    and eax, QUEUE - 1
    mov [qhead], eax
    cmp dword [rdx], EV_KEY
    jne .click
    mov edi, [rdx + 4]
    call game_key
    jmp .events
.click:
    mov edi, [rdx + 4]
    mov esi, [rdx + 8]
    call game_click
    jmp .events
.frame:
    call game_draw
    cmp dword [game_quit], 0
    jne .exit
    call present
    mov ecx, 33
    call Sleep
    jmp .loop
.exit:
    xor ecx, ecx
    call ExitProcess

; rgb_to_colorref(0x00RRGGBB ecx) -> eax = 0x00BBGGRR
rgb_to_colorref:
    mov eax, ecx
    bswap eax                   ; BBGGRR00
    shr eax, 8
    ret

; queue_event(kind ecx, a edx, b r8d)
queue_event:
    mov eax, [qtail]
    lea r9d, [rax + 1]
    and r9d, QUEUE - 1
    cmp r9d, [qhead]
    je .full
    imul eax, eax, 12
    lea r10, [queue]
    add r10, rax
    mov [r10], ecx
    mov [r10 + 4], edx
    mov [r10 + 8], r8d
    mov [qtail], r9d
.full:
    ret

; the window procedure (hwnd rcx, message edx, wparam r8, lparam r9)
wndproc:
    sub rsp, 40
    cmp edx, WM_CHAR
    je .char
    cmp edx, WM_KEYDOWN
    je .keydown
    cmp edx, WM_LBUTTONDOWN
    je .button
    cmp edx, WM_ERASEBKGND
    je .erase
    cmp edx, WM_DESTROY
    je .destroy
    call DefWindowProcA
    add rsp, 40
    ret
.char:
    mov eax, r8d
    cmp eax, K_BACK
    je .key
    cmp eax, K_ENTER
    je .key
    cmp eax, K_ESC
    je .key
    cmp eax, 32
    jb .zero
    cmp eax, 126
    ja .zero
.key:
    mov ecx, EV_KEY
    mov edx, eax
    call queue_event
    jmp .zero
.keydown:
    mov eax, K_LEFT
    cmp r8d, 0x25
    je .key
    mov eax, K_UP
    cmp r8d, 0x26
    je .key
    mov eax, K_RIGHT
    cmp r8d, 0x27
    je .key
    mov eax, K_DOWN
    cmp r8d, 0x28
    je .key
    jmp .zero
.button:                        ; window pixels -> screen pixels
    movsx eax, r9w
    sub eax, [ox]
    js .zero
    cdq
    idiv dword [scale]
    cmp eax, FB_W
    jge .zero
    mov r10d, eax
    mov eax, r9d
    sar eax, 16
    sub eax, [oy]
    js .zero
    cdq
    idiv dword [scale]
    cmp eax, FB_H
    jge .zero
    mov ecx, EV_CLICK
    mov edx, r10d
    mov r8d, eax
    call queue_event
    jmp .zero
.erase:                         ; no erasing: present paints every pixel (no flicker)
    mov eax, 1
    add rsp, 40
    ret
.destroy:
    xor ecx, ecx
    call PostQuitMessage
.zero:
    xor eax, eax
    add rsp, 40
    ret

; present: the margins in the background colour, the frame buffer scaled into the middle
present:
    push rbx
    push r12
    push r13
    sub rsp, 112                ; 3 pushes + return = 32: aligned after this
    mov rcx, [hwnd]
    lea rdx, [crect]
    call GetClientRect
    mov eax, [crect + 8]        ; width
    xor edx, edx
    mov ecx, FB_W
    div ecx
    mov ebx, eax
    mov eax, [crect + 12]       ; height
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
    mov ecx, [crect + 8]
    sub ecx, eax
    sar ecx, 1
    mov [ox], ecx
    imul eax, ebx, FB_H
    mov ecx, [crect + 12]
    sub ecx, eax
    sar ecx, 1
    mov [oy], ecx
    mov rcx, [hwnd]
    call GetDC
    mov r12, rax
    ; the four margins: above, below, left, right
    lea r13, [rsp + 96]         ; a RECT
    mov dword [r13], 0
    mov dword [r13 + 4], 0
    mov eax, [crect + 8]
    mov [r13 + 8], eax
    mov eax, [oy]
    mov [r13 + 12], eax
    call fill_margin
    imul eax, ebx, FB_H
    add eax, [oy]
    mov [r13 + 4], eax
    mov eax, [crect + 12]
    mov [r13 + 12], eax
    call fill_margin
    mov eax, [oy]
    mov [r13 + 4], eax
    imul eax, ebx, FB_H
    add eax, [oy]
    mov [r13 + 12], eax
    mov dword [r13], 0
    mov eax, [ox]
    mov [r13 + 8], eax
    call fill_margin
    imul eax, ebx, FB_W
    add eax, [ox]
    mov [r13], eax
    mov eax, [crect + 8]
    mov [r13 + 8], eax
    call fill_margin
    mov rcx, r12
    mov edx, COLORONCOLOR
    call SetStretchBltMode
    ; StretchDIBits(dc, x, y, w, h, src x, src y, src w, src h, bits, info, usage, rop)
    mov rcx, r12
    mov edx, [ox]
    mov r8d, [oy]
    imul r9d, ebx, FB_W
    imul eax, ebx, FB_H
    mov [rsp + 32], rax
    mov qword [rsp + 40], 0
    mov qword [rsp + 48], 0
    mov qword [rsp + 56], FB_W
    mov qword [rsp + 64], FB_H
    lea rax, [fb]
    mov [rsp + 72], rax
    lea rax, [bmi]
    mov [rsp + 80], rax
    mov qword [rsp + 88], 0     ; DIB_RGB_COLORS
    mov dword [rsp + 96], SRCCOPY
    mov dword [rsp + 100], 0
    call StretchDIBits
    mov rcx, [hwnd]
    mov rdx, r12
    call ReleaseDC
    add rsp, 112
    pop r13
    pop r12
    pop rbx
    ret

; fill the RECT at r13 on the DC r12, if it is not empty
fill_margin:
    sub rsp, 40
    mov eax, [r13 + 8]
    cmp eax, [r13]
    jle .out
    mov eax, [r13 + 12]
    cmp eax, [r13 + 4]
    jle .out
    mov rcx, r12
    mov rdx, r13
    mov r8, [brush]
    call FillRect
.out:
    add rsp, 40
    ret

; contains(string rcx, part rdx) -> eax = 1 if part is in string
contains:
.outer:
    xor eax, eax
.inner:
    mov r8b, [rdx + rax]
    test r8b, r8b
    jz .yes
    mov r9b, [rcx + rax]
    test r9b, r9b
    jz .no
    cmp r8b, r9b
    jne .advance
    inc eax
    jmp .inner
.advance:
    inc rcx
    jmp .outer
.yes:
    mov eax, 1
    ret
.no:
    xor eax, eax
    ret

; strcat_to(dest rcx, src rdx) -> rax = the end of dest (at its 0)
strcat_to:
.l:
    mov al, [rdx]
    mov [rcx], al
    test al, al
    jz .e
    inc rcx
    inc rdx
    jmp .l
.e:
    mov rax, rcx
    ret

find_save_path:
    sub rsp, 40
    lea rcx, [env_save]
    lea rdx, [save_path]
    mov r8d, 300
    call GetEnvironmentVariableA
    test eax, eax
    jz .appdata
    cmp eax, 300
    jae .appdata
    mov byte [save_dir], 0
    jmp .out
.appdata:
    lea rcx, [env_appdata]
    lea rdx, [save_dir]
    mov r8d, 260
    call GetEnvironmentVariableA
    test eax, eax
    jz .none
    cmp eax, 260
    jae .none
    lea rcx, [save_dir]
    add rcx, rax
    lea rdx, [sub_dir]
    call strcat_to
    lea rcx, [save_path]
    lea rdx, [save_dir]
    call strcat_to
    mov rcx, rax
    lea rdx, [sub_file]
    call strcat_to
    jmp .out
.none:
    mov byte [save_path], 0
.out:
    add rsp, 40
    ret

; plat_save(buffer rdi, bytes esi), called by the core with any stack alignment
global plat_save
plat_save:
    push rbp
    mov rbp, rsp
    push rbx
    push r12
    and rsp, -16
    sub rsp, 64
    mov r12, rdi
    mov ebx, esi
    cmp byte [save_path], 0
    je .out
    cmp byte [save_dir], 0
    je .open
    lea rcx, [save_dir]
    xor edx, edx
    call CreateDirectoryA       ; an existing one is fine
.open:
    ; CreateFileA(name, access, share, security, creation, attributes, template)
    lea rcx, [save_path]
    mov edx, GENERIC_WRITE
    xor r8d, r8d
    xor r9d, r9d
    mov qword [rsp + 32], CREATE_ALWAYS
    mov qword [rsp + 40], FILE_ATTRIBUTE_NORMAL
    mov qword [rsp + 48], 0
    call CreateFileA
    cmp rax, -1
    je .out
    mov [rsp + 56], rax
    ; WriteFile(file, buffer, bytes, written, overlapped)
    mov rcx, rax
    mov rdx, r12
    mov r8d, ebx
    lea r9, [io_count]
    mov qword [rsp + 32], 0
    call WriteFile
    mov rcx, [rsp + 56]
    call CloseHandle
.out:
    lea rsp, [rbp - 16]
    pop r12
    pop rbx
    pop rbp
    ret

; plat_load(buffer rdi, bytes esi) -> eax = bytes read
global plat_load
plat_load:
    push rbp
    mov rbp, rsp
    push rbx
    push r12
    and rsp, -16
    sub rsp, 64
    mov r12, rdi
    mov ebx, esi
    mov dword [io_count], 0
    cmp byte [save_path], 0
    je .out
    lea rcx, [save_path]
    mov edx, GENERIC_READ
    mov r8d, 1                  ; FILE_SHARE_READ
    xor r9d, r9d
    mov qword [rsp + 32], OPEN_EXISTING
    mov qword [rsp + 40], FILE_ATTRIBUTE_NORMAL
    mov qword [rsp + 48], 0
    call CreateFileA
    cmp rax, -1
    je .out
    mov [rsp + 56], rax
    mov rcx, rax
    mov rdx, r12
    mov r8d, ebx
    lea r9, [io_count]
    mov qword [rsp + 32], 0
    call ReadFile
    mov rcx, [rsp + 56]
    call CloseHandle
.out:
    mov eax, [io_count]
    lea rsp, [rbp - 16]
    pop r12
    pop rbx
    pop rbp
    ret
