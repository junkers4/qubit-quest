// Package qubitquest holds the game's files (the same static page as index.html) so the
// desktop app in ./desktop can carry the whole game inside one program.
package qubitquest

import "embed"

//go:embed index.html src
var Files embed.FS
