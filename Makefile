# make test   - simulator and level checks (node)
# make shots  - play every level in headless Chromium, screenshots in /tmp/qq
# make serve  - play it at http://localhost:8000
test:
	node --test test/sim.test.js test/levels.test.js

shots:
	node test/shots.js

test-all: test shots

serve:
	python3 -m http.server 8000

.PHONY: test shots test-all serve
