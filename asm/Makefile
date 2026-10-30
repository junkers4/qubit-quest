# The assembler Qubit Quest (NASM, x86-64). Run from the repository root: make -C asm
#   make -C asm             build/qubit-quest (Linux, X11) and build/qubit-quest.exe (Windows)
#   make -C asm linux       the Linux program only (needs nasm, gcc, libx11-dev)
#   make -C asm windows     the Windows program only (needs nasm, mingw-w64 binutils)
#   make -C asm test        the core headless: simulator and every level (pytest)
#   make -C asm test-window the real programs under Xvfb (Linux) and wine (Windows)
#   make -C asm data        regenerate gen/data.asm from the web game's levels and font
B        = ../build
NASM     = nasm -I .
CORE     = core/sim core/gfx core/viz core/game gen/data
INC      = $(wildcard core/*.inc)
PY      ?= python3
MINGW   ?= x86_64-w64-mingw32-

all: linux windows

linux: $(B)/qubit-quest
windows: $(B)/qubit-quest.exe

$(B)/elf/%.o: %.asm $(INC)
	@mkdir -p $(dir $@)
	$(NASM) -f elf64 $< -o $@

$(B)/win/%.obj: %.asm $(INC)
	@mkdir -p $(dir $@)
	$(NASM) -f win64 $< -o $@

$(B)/qubit-quest: $(CORE:%=$(B)/elf/%.o) $(B)/elf/linux/main.o
	gcc -no-pie -o $@ $^ -lX11

$(B)/win/icon.o: win/qubit-quest.rc win/icon.ico
	@mkdir -p $(dir $@)
	cd win && $(MINGW)windres qubit-quest.rc -O coff -o ../$@

$(B)/qubit-quest.exe: $(CORE:%=$(B)/win/%.obj) $(B)/win/win/main.obj $(B)/win/icon.o
	$(MINGW)ld -e start --subsystem windows -s -o $@ $^ -lkernel32 -luser32 -lgdi32

# the core as shared libraries, for the tests
$(B)/libqqsim.so: $(B)/elf/core/sim.o
	ld -shared -o $@ $^

$(B)/libqqgame.so: $(CORE:%=$(B)/elf/%.o) $(B)/elf/test/plat_mem.o
	ld -shared -Bsymbolic -z notext -o $@ $^

test: $(B)/libqqsim.so $(B)/libqqgame.so
	cd .. && $(PY) -m pytest -q tests/test_asm.py tests/test_asm_game.py

test-window: all $(B)/libqqgame.so
	cd .. && xvfb-run -a -s "-screen 0 1024x700x24" $(PY) tests/asm_window.py

data:
	node ../tools/asm-data.js

clean:
	rm -rf $(B)/elf $(B)/win $(B)/qubit-quest $(B)/qubit-quest.exe $(B)/*.so

.PHONY: all linux windows test test-window data clean
