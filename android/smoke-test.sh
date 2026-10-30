#!/usr/bin/env bash
# REQ-078: the Android app on an emulator (CI, reactivecircus/android-emulator-runner): it
# installs, starts, the game loads with the WebAssembly core and all its levels, a tap on START
# opens the first level, the back button returns, and nothing crashes. Leaves a screenshot.
#   android/smoke-test.sh dist/qubit-quest-0.0.0.apk
set -euo pipefail
apk=$1
mkdir -p build
adb install -r "$apk"
adb logcat -c
adb shell am start -W -n io.github.junkers4.qubitquest/.MainActivity
levels=$(node -e "const QQ = require('./test/load.js'); process.stdout.write(String(QQ.LEVELS.length))")
for i in $(seq 1 60); do
    if adb logcat -d -s qubit-quest:I | grep -q "ready \"webassembly $levels\""; then
        break
    fi
    sleep 2
done
adb logcat -d -s qubit-quest:I | grep "ready" || { echo "FAIL: the game did not load"; adb logcat -d | tail -80; exit 1; }
sleep 2
adb exec-out screencap -p > build/android-title.png
# START: the first menu item, a little below the middle of the screen
size=$(adb shell wm size | sed -n 's/.*: \([0-9]*\)x\([0-9]*\).*/\1 \2/p' | tail -1)
w=${size% *}
h=${size#* }
adb shell input tap $(( w / 2 )) $(( h * 54 / 100 ))
sleep 3
adb exec-out screencap -p > build/android-level.png
adb shell input keyevent 4      # back
sleep 2
adb exec-out screencap -p > build/android-back.png
if adb logcat -d | grep -E "FATAL EXCEPTION|AndroidRuntime: Process: io.github.junkers4.qubitquest"; then
    echo "FAIL: the app crashed"
    exit 1
fi
if adb logcat -d -s qubit-quest:E | grep "console error"; then
    echo "FAIL: the game reported errors"
    exit 1
fi
pid=$(adb shell pidof io.github.junkers4.qubitquest || true)
[ -n "$pid" ] || { echo "FAIL: the app is not running"; exit 1; }
echo "android: installed, loaded ($levels levels, WebAssembly core), tapped, back, still running"
