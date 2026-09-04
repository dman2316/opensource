# Free Movies for Smart TV (legal sources only)

This small app aggregates free, legal movies (Internet Archive public-domain and other free media) and plays them in a browser — suitable for Smart TV browsers or casting.

Features
- Search Internet Archive for movies/films
- Show metadata (optional TMDB enrichment if you set TMDB_API_KEY)
- Play web-compatible files (mp4/webm/ogg) directly in the browser

Installation
1. Install Node.js (16+ recommended).
2. Save the files from this repo (server.js, package.json, public/*).
3. (Optional) Set TMDB_API_KEY environment variable if you want metadata enrichment:
   - export TMDB_API_KEY=your_key_here
4. Install dependencies and start:
   - npm install
   - npm start
5. On your PC: open http://localhost:3000 to test.
6. On your Smart TV: find your computer's local IP (e.g., 192.168.1.42) and open http://192.168.1.42:3000 in the TV browser. Or host on a public server.

Notes / Limitations
- The app only uses public, embeddable files returned by Internet Archive. Ensure streaming is allowed for each item. Be respectful of bandwidth and legal restrictions.
