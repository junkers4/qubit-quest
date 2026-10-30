package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

// browsers lists the Chromium-family browsers that can show a page as an app window, most
// likely first. QQ_BROWSER names another one.
func browsers() []string {
	var list []string
	if b := os.Getenv("QQ_BROWSER"); b != "" {
		list = append(list, b)
	}
	switch runtime.GOOS {
	case "windows":
		for _, dir := range []string{os.Getenv("ProgramFiles(x86)"), os.Getenv("ProgramFiles"), os.Getenv("LocalAppData")} {
			if dir == "" {
				continue
			}
			list = append(list,
				filepath.Join(dir, `Microsoft\Edge\Application\msedge.exe`),
				filepath.Join(dir, `Google\Chrome\Application\chrome.exe`),
				filepath.Join(dir, `BraveSoftware\Brave-Browser\Application\brave.exe`),
				filepath.Join(dir, `Chromium\Application\chrome.exe`))
		}
	case "darwin":
		for _, app := range []string{"Google Chrome", "Microsoft Edge", "Chromium", "Brave Browser"} {
			list = append(list, "/Applications/"+app+".app/Contents/MacOS/"+app)
		}
	default:
		for _, name := range []string{"google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
			"microsoft-edge", "microsoft-edge-stable", "brave-browser", "vivaldi"} {
			if p, err := exec.LookPath(name); err == nil {
				list = append(list, p)
			}
		}
	}
	var found []string
	for _, p := range list {
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			found = append(found, p)
		}
	}
	return found
}

// appArgs are the browser flags for one game window. The browser profile of its own keeps
// the game apart from the person's browsing and keeps the saved progress; the game is all
// local, so the window's browser has no reason to go online in the background either.
func appArgs(url, profile string) []string {
	return []string{
		"--app=" + url,
		"--user-data-dir=" + profile,
		"--window-size=1280,840",
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-features=Translate",
		"--disable-background-networking",
		"--disable-component-update",
		"--disable-sync",
	}
}

func profileDir() string {
	dir, err := os.UserConfigDir()
	if err != nil {
		dir = os.TempDir()
	}
	return filepath.Join(dir, "qubit-quest", "window")
}

// openWindow shows url as an app window, or in the default browser when no app-window
// browser is installed. It does not wait for the window; closed is called when the app
// window's browser ends (nil: nobody needs to know).
func openWindow(url string, closed func()) error {
	for _, b := range browsers() {
		cmd := exec.Command(b, appArgs(url, profileDir())...)
		if cmd.Start() == nil {
			go func() {
				cmd.Wait()
				if closed != nil {
					closed()
				}
			}()
			return nil
		}
	}
	return defaultBrowser(url)
}

func defaultBrowser(url string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	return cmd.Start()
}
