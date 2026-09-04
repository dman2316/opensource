Free Movies TV — Additional features, deployment helpers, and integration notes

This document explains the optional features listed when the project was added, and how to enable them safely.

1) TMDB metadata (optional)
- The server already reads TMDB_API_KEY from the environment. To enable:
  - Obtain a TMDB API key at https://www.themoviedb.org/settings/api
  - On Linux/macOS: export TMDB_API_KEY=your_key_here
  - Restart the service (systemd/pm2/docker) so the server picks up the key.
- The server will perform best-effort title/year matching; results are not guaranteed.

2) YouTube integration (optional)
- YouTube Data API requires an API key and has usage quotas.
- Implementation notes:
  - Add endpoints to search YouTube and return embeddable video IDs only when the video owner permits embedding.
  - Do NOT attempt to bypass YouTube's restrictions or scrape private content.
  - To enable: create a Google Cloud project, enable YouTube Data API v3, create API key, then set YOUTUBE_API_KEY in the environment and add safe wiring in server.js.

3) Chromecast / Casting
- Web apps on a TV can be cast with Chromecast if the receiver is available and the site is served over HTTPS (required for Cast SDK to work reliably on many devices).
- Options:
  - Use the Chrome Sender SDK on desktop/mobile to cast the page to a Chromecast device.
  - For a custom receiver, you'll need to register and host the receiver app (see Google Cast docs).
- For most users: open the site on a phone/Chrome and use built-in cast to send the page to a Chromecast.

4) Android TV
- Short path (web app on TV): point the Smart TV WebView to the hosted app URL. Many Android TV devices can open a webpage via a browser or via a WebView wrapper (e.g., Trusted Web Activity or a minimal Android app that loads the URL in a WebView and enables media playback).
- Native app (longer): build an Android TV app using Android Studio, use ExoPlayer for playback, and implement a Browse/Details/Playback flow (Leanback library). This requires packaging and publishing.

5) HTTPS and hosting
- Recommended for casting and best compatibility. Use a reverse proxy (nginx) with Let's Encrypt for TLS termination.
- For local network only, you can use tools like ngrok for temporary HTTPS exposure.

6) Legal / Content
- This app only surfaces links returned by Internet Archive and other free sources. Ensure each item's license allows playback.
- Do NOT integrate or link to torrents or other infringing sources.

7) Contribution / PRs
- If you add features that require API keys, do not commit keys. Use environment variables or secret managers.

If you want, I can implement YouTube/TMDB wiring (server endpoints + UI) now — provide the API key(s) and I'll add the safe wiring (keys will not be committed). I can also create a minimal Android Studio project template for the native Android TV app.
