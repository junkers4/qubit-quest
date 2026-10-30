#!/usr/bin/env bash
# Builds the Android app without Gradle: the web game (index.html, src/) as the APK's assets
# and one Java activity that shows it in a WebView (make android).
#   VERSION=1.2.3 android/build.sh  ->  dist/qubit-quest-1.2.3.apk
# Needs the Android SDK (ANDROID_HOME: build-tools with aapt2, d8, zipalign, apksigner, and a
# platform's android.jar), a JDK (javac, keytool) and Go (tools/icon draws the launcher icon).
# Signing: ANDROID_KEYSTORE (the keystore, base64), ANDROID_KEYSTORE_PASSWORD and
# ANDROID_KEY_ALIAS; without them a new throwaway key is made, and phones must uninstall an
# older copy before installing this one.
set -euo pipefail
cd "$(dirname "$0")/.."
sdk=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}
[ -d "$sdk" ] || { echo "no Android SDK: set ANDROID_HOME" >&2; exit 1; }
bt=$(ls -d "$sdk"/build-tools/* | sort -V | tail -1)
jar=$(ls -d "$sdk"/platforms/android-* | sort -V | tail -1)/android.jar
version=${VERSION:-0.0.0}
IFS=. read -r major minor patch <<< "$version"
code=$(( major * 10000 + minor * 100 + patch + 1 ))
out=build/android
rm -rf "$out" && mkdir -p "$out/res" "$out/assets" "$out/classes" "$out/dex" dist
echo "android: build-tools $(basename "$bt"), $(basename "$(dirname "$jar")"), version $version ($code)"

# resources: the theme, and the launcher icon drawn from the game's pixel icon
cp -r android/res/. "$out/res/"
go run ./tools/icon -android "$out/res"
"$bt/aapt2" compile --dir "$out/res" -o "$out/res.zip"

# the game itself, the same files as the web version
cp index.html "$out/assets/"
cp -r src "$out/assets/src"
"$bt/aapt2" link -o "$out/base.apk" -I "$jar" --manifest android/AndroidManifest.xml \
    --min-sdk-version 24 --target-sdk-version 35 --version-code "$code" --version-name "$version" \
    -A "$out/assets" "$out/res.zip"

# the activity
javac -nowarn --release 8 -cp "$jar" -d "$out/classes" android/src/io/github/junkers4/qubitquest/*.java
"$bt/d8" --min-api 24 --lib "$jar" --output "$out/dex" "$out"/classes/io/github/junkers4/qubitquest/*.class
cp "$out/base.apk" "$out/unsigned.apk"
(cd "$out/dex" && zip -q ../unsigned.apk classes.dex)
"$bt/zipalign" -f -p 4 "$out/unsigned.apk" "$out/aligned.apk"

# signing
if [ -n "${ANDROID_KEYSTORE:-}" ]; then
    echo "$ANDROID_KEYSTORE" | base64 -d > "$out/key.jks"
    pass=$ANDROID_KEYSTORE_PASSWORD
    alias=$ANDROID_KEY_ALIAS
else
    echo "android: no ANDROID_KEYSTORE, signing with a throwaway key"
    pass=throwaway
    alias=qubitquest
    keytool -genkeypair -keystore "$out/key.jks" -storepass "$pass" -keypass "$pass" -alias "$alias" \
        -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Qubit Quest" >/dev/null 2>&1
fi
apk=dist/qubit-quest-$version.apk
"$bt/apksigner" sign --ks "$out/key.jks" --ks-pass "pass:$pass" --key-pass "pass:$pass" \
    --ks-key-alias "$alias" --out "$apk" "$out/aligned.apk"
"$bt/apksigner" verify "$apk"
rm -f "$out/key.jks"
ls -l "$apk"
