#!/bin/sh

set -e

echo "=== Installing Node.js ==="
brew install node

echo "=== Installing Node.js dependencies ==="
cd "$CI_PRIMARY_REPOSITORY_PATH/stockfolio"
npm install

echo "=== Installing CocoaPods ==="
cd "$CI_PRIMARY_REPOSITORY_PATH/stockfolio/ios"
pod install

echo "=== Patching JS_RUNTIME_HERMES in xcconfig ==="
find "$CI_PRIMARY_REPOSITORY_PATH/stockfolio/ios/Pods/Target Support Files/RNWorklets" \
  -name "*.xcconfig" | while read f; do
  if grep -q "GCC_PREPROCESSOR_DEFINITIONS" "$f"; then
    sed -i '' 's/GCC_PREPROCESSOR_DEFINITIONS = \$(inherited) COCOAPODS=1$/GCC_PREPROCESSOR_DEFINITIONS = $(inherited) COCOAPODS=1 JS_RUNTIME_HERMES=1/' "$f"
    echo "Patched: $f"
  fi
done

echo "=== Done ==="
