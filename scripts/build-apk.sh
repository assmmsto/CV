#!/bin/bash
# Build a signed release APK for CV Studio without Gradle:
#   aapt2 compile/link → javac → d8 → zip classes.dex → zipalign → apksigner
set -e
cd /home/z/my-project

BT_DIR=$(find /tmp/android-sdk -maxdepth 1 -type d -name "android-14" | head -1)
PLATFORM_JAR=$(find /tmp/android-sdk -maxdepth 2 -name "android.jar" | head -1)
[ -x "$BT_DIR/aapt2" ] || { echo "FATAL: aapt2 not found"; exit 1; }
[ -f "$PLATFORM_JAR" ] || { echo "FATAL: android.jar not found"; exit 1; }

WORK=/tmp/apk-build
rm -rf "$WORK" && mkdir -p "$WORK/gen" "$WORK/classes" "$WORK/dex"

# prefer a full JDK when available (JRE lacks javac)
JAVA_BIN=$(dirname "$(readlink -f "$(command -v java)")")
if [ ! -x "$JAVA_BIN/javac" ]; then
  PORT_JDK=$(find /tmp -maxdepth 1 -type d -name "jdk-21*" | head -1)
  [ -x "$PORT_JDK/bin/javac" ] && export PATH="$PORT_JDK/bin:$PATH" && JAVA_BIN="$PORT_JDK/bin"
fi
command -v javac >/dev/null || { echo "FATAL: javac not found"; exit 1; }

echo "[1/9] copying static web into assets"
rm -rf android-project/assets
mkdir -p android-project/assets
cp -r out/. android-project/assets/

echo "[2/9] aapt2 compile resources"
"$BT_DIR/aapt2" compile --dir android-project/res -o "$WORK/res.zip"

echo "[3/9] aapt2 link"
"$BT_DIR/aapt2" link \
  -o "$WORK/base.apk" \
  -I "$PLATFORM_JAR" \
  --manifest android-project/AndroidManifest.xml \
  -R "$WORK/res.zip" \
  --java "$WORK/gen" \
  -A android-project/assets \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 2 --version-name "1.0.1" \
  --auto-add-overlay

echo "[4/9] javac"
find "$WORK/gen" android-project/java -name "*.java" > "$WORK/sources.txt"
java_ver=$(javac --version 2>&1 | grep -o '[0-9]*' | head -1)
javac --release 11 -classpath "$PLATFORM_JAR" -d "$WORK/classes" @"$WORK/sources.txt" 2>&1 | grep -v "^warning" || true

echo "[5/9] dex (official R8 jar — build-tools d8 has a known NPE with inner classes)"
R8_JAR=/tmp/android-sdk/r8.jar
if [ ! -f "$R8_JAR" ]; then
  curl -sSfL -o "$R8_JAR" "https://dl.google.com/android/maven2/com/android/tools/r8/8.3.37/r8-8.3.37.jar"
fi
find "$WORK/classes" -name "*.class" > "$WORK/classes.txt"
java -cp "$R8_JAR" com.android.tools.r8.D8 --release --lib "$PLATFORM_JAR" --min-api 24 --output "$WORK/dex" @"$WORK/classes.txt"

echo "[6/9] pack classes.dex into APK"
(cd "$WORK/dex" && zip -q "$WORK/base.apk" classes.dex)

echo "[7/9] zipalign"
"$BT_DIR/zipalign" -f 4 "$WORK/base.apk" "$WORK/aligned.apk"

echo "[8/9] keystore + sign"
KS=download/cv-studio-release.keystore
if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -alias cvstudio \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass 'CVstudio-2026-key' -keypass 'CVstudio-2026-key' \
    -dname "CN=CV Studio, OU=CVStudio, O=assmmsto, C=SA"
fi
"$BT_DIR/apksigner" sign \
  --ks "$KS" --ks-key-alias cvstudio \
  --ks-pass pass:'CVstudio-2026-key' --key-pass pass:'CVstudio-2026-key' \
  --out download/cv-studio.apk \
  "$WORK/aligned.apk"

echo "[9/9] verify"
"$BT_DIR/apksigner" verify --print-certs download/cv-studio.apk | head -6
ls -lh download/cv-studio.apk
echo "APK BUILD OK"
