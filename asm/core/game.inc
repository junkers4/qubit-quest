; Key codes the platform layers send to game_key: printable keys as ASCII, the rest below.
; Clickable boxes send codes too (K_ITEM + i and so on), so a click is a key press.

K_BACK      equ 8
K_ENTER     equ 13
K_ESC       equ 27
K_UP        equ 0x101
K_DOWN      equ 0x102
K_LEFT      equ 0x103
K_RIGHT     equ 0x104
K_NEXT      equ 0x105
K_ITEM      equ 0x200       ; + menu item, quiz option
K_LEVEL     equ 0x300       ; + level
K_GATE      equ 0x400       ; + palette tile
K_WIRE      equ 0x500       ; + wire
