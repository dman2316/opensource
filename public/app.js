// Frontend: search Internet Archive via backend, list results, allow playing playable files.
// Remote/TV friendly: large controls, arrow/tab focus will work on many TV remotes (test on your TV).

const qInput = document.getElementById('q');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');
const player = document.getElementById('player');
const details = document.getElementById('details');

async function search(query, page = 1) {
  resultsEl.innerHTML = '<div style="padding:18px;color:#9fb0c8">Searching…</div>';
  try {
    const res = await fetch(`/api/ia/search?q=${encodeURIComponent(query)}&page=${page}`);
    const j = await res.json();
    if (!j.success) throw new Error('search failed');
    renderResults(j.docs || []);
  } catch (err) {
    resultsEl.innerHTML = `<div style="padding:18px;color:#f66">Search failed: ${err.message}</div>`;
  }
}

function renderResults(docs) {
  resultsEl.innerHTML = '';
  if (!docs.length) {
    resultsEl.innerHTML = '<div style="padding:18px;color:#9fb0c8">No results</div>';
    return;
  }
  for (const doc of docs) {
    const item = document.createElement('div');
    item.className = 'item';
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    // use tmdb poster if available
    if (doc.tmdb && doc.tmdb.poster_path) {
      const img = document.createElement('img');
      img.src = doc.tmdb.poster_path;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      thumb.innerHTML = '';
      thumb.appendChild(img);
    } else {
      thumb.textContent = (doc.year || '') + (doc.creator ? ' • ' + doc.creator : '');
    }
    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = doc.title || doc.identifier || 'Untitled';
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = (doc.description ? (doc.description.slice(0, 140) + (doc.description.length > 140 ? '…' : '')) : 'No description') + (doc.tmdb && doc.tmdb.release_date ? ' • ' + doc.tmdb.release_date : '');
    meta.appendChild(title);
    meta.appendChild(sub);
    const playBtn = document.createElement('button');
    playBtn.className = 'play';
    playBtn.textContent = 'Play';
    playBtn.addEventListener('click', () => onSelect(doc));
    item.appendChild(thumb);
    item.appendChild(meta);
    item.appendChild(playBtn);
    resultsEl.appendChild(item);
  }
}

async function onSelect(doc) {
  details.innerHTML = 'Loading sources…';
  // fetch item metadata for playable files from backend
  try {
    const res = await fetch(`/api/ia/item/${encodeURIComponent(doc.identifier)}`);
    const j = await res.json();
    if (!j.success) throw new Error('failed to fetch item metadata');
    const playable = j.playable || [];
    if (!playable.length) {
      details.innerHTML = '<div style="color:#f66">No playable web files found for this item.</div>';
      player.pause();
      player.removeAttribute('src');
      return;
    }
    // Pick a good candidate: mp4 with largest size
    playable.sort((a,b) => (parseInt(b.size||0,10) || 0) - (parseInt(a.size||0,10) || 0));
    // build UI: list of sources and play the first
    const html = [];
    html.push(`<div style="font-weight:700;font-size:18px;">${doc.title}</div>`);
    if (doc.tmdb && doc.tmdb.overview) html.push(`<div style="margin-top:6px;color:#9fb0c8">${doc.tmdb.overview}</div>`);
    html.push('<div style="margin-top:10px">Sources:</div>');
    for (const p of playable) {
      const name = p.name;
      const fmt = p.format || '';
      html.push(`<div style="margin-top:6px"><button class="playSource" data-url="${p.url}" style="padding:8px 10px;border-radius:8px;background:#6ad1ff;border:0;color:#04292f;font-weight:700;cursor:pointer">${name} — ${fmt} — ${p.size||'unknown'}</button></div>`);
    }
    details.innerHTML = html.join('');
    // click handler for source buttons
    Array.from(details.querySelectorAll('.playSource')).forEach(btn => btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      startPlaying(url);
    }));
    // auto play first source
    startPlaying(playable[0].url);
  } catch (err) {
    details.innerHTML = `<div style="color:#f66">Error loading item: ${err.message}</div>`;
  }
}

function startPlaying(url) {
  try {
    player.src = url;
    player.play().catch(()=>{/* autoplay might be blocked on some TVs; user can press play */});
    details.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    details.innerHTML = `<div style="color:#f66">Failed to play: ${err.message}</div>`;
  }
}

// Event listeners
searchBtn.addEventListener('click', () => {
  const q = qInput.value.trim() || 'mediatype:(movies OR films)'; // default
  search(q);
});
qInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

// initial sample search for public-domain / classic movies
search('subject:"silent films" OR subject:publicdomain OR creator:chaplin');
