# PR: Add free-movies-tv app — Internet Archive streamer + TV frontend

Summary
- Adds a small Node/Express app and TV-optimized frontend that searches Internet Archive and plays web-playable files (mp4/webm/ogg).
- Includes deployment helpers: Dockerfile, docker-compose, systemd unit, and PM2 ecosystem file.
- Optional TMDB enrichment is supported via the TMDB_API_KEY environment variable (not committed).

Files added
- package.json
- server.js
- public/index.html
- public/app.js
- README.md
- Dockerfile
- docker-compose.yml
- deploy/free-movies-tv.service
- pm2/ecosystem.config.js
- docs/FEATURES.md

Notes
- No API keys included. TMDB and YouTube integrations are optional and must be enabled via environment variables.
- This app is legal-sources-only; it intentionally excludes torrents or other infringing sources.

How to test
- npm install && npm start
- Open http://localhost:3000 locally, or access the server from your Smart TV browser using the host IP.

Request
- Please review and merge into the default branch when ready. I'm happy to follow up with a Docker image, CI workflow, or native Android TV skeleton if you'd like.
