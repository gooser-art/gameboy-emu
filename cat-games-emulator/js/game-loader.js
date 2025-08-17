(function(){
  'use strict';
  function toTitle(id){ return (id||'').replace(/[-_]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase()); }
  function isAbsoluteUrl(u){ return /^https?:\/\//i.test(u); }
  function resolveEntry(entry){ return entry; }

  async function loadManifest(){
    try {
      const res = await fetch('assets/games.json', { cache: 'no-store' });
      if(!res.ok) throw new Error('Manifest HTTP '+res.status);
      const data = await res.json();
      return Array.isArray(data)? data : [];
    } catch(e){ console.error(e); return []; }
  }

  function createCard(game){
    const { id, title, cover, entry } = game;
    const card = document.createElement('article');
    card.className='game-card';
    const img = document.createElement('img'); img.src = cover || 'https://placekitten.com/320/214'; img.alt = `Game cover: ${title || toTitle(id)}`; card.appendChild(img);
    const h2 = document.createElement('h2'); h2.className='game-title'; h2.textContent = title || toTitle(id); card.appendChild(h2);
    const btn = document.createElement('button'); btn.className='play-button'; btn.textContent='Play'; btn.setAttribute('aria-label', `Play ${title || toTitle(id)}`); btn.setAttribute('data-game', id);
    if(entry) btn.setAttribute('data-entry', resolveEntry(entry));
    card.appendChild(btn);
    return card;
  }

  async function render(){
    const menu = document.getElementById('menu');
    if(!menu){ return; }
    const manifest = await loadManifest();
    menu.innerHTML='';
    if(!manifest.length){
      const p=document.createElement('p'); p.style.gridColumn='1 / -1'; p.style.color='var(--muted)'; p.textContent='No games found. Add entries to assets/games.json'; menu.appendChild(p); return;
    }
    for(const g of manifest){ if(!g||!g.id) continue; menu.appendChild(createCard(g)); }
  }

  function wireClicks(){
    document.addEventListener('click', function(e){
      const t = e.target; if(!(t instanceof HTMLElement)) return;
      if(t.classList.contains('play-button')){
        const id = t.getAttribute('data-game'); const entry = t.getAttribute('data-entry')||undefined;
        if(!id) return; e.preventDefault(); window.Emulator?.showPlayer(id, entry);
      }
    });
  }

  function init(){ window.Emulator?.init(); wireClicks(); render(); }
  window.GameLoader = { init };
  window.addEventListener('DOMContentLoaded', init);
})();
