// App bootstrap: load games into iframe and handle navigation
(function () {
  'use strict';

  /**
   * Elements
   */
  const menu = document.getElementById('menu');
  const player = document.getElementById('player');
  const frame = document.getElementById('game-frame');
  const backButton = document.getElementById('back-button');
  const playerTitle = document.getElementById('player-title');

  function ensureElements() {
    if (!menu || !player || !frame || !backButton || !playerTitle) {
      // If structure is missing, do nothing to avoid runtime errors
      return false;
    }
    return true;
  }

  function toTitleFromId(id) {
    if (!id) return 'Unknown Game';
    return id
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function showPlayer(gameId, entryUrl) {
    if (!ensureElements()) return;
    const url = entryUrl || `games/${gameId}/index.html`;
    frame.setAttribute('src', url);
    frame.setAttribute('data-current-game', gameId);
    playerTitle.textContent = toTitleFromId(gameId);

    menu.classList.add('hidden');
    player.classList.remove('hidden');
    // Give focus to frame for keyboard input
    setTimeout(() => frame?.focus?.(), 0);
  }

  function showMenu() {
    if (!ensureElements()) return;
    // Clear frame to free resources
    frame.setAttribute('src', 'about:blank');
    frame.removeAttribute('data-current-game');
    playerTitle.textContent = '';

    player.classList.add('hidden');
    menu.classList.remove('hidden');
    // Focus first playable button for accessibility
    const firstPlayButton = menu.querySelector('.play-button');
    if (firstPlayButton instanceof HTMLElement) firstPlayButton.focus();
  }

  // Click delegation for Play buttons
  document.addEventListener('click', function (e) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains('play-button')) {
      const gameId = target.getAttribute('data-game');
      const entry = target.getAttribute('data-entry') || undefined;
      if (!gameId) return;
      e.preventDefault();
      showPlayer(gameId, entry);
      return;
    }

    if (target.id === 'back-button') {
      e.preventDefault();
      showMenu();
      return;
    }
  });

  /**
   * Manifest loading and grid rendering
   */
  async function loadManifest() {
    try {
      const res = await fetch('assets/games.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Manifest is not an array');
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function createCard(game) {
    const { id, title, cover, entry } = game;
    const card = document.createElement('article');
    card.className = 'game-card';

    const img = document.createElement('img');
    img.src = cover || 'https://placekitten.com/320/214';
    img.alt = `Game cover: ${title || toTitleFromId(id)}`;
    card.appendChild(img);

    const h2 = document.createElement('h2');
    h2.className = 'game-title';
    h2.textContent = title || toTitleFromId(id);
    card.appendChild(h2);

    const btn = document.createElement('button');
    btn.className = 'play-button';
    btn.setAttribute('data-game', id);
    if (entry) btn.setAttribute('data-entry', entry);
    btn.setAttribute('aria-label', `Play ${title || toTitleFromId(id)}`);
    btn.textContent = 'Play';
    card.appendChild(btn);

    return card;
  }

  async function renderGrid() {
    if (!ensureElements()) return;
    const manifest = await loadManifest();
    // Clear existing content (except noscript in markup)
    menu.innerHTML = '';
    if (!manifest.length) {
      const p = document.createElement('p');
      p.style.gridColumn = '1 / -1';
      p.style.color = 'var(--muted)';
      p.textContent = 'No games found. Add entries to assets/games.json';
      menu.appendChild(p);
      return;
    }
    for (const game of manifest) {
      if (!game || !game.id) continue;
      menu.appendChild(createCard(game));
    }
  }

  // Initialize grid on load
  window.addEventListener('DOMContentLoaded', renderGrid);
})();
   