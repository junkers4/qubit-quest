# make test         node unit tests: simulator, curriculum, sources, generated files, requirements
# make test-python  the Qiskit examples and the simulator cross-check (pip install -r requirements.txt)
# make shots        every level in headless Chromium at four sizes; screenshots in /tmp/qq
# make test-all     all three
# make generate     rebuild src/examples.js, tests/sim_cases.json, docs/REFERENCES.md
# make check-refs   resolve every DOI, arXiv id and URL online (needs network)
# make serve        play at http://localhost:8000
PY ?= python3

test:
	node --test test/*.test.js

test-python:
	$(PY) -m pytest -q tests

shots:
	node test/shots.js

test-all: test test-python shots

generate:
	node tools/embed-examples.js
	node tools/export-cases.js
	node tools/gen-references.js

check-refs:
	node tools/check-refs.js

serve:
	python3 -m http.server 8000

.PHONY: test test-python shots test-all generate check-refs serve
