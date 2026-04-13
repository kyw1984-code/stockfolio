#!/bin/sh

set -e

echo "=== Installing Node.js dependencies ==="
cd "$CI_PRIMARY_REPOSITORY_PATH/stockfolio"
npm install

echo "=== Installing CocoaPods ==="
cd "$CI_PRIMARY_REPOSITORY_PATH/stockfolio/ios"
pod install

echo "=== Done ==="
