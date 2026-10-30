package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"
)

func get(t *testing.T, s *server, path string) *http.Response {
	t.Helper()
	w := httptest.NewRecorder()
	s.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
	return w.Result()
}

// REQ-060: the program carries the whole game: index.html and every script it loads.
func TestServesTheWholeGame(t *testing.T) {
	s := newServer()
	r := get(t, s, "/")
	body, _ := io.ReadAll(r.Body)
	page := string(body)
	if r.StatusCode != 200 || !strings.Contains(page, "<canvas id=\"screen\"") {
		t.Fatalf("index: %d", r.StatusCode)
	}
	if !strings.Contains(page, "/qq-alive") || !strings.Contains(page, "/qq-bye") {
		t.Error("index lacks the heartbeat")
	}
	if !strings.Contains(page, `href="/qq-icon.png"`) {
		t.Error("index lacks the window icon")
	}
	if r := get(t, s, "/qq-icon.png"); r.StatusCode != 200 || r.Header.Get("Content-Type") != "image/png" {
		t.Errorf("icon: %d", r.StatusCode)
	}
	scripts := regexp.MustCompile(`<script src="([^"]+)"`).FindAllStringSubmatch(page, -1)
	if len(scripts) < 10 {
		t.Fatalf("only %d scripts", len(scripts))
	}
	for _, m := range scripts {
		r := get(t, s, "/"+m[1])
		if r.StatusCode != 200 || !strings.Contains(r.Header.Get("Content-Type"), "javascript") {
			t.Errorf("%s: %d %s", m[1], r.StatusCode, r.Header.Get("Content-Type"))
		}
	}
	if r := get(t, s, "/nothing.js"); r.StatusCode != 404 {
		t.Errorf("unknown file: %d", r.StatusCode)
	}
	if csp := r.Header.Get("Content-Security-Policy"); !strings.Contains(csp, "default-src 'self'") {
		t.Errorf("CSP: %q", csp)
	}
}

// REQ-061: the program quits once the last window has closed, and not before.
func TestQuitsAfterTheLastWindow(t *testing.T) {
	s := newServer()
	start := time.Now()
	bye, silence := 4*time.Second, 3*time.Minute
	at := func(d time.Duration) time.Time { return start.Add(d) }
	if s.quit(at(time.Minute), start, bye, silence) {
		t.Fatal("quit before the window opened")
	}
	if !s.quit(at(4*time.Minute), start, bye, silence) {
		t.Fatal("waits forever for a window that never opens")
	}

	s = newServer()
	get(t, s, "/qq-alive?page=a")
	get(t, s, "/qq-alive?page=b")
	get(t, s, "/qq-bye?page=a")
	now := time.Now()
	if s.quit(now.Add(10*time.Second), start, bye, silence) {
		t.Fatal("quit while window b is open")
	}
	get(t, s, "/qq-bye?page=b") // b closes, then comes back (a reload)
	get(t, s, "/qq-alive?page=c")
	if s.quit(time.Now().Add(10*time.Second), start, bye, silence) {
		t.Fatal("quit on a reload")
	}
	get(t, s, "/qq-bye?page=c")
	if s.quit(time.Now().Add(time.Second), start, bye, silence) {
		t.Fatal("quit before the grace time")
	}
	if !s.quit(time.Now().Add(5*time.Second), start, bye, silence) {
		t.Fatal("did not quit after the last window closed")
	}

	s = newServer() // a window that crashed without a goodbye
	get(t, s, "/qq-alive?page=d")
	if !s.quit(time.Now().Add(4*time.Minute), start, bye, silence) {
		t.Fatal("did not notice a silent window")
	}

	s = newServer() // the window's browser was killed
	get(t, s, "/qq-alive?page=e")
	s.browserEnded()
	if !s.quit(time.Now().Add(5*time.Second), start, bye, silence) {
		t.Fatal("did not quit after the browser ended")
	}
}

func TestAppWindowArgs(t *testing.T) {
	a := strings.Join(appArgs("http://127.0.0.1:1/", "/p"), " ")
	for _, want := range []string{"--app=http://127.0.0.1:1/", "--user-data-dir=/p"} {
		if !strings.Contains(a, want) {
			t.Errorf("missing %s in %s", want, a)
		}
	}
}
