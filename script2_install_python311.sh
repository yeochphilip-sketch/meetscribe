#!/bin/bash
echo "=== Installing Python 3.11 via Homebrew ==="
brew install python@3.11
echo ""
echo "=== Python 3.11 installed at ==="
which python3.11 || echo "Not found in PATH"
ls -la /opt/homebrew/bin/python3.11 2>/dev/null || ls -la /usr/local/bin/python3.11 2>/dev/null
