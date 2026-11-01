# LC-Tracker Companion extension

This is a Chrome Manifest V3 extension. It uses the popup to inspect the active coding-problem tab and sends mistake logs to the authenticated Pattern Desk server.

## Install locally

1. Start the dashboard with `npm start`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this `LC-Extension` folder.
5. Open a supported LeetCode/GFG/Codeforces/etc. problem, click the extension icon, and sign in with the same Pattern Desk account.

The popup uses an authenticated session and stores a time-limited server session token in extension storage. The server does not require an extension ID or an extension-specific CORS setting. Chrome's `host_permissions` allow the extension to call the configured dashboard URL.

For a different deployed dashboard, change `SERVER` in `popup.js` and add that origin to the extension manifest's `host_permissions`. Reload the unpacked extension after changing the manifest.
