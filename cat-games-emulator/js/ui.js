/**
 * UI Controller for Cat Games Emulator
 * Handles all UI interactions and state management
 */

class UIController {
  constructor() {
    // DOM Elements
    this.elements = {
      searchInput: document.getElementById('searchInput'),
      gameGrid: document.getElementById('menu'),
      player: document.getElementById('player'),
      gameFrame: document.getElementById('game-frame'),
      playerTitle: document.getElementById('player-title'),
      backButton: document.getElementById('back-button'),
      fullscreenBtn: document.getElementById('fullscreen-btn'),
      fullscreenGameBtn: document.getElementById('fullscreen-game-btn'),
      saveStateBtn: document.getElementById('save-state-btn'),
      loadStateBtn: document.getElementById('load-state-btn'),
      screenshotBtn: document.getElementById('screenshot-btn'),
      gameOverlay: document.getElementById('game-overlay'),
      resumeBtn: document.getElementById('resume-btn'),
      restartBtn: document.getElementById('restart-btn'),
      quitBtn: document.getElementById('quit-btn'),
      toast: document.getElementById('toast'),
      toastMessage: document.querySelector('.toast-message'),
      currentCategory: document.getElementById('current-category')
    };

    // State
    this.state = {
      currentGame: null,
      isFullscreen: false,
      isPaused: false,
      favorites: new Set(JSON.parse(localStorage.getItem('favorites') || '[]')),
      games: []
    };

    // Initialize
    this.initEventListeners();
    this.checkFullscreen();
    this.loadGames();
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Navigation
    this.elements.backButton.addEventListener('click', () => this.showMenu());
    
    // Fullscreen
    this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.elements.fullscreenGameBtn.addEventListener('click', () => this.toggleFullscreen());
    document.addEventListener('fullscreenchange', () => this.checkFullscreen());
    
    // Game controls
    this.elements.saveStateBtn.addEventListener('click', () => this.saveState());
    this.elements.loadStateBtn.addEventListener('click', () => this.loadState());
    this.elements.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    
    // Overlay controls
    this.elements.resumeBtn.addEventListener('click', () => this.togglePause());
    this.elements.restartBtn.addEventListener('click', () => this.restartGame());
    this.elements.quitBtn.addEventListener('click', () => this.quitGame());
    
    // Search
    this.elements.searchInput.addEventListener('input', (e) => this.filterGames(e.target.value));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key to pause/resume
      if (e.key === 'Escape' && this.state.currentGame) {
        this.togglePause();
      }
      
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });
  }

  /**
   * Load games from the manifest
   */
  async loadGames() {
    try {
      const response = await fetch('assets/games.json');
      const games = await response.json();
      this.state.games = games;
      this.renderGames(games);
    } catch (error) {
      console.error('Failed to load games:', error);
      this.showError('Failed to load games. Please try again later.');
    }
  }

  /**
   * Render games in the grid
   * @param {Array} games - Array of game objects
   */
  renderGames(games) {
    if (!games || games.length === 0) {
      this.elements.gameGrid.innerHTML = `
        <div class="empty-state">
          <span class="material-icons">sports_esports</span>
          <h3>No Games Found</h3>
          <p>Add some games to get started!</p>
        </div>
      `;
      return;
    }

    this.elements.gameGrid.innerHTML = games.map(game => this.createGameCard(game)).join('');
    
    // Add click handlers to game cards
    document.querySelectorAll('.game-card').forEach(card => {
      const gameId = card.dataset.gameId;
      card.addEventListener('click', () => this.launchGame(gameId));
    });
    
    // Add favorite handlers
    document.querySelectorAll('.game-card-fav').forEach(btn => {
      const gameId = btn.dataset.gameId;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(gameId);
      });
    });
  }

  /**
   * Create a game card element
   * @param {Object} game - Game object
   * @returns {string} HTML string for the game card
   */
  createGameCard(game) {
    const isFavorite = this.state.favorites.has(game.id);
    return `
      <div class="game-card" data-game-id="${game.id}">
        <img src="${game.cover}" alt="${game.title}" class="game-card-cover">
        <div class="game-card-info">
          <h3 class="game-card-title">${game.title}</h3>
          <div class="game-card-meta">
            <span class="game-card-category">${game.category || 'Action'}</span>
          </div>
        </div>
        <button class="game-card-fav ${isFavorite ? 'active' : ''}" data-game-id="${game.id}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span class="material-icons">${isFavorite ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
    `;
  }

  /**
   * Launch a game
   * @param {string} gameId - ID of the game to launch
   */
  launchGame(gameId) {
    const game = this.state.games.find(g => g.id === gameId);
    if (!game) return;

    this.state.currentGame = game;
    this.elements.playerTitle.textContent = game.title;
    this.elements.gameFrame.src = game.path;
    
    // Show player and hide menu
    this.elements.player.classList.remove('hidden');
    document.querySelector('.emulator-container').classList.add('hidden');
    
    // Focus the iframe for keyboard controls
    setTimeout(() => this.elements.gameFrame.focus(), 100);
    
    // Show notification
    this.showNotification(`Starting ${game.title}...`);
  }

  /**
   * Show the game menu
   */
  showMenu() {
    this.state.currentGame = null;
    this.elements.gameFrame.src = 'about:blank';
    this.elements.player.classList.add('hidden');
    document.querySelector('.emulator-container').classList.remove('hidden');
  }

  /**
   * Toggle game pause state
   */
  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    
    if (this.state.isPaused) {
      this.elements.gameOverlay.classList.add('active');
      this.showNotification('Game Paused');
    } else {
      this.elements.gameOverlay.classList.remove('active');
      this.elements.gameFrame.focus();
    }
  }

  /**
   * Restart the current game
   */
  restartGame() {
    if (!this.state.currentGame) return;
    
    // Reload the iframe
    this.elements.gameFrame.src = this.state.currentGame.path;
    this.elements.gameOverlay.classList.remove('active');
    this.state.isPaused = false;
    this.elements.gameFrame.focus();
    
    this.showNotification('Game Restarted');
  }

  /**
   * Quit the current game
   */
  quitGame() {
    this.showMenu();
    this.showNotification('Game Quit');
  }

  /**
   * Toggle favorite status of a game
   * @param {string} gameId - ID of the game
   */
  toggleFavorite(gameId) {
    if (this.state.favorites.has(gameId)) {
      this.state.favorites.delete(gameId);
    } else {
      this.state.favorites.add(gameId);
    }
    
    // Update UI
    const favButton = document.querySelector(`.game-card-fav[data-game-id="${gameId}"]`);
    if (favButton) {
      const isFavorite = this.state.favorites.has(gameId);
      favButton.classList.toggle('active', isFavorite);
      favButton.innerHTML = `<span class="material-icons">${isFavorite ? 'favorite' : 'favorite_border'}</span>`;
      favButton.setAttribute('aria-label', `${isFavorite ? 'Remove from' : 'Add to'} favorites`);
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(Array.from(this.state.favorites)));
    
    this.showNotification(`Game ${this.state.favorites.has(gameId) ? 'added to' : 'removed from'} favorites`);
  }

  /**
   * Filter games by search query
   * @param {string} query - Search query
   */
  filterGames(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      this.renderGames(this.state.games);
      return;
    }
    
    const filteredGames = this.state.games.filter(game => 
      game.title.toLowerCase().includes(normalizedQuery) ||
      (game.description && game.description.toLowerCase().includes(normalizedQuery)) ||
      (game.category && game.category.toLowerCase().includes(normalizedQuery))
    );
    
    this.renderGames(filteredGames);
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Check and update fullscreen state
   */
  checkFullscreen() {
    this.state.isFullscreen = !!document.fullscreenElement;
    document.body.classList.toggle('fullscreen', this.state.isFullscreen);
  }

  /**
   * Save game state
   */
  saveState() {
    // This would be implemented with the actual save system
    this.showNotification('Game state saved');
  }

  /**
   * Load game state
   */
  loadState() {
    // This would be implemented with the actual save system
    this.showNotification('Game state loaded');
  }

  /**
   * Take a screenshot of the current game
   */
  takeScreenshot() {
    // This would be implemented to capture the game frame
    this.showNotification('Screenshot saved');
  }

  /**
   * Show a notification toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  showNotification(message, duration = 3000) {
    this.elements.toastMessage.textContent = message;
    this.elements.toast.classList.add('show');
    
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, duration);
  }

  /**
   * Show an error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.elements.toastMessage.textContent = message;
    this.elements.toast.classList.add('error', 'show');
    
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.elements.toast.classList.remove('show', 'error');
    }, 5000);
  }
}

// Initialize the UI controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.ui = new UIController();
});
