#!/bin/bash
# MATHCOUNTS Daily Coach — Chrome lockdown for macOS.
# Run: sudo bash mac-lockdown.sh        Undo: sudo bash mac-lockdown.sh --undo
set -e
PLIST="/Library/Managed Preferences/com.google.Chrome.plist"
if [ "$1" = "--undo" ]; then rm -f "$PLIST"; echo "Removed. Restart Chrome."; exit 0; fi
mkdir -p "/Library/Managed Preferences"
defaults write "$PLIST" IncognitoModeAvailability -int 1
defaults write "$PLIST" BrowserGuestModeEnabled -bool false
defaults write "$PLIST" BrowserAddPersonEnabled -bool false
defaults write "$PLIST" DeveloperToolsAvailability -int 2
defaults write "$PLIST" ExtensionDeveloperModeSettings -int 0
defaults write "$PLIST" URLBlocklist -array "chrome://extensions" "chrome://settings" "chrome://flags" "chrome://inspect" "chrome://policy" "chromewebstore.google.com" "chrome.google.com/webstore"
chmod 644 "$PLIST"
echo "Done. Quit Chrome completely (Cmd+Q) and reopen. To undo later: sudo bash mac-lockdown.sh --undo"
