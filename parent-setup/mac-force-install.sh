#!/bin/bash
# Mathlete Daily Coach — install from the Chrome Web Store and stop it from being removed or turned off.
# Run: sudo bash mac-force-install.sh <STORE_ID>      (the 32-letter ID from the listing URL)
# Undo: sudo bash mac-lockdown.sh --undo
set -e
ID="$1"
if ! [[ "$ID" =~ ^[a-p]{32}$ ]]; then echo "Usage: sudo bash mac-force-install.sh <32-letter store ID>"; exit 1; fi
PLIST="/Library/Managed Preferences/com.google.Chrome.plist"
mkdir -p "/Library/Managed Preferences"
defaults write "$PLIST" ExtensionInstallForcelist -array "$ID;https://clients2.google.com/service/update2/crx"
chmod 644 "$PLIST"
echo "Done. Quit Chrome (Cmd+Q) and reopen, then check chrome://policy shows ExtensionInstallForcelist."
