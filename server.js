// Simple Node/Express backend that proxies Internet Archive searches and (optionally) fetches TMDB metadata.
// Usage:
//  - set TMDB_API_KEY in environment if you want TMDB metadata enrichment (optional).
//  - node server.js
// Endpoints:
//  - GET /api/ia/search?q=...&page=1
//  - GET /api/ia/item/:identifier  (fetch metadata from archive.org metadata endpoint)
//  - GET / (serves frontend)

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''; // optional

app.use(express.static(path.join(__dirname, 'public')));

// Internet Archive advanced search wrapper
app.get('/api/ia/search', async (req, res) => {
  try {
    const q = req.query.q || 'mediatype:(movies OR films) AND collection:(feature_films OR movingimage)'; // default search
    const page = parseInt(req.query.page || '1', 10);
    const rows = 25;
    const start = (page - 1) * rows;
    const iaUrl = 'https://archive.org/advancedsearch.php';
    const params = {
      q,
      output: 'json',
      rows,
      start,
      fl: 'identifier,title,creator,year,description,mediatype,publicdate,collection',
      sort: 'downloads desc'
    };
    const r = await axios.get(iaUrl, { params, timeout: 10000 });
    const docs = (r.data && r.data.response && r.data.response.docs) || [];
    // Optionally enrich with TMDB if API key provided (best-effort match by title + year)
    if (TMDB_API_KEY && docs.length) {
      await Promise.all(docs.map(async (doc) => {
        try {
          const title = doc.title || '';
          const year = doc.year || '';
          if (!title) return;
          const tmdbSearch = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
              api_key: TMDB_API_KEY,
              query: title,
              year: year
            },
            timeout: 8000
          });
          const results = tmdbSearch.data && tmdbSearch.data.results;
          if (results && results.length) {
            const best = results[0];
            doc.tmdb = {
              id: best.id,
              title: best.title,
              overview: best.overview,
              poster_path: best.poster_path ? `https://image.tmdb.org/t/p/w300${best.poster_path}` : null,
              release_date: best.release_date
            };
          }
        } catch (err) {
          // non-fatal TMDB enrichment failure: ignore
        }
      }));
    }
    res.json({ success: true, docs, page });
  } catch (err) {
    console.error('IA search error', err.message || err);
    res.status(500).json({ success: false, error: 'Internet Archive search failed' });
  }
});

// Fetch Internet Archive item metadata (to find direct files/streams)
app.get('/api/ia/item/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const r = await axios.get(`https://archive.org/metadata/${encodeURIComponent(id)}`, { timeout: 10000 });
    // Filter files to common web-playable formats: mp4, ogg, webm, m4v, mp3 (if audio), and use 'original' or playable derivatives
    const files = (r.data && r.data.files) || [];
    const playable = files
      .filter(f => !!f.name)
      .map(f => ({
        name: f.name,
        format: f.format,
        size: f.size,
        source: f.source,
        url: f.name ? `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(f.name)}` : null
      }))
      .filter(f => {
        if (!f.url) return false;
        const fmt = (f.format || '').toLowerCase();
        return fmt.includes('mp4') || fmt.includes('m4v') || fmt.includes('webm') || fmt.includes('ogg') || fmt.includes('mpeg') || fmt.includes('h.264') || fmt.includes('matroska') || fmt.includes('mp3');
      });
    res.json({ success: true, metadata: r.data, playable });
  } catch (err) {
    console.error('IA item error', err.message || err);
    res.status(500).json({ success: false, error: 'Internet Archive metadata fetch failed' });
  }
});

// fallback - serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (TMDB_API_KEY) console.log('TMDB metadata enabled');
});
