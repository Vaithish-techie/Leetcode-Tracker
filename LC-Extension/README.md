# LC-Tracker Companion extension

This is a Chrome Manifest V3 extension. It uses the popup to inspect the active coding-problem tab and sends mistake logs to the authenticated Pattern Desk server.

## Install locally

1. Start the dashboard with `npm start`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this `LC-Extension` folder.
5. Copy the generated extension ID.
6. Put this in the dashboard `.env`:

   ```text
   ALLOWED_ORIGIN=chrome-extension://YOUR_EXTENSION_ID
   ```

7. Restart the dashboard server.
8. Open a supported LeetCode/GFG/Codeforces/etc. problem, click the extension icon, and sign in with the same Pattern Desk account.

The popup uses an authenticated session and, when available, a time-limited server session token stored in extension storage. It also needs the exact CORS origin because the authenticated dashboard API is on `localhost:8000`. Do not use `*` for `ALLOWED_ORIGIN`.

For a deployed dashboard, change `SERVER` in `popup.js` and add that deployed origin to the extension manifest's `host_permissions`.
