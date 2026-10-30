package main

import (
	"bytes"
	_ "embed"
	"io/fs"
	"net/http"
	"sync"
	"time"

	qubitquest "github.com/junkers4/qubit-quest"
)

// Each page tells the program it is still open, and that it closed, so the program can quit
// when the last window is gone. Only the desktop app adds this to index.html.
const heartbeat = `<script>
(function () {
    var id = Math.random().toString(36).slice(2);
    function alive() { fetch('/qq-alive?page=' + id, {cache: 'no-store'}).catch(function () {}); }
    alive();
    setInterval(alive, 15000);
    addEventListener('pageshow', alive);
    addEventListener('pagehide', function () { navigator.sendBeacon('/qq-bye?page=' + id); });
})();
</script>
`

// The window and task bar icon (the web page has none).
//
//go:embed icon.png
var iconPNG []byte

type server struct {
	files http.Handler
	index []byte

	mu    sync.Mutex
	pages map[string]time.Time // open pages and their last call
	empty time.Time            // when the last open page closed; zero while one is open
}

func newServer() *server {
	index, err := fs.ReadFile(qubitquest.Files, "index.html")
	if err != nil {
		panic(err)
	}
	index = bytes.Replace(index, []byte("</body>"), []byte(heartbeat+"</body>"), 1)
	index = bytes.Replace(index, []byte(`<link rel="icon" href="data:,">`), []byte(`<link rel="icon" href="/qq-icon.png">`), 1)
	return &server{files: http.FileServer(http.FS(qubitquest.Files)), index: index, pages: map[string]time.Time{}}
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h := w.Header()
	h.Set("X-Qubit-Quest", "1")
	h.Set("Cache-Control", "no-store")
	// The game loads nothing from elsewhere; keep it that way.
	h.Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:")
	switch r.URL.Path {
	case "/", "/index.html":
		h.Set("Content-Type", "text/html; charset=utf-8")
		w.Write(s.index)
	case "/qq-icon.png":
		h.Set("Content-Type", "image/png")
		w.Write(iconPNG)
	case "/qq-alive":
		if id := r.URL.Query().Get("page"); id != "" {
			s.mu.Lock()
			s.pages[id] = time.Now()
			s.empty = time.Time{}
			s.mu.Unlock()
		}
		w.WriteHeader(http.StatusNoContent)
	case "/qq-bye":
		s.mu.Lock()
		if _, open := s.pages[r.URL.Query().Get("page")]; open {
			delete(s.pages, r.URL.Query().Get("page"))
			if len(s.pages) == 0 {
				s.empty = time.Now()
			}
		}
		s.mu.Unlock()
		w.WriteHeader(http.StatusNoContent)
	default:
		s.files.ServeHTTP(w, r)
	}
}

// quit tells whether the program should end now: the last open page closed more than
// afterBye ago (a reload says goodbye and comes straight back), or no page called within
// afterSilence (a window that died without saying goodbye). Before the first page calls it
// waits up to afterSilence for the window to open.
func (s *server) quit(now, started time.Time, afterBye, afterSilence time.Duration) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, last := range s.pages {
		if now.Sub(last) > afterSilence {
			delete(s.pages, id)
			if len(s.pages) == 0 {
				s.empty = last
			}
		}
	}
	if len(s.pages) > 0 {
		return false
	}
	if s.empty.IsZero() { // no page yet
		return now.Sub(started) > afterSilence
	}
	return now.Sub(s.empty) > afterBye
}

// browserEnded is called when the browser of the app window has ended: its pages are gone
// even if they could not say goodbye (the browser crashed or was killed).
func (s *server) browserEnded() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.pages) > 0 {
		s.pages = map[string]time.Time{}
		s.empty = time.Now()
	}
}

func (s *server) waitUntilClosed(afterBye, afterSilence time.Duration) {
	started := time.Now()
	for !s.quit(time.Now(), started, afterBye, afterSilence) {
		time.Sleep(time.Second)
	}
}
