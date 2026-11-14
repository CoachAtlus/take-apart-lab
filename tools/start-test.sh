#!/bin/sh
# Usage: sh tools/start-test.sh <http-port> <chrome-debug-port>
# Serves the game on http://127.0.0.1:<http-port>/ and starts a headless Chrome you can drive with
#   CDP_PORT=<chrome-debug-port> node tools/shoot.mjs <outdir> <steps.json>
HP=${1:-8765}; CP=${2:-9333}
DIR=$(cd "$(dirname "$0")/.." && pwd)
(cd "$DIR" && python -m http.server "$HP" >/dev/null 2>&1 &)
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --remote-debugging-port="$CP" --user-data-dir="$TEMP/tal-chrome-$CP" --window-size=1280,800 --use-angle=swiftshader --enable-unsafe-swiftshader about:blank >/dev/null 2>&1 &
sleep 3; echo "server :$HP  chrome :$CP"
