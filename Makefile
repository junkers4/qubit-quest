# make test         node unit tests: simulator, curriculum, sources, generated files, requirements
# make test-python  the Qiskit examples and the simulator cross-check (pip install -r requirements.txt)
# make shots        every level in headless Chromium at four sizes; screenshots in /tmp/qq
# make test-desktop the desktop app: Go tests, then the game played from the built app
# make test-asm     the assembler game headless: its simulator against the reference, all 63 levels
# make test-all     all of these
# make asm          the assembler game: build/qubit-quest (Linux) and build/qubit-quest.exe (Windows)
# make desktop      the app for Linux, Windows and macOS in dist/ (needs Go; VERSION=0.1.0)
# make run          build the app for this computer and start it
# make android      the Android app: dist/qubit-quest-VERSION.apk (needs ANDROID_HOME, a JDK, Go)
# make generate     rebuild src/examples.js, tests/sim_cases.json, docs/REFERENCES.md
# make wasm         assemble src/qcore.wat into src/qcore-bin.js (installs the wabt dev tool)
# make check-refs   resolve every DOI, arXiv id and URL online (needs network)
# make serve        play at http://localhost:8000
PY ?= python3

test:
	node --test test/*.test.js

test-python:
	$(PY) -m pytest -q tests --ignore=tests/test_asm.py --ignore=tests/test_asm_game.py

shots:
	node test/shots.js

test-desktop:
	go vet ./...
	go test ./...
	node test/desktop.js

test-asm:
	$(MAKE) -C asm test PY=$(PY)

asm:
	$(MAKE) -C asm

test-all: test test-python shots test-desktop test-asm

desktop:
	sh tools/package.sh

run:
	go run ./desktop

android:
	bash android/build.sh

generate:
	node tools/embed-examples.js
	node tools/export-cases.js
	node tools/gen-references.js
	node tools/asm-data.js
	node tools/export-asm-cases.js

wasm:
	npm install --no-audit --no-fund
	node tools/build-wasm.js

check-refs:
	node tools/check-refs.js

serve:
	python3 -m http.server 8000

.PHONY: test test-python shots test-desktop test-asm asm test-all desktop run android generate wasm check-refs serve
