#!/bin/sh
# Builds the desktop app for Linux, Windows and macOS into dist/ (make desktop).
#   dist/qubit-quest-VERSION-linux-amd64.tar.gz   program, .desktop entry, icon, README, LICENSE
#   dist/qubit-quest_VERSION_amd64.deb            the same as a Debian / Ubuntu package
#   dist/qubit-quest-VERSION-windows-amd64.zip    qubit-quest.exe (with its icon), README, LICENSE
#   dist/qubit-quest-VERSION-macos-arm64.zip      the program (not signed)
# Needs Go only (the .deb also dpkg-deb). tools/icon draws the icons and the Windows resources.
set -eu
cd "$(dirname "$0")/.."
VERSION=${VERSION:-0.1.0}
OUT=dist
rm -rf "$OUT"
mkdir -p "$OUT"
LDFLAGS="-s -w -X main.version=$VERSION"

go run ./tools/icon

build() { # os arch name [extra ldflags]
    echo "build $1/$2"
    CGO_ENABLED=0 GOOS=$1 GOARCH=$2 go build -trimpath -ldflags "$LDFLAGS ${4:-}" -o "$OUT/$1-$2/$3" ./desktop
    cp README.md LICENSE "$OUT/$1-$2/"
}

for arch in amd64 arm64; do
    build linux $arch qubit-quest
    cp desktop/qubit-quest.desktop desktop/icon.png "$OUT/linux-$arch/"
    tar -C "$OUT/linux-$arch" -czf "$OUT/qubit-quest-$VERSION-linux-$arch.tar.gz" .

    build windows $arch qubit-quest.exe -H=windowsgui
    (cd "$OUT/windows-$arch" && zip -q -r "../qubit-quest-$VERSION-windows-$arch.zip" .)

    build darwin $arch qubit-quest
    (cd "$OUT/darwin-$arch" && zip -q -r "../qubit-quest-$VERSION-macos-$arch.zip" .)
done
rm -f desktop/rsrc_windows_*.syso

if command -v dpkg-deb >/dev/null; then
    for arch in amd64 arm64; do
        d="$OUT/deb-$arch"
        mkdir -p "$d/DEBIAN" "$d/usr/bin" "$d/usr/share/applications" \
            "$d/usr/share/icons/hicolor/256x256/apps" "$d/usr/share/doc/qubit-quest"
        cp "$OUT/linux-$arch/qubit-quest" "$d/usr/bin/"
        cp desktop/qubit-quest.desktop "$d/usr/share/applications/"
        cp desktop/icon.png "$d/usr/share/icons/hicolor/256x256/apps/qubit-quest.png"
        cp LICENSE "$d/usr/share/doc/qubit-quest/copyright"
        cat > "$d/DEBIAN/control" <<CONTROL
Package: qubit-quest
Version: $VERSION
Architecture: $arch
Maintainer: junkers4
Section: education
Priority: optional
Recommends: chromium | chromium-browser | google-chrome-stable | microsoft-edge-stable
Description: Learn quantum computing from zero, in pixel art
 60 levels from bits to the dilution refrigerator: lessons, quizzes and
 circuit puzzles, every fact with its source, Qiskit examples, and a
 simulator core written in WebAssembly. Opens in its own window; works
 offline.
CONTROL
        dpkg-deb --root-owner-group --build "$d" "$OUT/qubit-quest_${VERSION}_$arch.deb" >/dev/null
    done
fi

(cd "$OUT" && sha256sum *.tar.gz *.zip *.deb 2>/dev/null > SHA256SUMS)
ls -l "$OUT"
