#!/bin/bash
echo "=== Installing aider-chat with Python 3.11 ==="
PYTHON311="/opt/homebrew/bin/python3.11"
if [ ! -f "$PYTHON311" ]; then
    PYTHON311="/usr/local/bin/python3.11"
fi
if [ ! -f "$PYTHON311" ]; then
    echo "ERROR: python3.11 not found. Run script 2 first."
    exit 1
fi

echo "Using: $PYTHON311"
$PYTHON311 -m pip install --upgrade pip setuptools wheel
$PYTHON311 -m pip install aider-chat
