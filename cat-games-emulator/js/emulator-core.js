(function(){
  'use strict';
  const Emulator = {
    els: {},
    init(){
      this.els.menu = document.getElementById('menu');
      this.els.player = document.getElementById('player');
      this.els.frame = document.getElementById('game-frame');
      this.els.back = document.getElementById('back-button');
      this.els.title = document.getElementById('player-title');
      document.addEventListener('click', (e)=>{
        const t = e.target;
        if(!(t instanceof HTMLElement)) return;
        if(t.id === 'back-button') { e.preventDefault(); this.showMenu(); }
      });
    },
    showPlayer(gameId, entryUrl){
      const {menu, player, frame, title} = this.els;
      if(!menu||!player||!frame||!title) return;
      const url = entryUrl || `games/${gameId}/index.html`;
      frame.setAttribute('src', url);
      frame.setAttribute('data-current-game', gameId);
      title.textContent = (gameId||'').replace(/[-_]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
      menu.classList.add('hidden');
      player.classList.remove('hidden');
      setTimeout(()=>frame.focus?.(),0);
    },
    showMenu(){
      const {menu, player, frame, title} = this.els;
      if(!menu||!player||!frame||!title) return;
      frame.setAttribute('src','about:blank');
      frame.removeAttribute('data-current-game');
      title.textContent='';
      player.classList.add('hidden');
      menu.classList.remove('hidden');
      const first = menu.querySelector('.play-button');
      if(first instanceof HTMLElement) first.focus();
    }
  };
  window.Emulator = Emulator;
})();
