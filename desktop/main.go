// Qubit Quest as a desktop app: one program with the whole game inside. It serves the game
// to itself on 127.0.0.1 only and opens it in its own window (Edge, Chrome or Chromium in app
// mode: no address bar, no tabs), or in the default browser when none of those is installed.
// It needs no network, and quits a little after the last window closes.
//
//	qubit-quest          play
//	qubit-quest -all     play with every level unlocked
//	qubit-quest -serve   only serve the game and print its address (for tests)
//	qubit-quest -version
package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"
)

// version is set by the build (tools/package.sh).
var version = "dev"

// A fixed port keeps the page's address, and so the saved progress, the same every run.
const port = 47823

// How long the program waits for the page after its window closed, or after the page fell
// silent (a hidden window's timers can be slowed to once a minute).
const (
	afterBye     = 4 * time.Second
	afterSilence = 3 * time.Minute
)

func main() {
	all := flag.Bool("all", false, "unlock every level")
	serveOnly := flag.Bool("serve", false, "only serve the game and print its address")
	showVersion := flag.Bool("version", false, "print the version")
	flag.Parse()
	if *showVersion {
		fmt.Println("Qubit Quest", version)
		return
	}

	query := ""
	if *all {
		query = "?all"
	}

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		// Already running? Then open one more window on it and leave.
		url := fmt.Sprintf("http://127.0.0.1:%d/", port)
		if running(url) && !*serveOnly {
			if err := openWindow(url+query, nil); err != nil {
				log.Fatal(err)
			}
			return
		}
		if ln, err = net.Listen("tcp", "127.0.0.1:0"); err != nil {
			log.Fatal(err)
		}
	}
	url := fmt.Sprintf("http://%s/", ln.Addr())

	s := newServer()
	go func() {
		if err := http.Serve(ln, s); err != nil && !errors.Is(err, net.ErrClosed) {
			log.Fatal(err)
		}
	}()

	if *serveOnly {
		fmt.Println(url)
		select {}
	}
	if err := openWindow(url+query, s.browserEnded); err != nil {
		log.Fatal(err)
	}
	s.waitUntilClosed(afterBye, afterSilence)
	os.Exit(0)
}

// running tells whether a Qubit Quest already answers at url.
func running(url string) bool {
	c := http.Client{Timeout: time.Second}
	r, err := c.Get(url + "qq-alive")
	if err != nil {
		return false
	}
	r.Body.Close()
	return r.StatusCode == http.StatusNoContent && r.Header.Get("X-Qubit-Quest") != ""
}
