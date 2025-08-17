/**
 * UI Controller for Cat Games Emulator
 * Handles all UI interactions and state management
 */

class UIController {
  constructor() {
    // DOM Elements
    this.elements = {
      appContainer: document.querySelector('.app-container'),
      sidebar: document.querySelector('.sidebar'),
      mainContent: document.querySelector('.main-content'),
      detailsPanel: document.querySelector('.details-panel'),
      gameGrid: document.getElementById('games-grid'),
      searchInput: document.getElementById('searchInput'),
      viewToggle: document.querySelector('.view-controls'),
      currentCategory: document.getElementById('current-category'),
      // Details panel elements
      detailCover: document.getElementById('detail-cover'),
      detailTitle: document.getElementById('detail-title'),
      detailCategory: document.getElementById('detail-category'),
      detailYear: document.getElementById('detail-year'),
      detailDescription: document.getElementById('detail-description'),
      playButton: document.getElementById('play-btn'),
      favoriteButton: document.getElementById('favorite-btn'),
      screenshotsContainer: document.getElementById('screenshots-container'),
      closeDetails: document.querySelector('.close-details'),
      // Player elements
      player: document.getElementById('player'),
      backButton: document.getElementById('back-button'),
      playerTitle: document.getElementById('player-title'),
      gameFrame: document.getElementById('game-frame'),
      fullscreenButton: document.getElementById('fullscreen-btn'),
      saveStateButton: document.getElementById('save-state-btn'),
      loadStateButton: document.getElementById('load-state-btn')
    };

    // State
    this.state = {
      currentView: 'grid', // 'grid' or 'list'
      currentCategory: 'all',
      selectedGame: null,
      games: [],
      filteredGames: [],
      favorites: new Set(JSON.parse(localStorage.getItem('favorites') || '[]')),
      recentGames: JSON.parse(localStorage.getItem('recentGames') || '[]'),
      isDetailsOpen: false,
      isFullscreen: false
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize the UI controller
   */
  async init() {
    // Load games
    await this.loadGames();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderGames();
    this.updateActiveNav();
    
    // Show welcome message
    this.showNotification('Welcome to Cat Games Emulator!');
  }

  /**
   * Load games from the games.json file
   */
  async loadGames() {
    try {
      const response = await fetch('assets/games.json');
      if (!response.ok) throw new Error('Failed to load games');
      
      this.state.games = await response.json();
      this.state.filteredGames = [...this.state.games];
      
      // Update favorites to only include valid game IDs
      const validGameIds = new Set(this.state.games.map(game => game.id));
      this.state.favorites = new Set(
        Array.from(this.state.favorites).filter(id => validGameIds.has(id))
      );
      
      // Save updated favorites
      this.saveFavorites();
      
    } catch (error) {
      console.error('Error loading games:', error);
      this.showError('Failed to load games. Please try again later.');
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Search input
    this.elements.searchInput.addEventListener('input', (e) => {
      this.filterGames(e.target.value);
    });

    // View toggle
    this.elements.viewToggle.addEventListener('click', (e) => {
      const view = e.target.closest('.view-btn')?.dataset.view;
      if (view) {
        this.toggleView(view);
      }
    });

    // Navigation items
    document.querySelectorAll('.nav-item, .category-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const category = item.dataset.category;
        if (category) {
          this.filterByCategory(category);
        }
      });
    });

    // Close details panel
    this.elements.closeDetails.addEventListener('click', () => {
      this.closeDetails();
    });

    // Play button
    this.elements.playButton.addEventListener('click', () => {
      if (this.state.selectedGame) {
        this.launchGame(this.state.selectedGame.id);
      }
    });

    // Favorite button
    this.elements.favoriteButton.addEventListener('click', () => {
      if (this.state.selectedGame) {
        this.toggleFavorite(this.state.selectedGame.id);
      }
    });

    // Back button
    this.elements.backButton.addEventListener('click', () => {
      this.showMenu();
    });

    // Fullscreen toggle
    this.elements.fullscreenButton.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Save/load state buttons
    this.elements.saveStateButton.addEventListener('click', () => {
      if (this.state.selectedGame) {
        this.saveGameState(this.state.selectedGame.id);
      }
    });

    this.elements.loadStateButton.addEventListener('click', () => {
      if (this.state.selectedGame) {
        this.loadGameState(this.state.selectedGame.id);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Close details panel with Escape
      if (e.key === 'Escape' && this.state.isDetailsOpen) {
        this.closeDetails();
      }
      
      // Toggle fullscreen with F11
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
      
      // Toggle play/pause with Space or P
      if ((e.key === ' ' || e.key === 'p') && this.state.selectedGame) {
        e.preventDefault();
        // This would be implemented in the emulator core
        console.log('Toggle play/pause');
      }
    });
  }

  /**
   * Render the games grid/list
   */
  renderGames() {
    if (this.state.filteredGames.length === 0) {
      this.elements.gameGrid.innerHTML = `
        <div class="empty-state">
          <span class="material-icons">search_off</span>
          <h3>No games found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      `;
      return;
    }

    this.elements.gameGrid.innerHTML = this.state.filteredGames
      .map(game => this.createGameCard(game))
      .join('');

    // Add event listeners to game cards
    document.querySelectorAll('.game-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;
        const game = this.state.games.find(g => g.id === gameId);
        if (game) {
          this.showGameDetails(game);
        }
      });

      // Add to recent games when clicked
      card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;
        this.addToRecentGames(gameId);
      });
    });

    // Update view class
    this.elements.gameGrid.className = `games-grid ${this.state.currentView}-view`;
  }

  /**
   * Create a game card element
   * @param {Object} game - The game object
   * @returns {string} HTML string for the game card
   */
  createGameCard(game) {
    const isFavorite = this.state.favorites.has(game.id);
    const releaseYear = game.releaseDate ? new Date(game.releaseDate).getFullYear() : '';
    
    return `
      <div class="game-card" data-game-id="${game.id}">
        <img src="${game.cover}" alt="${game.title}" class="game-card-image">
        <div class="game-card-overlay">
          <h3 class="game-card-title">${game.title}</h3>
          <div class="game-card-meta">
            <span class="game-card-category">${game.category || 'Game'}</span>
            ${releaseYear ? `<span class="game-card-year">${releaseYear}</span>` : ''}
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-game-id="${game.id}">
              <span class="material-icons">${isFavorite ? 'favorite' : 'favorite_border'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show game details in the details panel
   * @param {Object} game - The game object to show details for
   */
  showGameDetails(game) {
    this.state.selectedGame = game;
    this.state.isDetailsOpen = true;
    
    // Update details panel
    this.elements.detailCover.src = game.cover;
    this.elements.detailCover.alt = game.title;
    this.elements.detailTitle.textContent = game.title;
    this.elements.detailCategory.textContent = game.category || 'Game';
    this.elements.detailYear.textContent = game.releaseDate ? new Date(game.releaseDate).getFullYear() : '';
    this.elements.detailDescription.textContent = game.description || 'No description available.';
    
    // Update favorite button
    const isFavorite = this.state.favorites.has(game.id);
    this.elements.favoriteButton.innerHTML = `
      <span class="material-icons">${isFavorite ? 'favorite' : 'favorite_border'}</span>
    `;
    
    // Update screenshots
    this.updateScreenshots(game.screenshots || []);
    
    // Show details panel
    this.elements.detailsPanel.classList.add('active');
    
    // Add active class to app container for styling
    this.elements.appContainer.classList.add('details-open');
  }

  /**
   * Close the details panel
   */
  closeDetails() {
    this.state.isDetailsOpen = false;
    this.elements.detailsPanel.classList.remove('active');
    this.elements.appContainer.classList.remove('details-open');
  }

  /**
   * Update the screenshots in the details panel
   * @param {Array} screenshots - Array of screenshot URLs
   */
  updateScreenshots(screenshots) {
    if (screenshots.length === 0) {
      this.elements.screenshotsContainer.innerHTML = '<p>No screenshots available.</p>';
      return;
    }

    this.elements.screenshotsContainer.innerHTML = screenshots
      .map((screenshot, index) => `
        <div class="screenshot-thumb" data-index="${index}">
          <img src="${screenshot.thumbnail || screenshot}" alt="Screenshot ${index + 1}">
        </div>
      `)
      .join('');
  }

  /**
   * Filter games by search query
   * @param {string} query - Search query
   */
  filterGames(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      this.state.filteredGames = [...this.state.games];
    } else {
      this.state.filteredGames = this.state.games.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        (game.description && game.description.toLowerCase().includes(searchTerm)) ||
        (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    this.renderGames();
  }

  /**
   * Filter games by category
   * @param {string} category - Category to filter by
   */
  filterByCategory(category) {
    this.state.currentCategory = category;
    
    // Update active nav item
    document.querySelectorAll('.nav-item, .category-item').forEach(item => {
      item.classList.toggle('active', item.dataset.category === category);
    });
    
    // Update current category display
    let categoryName = 'All Games';
    if (category === 'favorites') {
      categoryName = 'Favorites';
      this.state.filteredGames = this.state.games.filter(game => this.state.favorites.has(game.id));
    } else if (category === 'recent') {
      categoryName = 'Recently Played';
      this.state.filteredGames = this.state.recentGames
        .map(id => this.state.games.find(game => game.id === id))
        .filter(Boolean);
    } else if (category !== 'all') {
      categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      this.state.filteredGames = this.state.games.filter(game => 
        game.category && game.category.toLowerCase() === category
      );
    } else {
      this.state.filteredGames = [...this.state.games];
    }
    
    this.elements.currentCategory.textContent = categoryName;
    this.renderGames();
  }

  /**
   * Toggle between grid and list view
   * @param {string} view - 'grid' or 'list'
   */
  toggleView(view) {
    if (view === this.state.currentView) return;
    
    this.state.currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    this.renderGames();
  }

  /**
   * Launch a game
   * @param {string} gameId - ID of the game to launch
   */
  launchGame(gameId) {
    const game = this.state.games.find(g => g.id === gameId);
    if (!game) return;
    
    // Add to recent games
    this.addToRecentGames(gameId);
    
    // Update player UI
    this.elements.playerTitle.textContent = game.title;
    this.elements.gameFrame.src = game.path;
    
    // Show player and hide main content
    this.elements.player.classList.remove('hidden');
    this.elements.mainContent.classList.add('hidden');
    this.elements.sidebar.classList.add('hidden');
    this.elements.detailsPanel.classList.add('hidden');
    
    // Focus the game frame for keyboard controls
    setTimeout(() => {
      this.elements.gameFrame.focus();
    }, 100);
    
    this.showNotification(`Starting ${game.title}...`);
  }

  /**
   * Show the main menu
   */
  showMenu() {
    // Reset game frame
    this.elements.gameFrame.src = 'about:blank';
    
    // Show main content and hide player
    this.elements.player.classList.add('hidden');
    this.elements.mainContent.classList.remove('hidden');
    this.elements.sidebar.classList.remove('hidden');
    this.elements.detailsPanel.classList.remove('hidden');
    
    // Exit fullscreen if active
    if (this.state.isFullscreen) {
      this.toggleFullscreen();
    }
  }

  /**
   * Toggle favorite status for a game
   * @param {string} gameId - ID of the game to toggle favorite for
   */
  toggleFavorite(gameId) {
    if (this.state.favorites.has(gameId)) {
      this.state.favorites.delete(gameId);
      this.showNotification('Removed from favorites');
    } else {
      this.state.favorites.add(gameId);
      this.showNotification('Added to favorites');
    }
    
    // Save to localStorage
    this.saveFavorites();
    
    // Update UI
    if (this.state.selectedGame?.id === gameId) {
      const isFavorite = this.state.favorites.has(gameId);
      this.elements.favoriteButton.innerHTML = `
        <span class="material-icons">${isFavorite ? 'favorite' : 'favorite_border'}</span>
      `;
    }
    
    // Update game card if visible
    const gameCard = document.querySelector(`.game-card[data-game-id="${gameId}"] .favorite-btn`);
    if (gameCard) {
      gameCard.innerHTML = `
        <span class="material-icons">${this.state.favorites.has(gameId) ? 'favorite' : 'favorite_border'}</span>
      `;
      gameCard.classList.toggle('active', this.state.favorites.has(gameId));
    }
    
    // Update filtered games if on favorites view
    if (this.state.currentCategory === 'favorites') {
      this.filterByCategory('favorites');
    }
  }

  /**
   * Save favorites to localStorage
   */
  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(Array.from(this.state.favorites)));
  }

  /**
   * Add a game to recent games
   * @param {string} gameId - ID of the game to add to recent
   */
  addToRecentGames(gameId) {
    // Remove if already in recent
    this.state.recentGames = this.state.recentGames.filter(id => id !== gameId);
    
    // Add to beginning of array
    this.state.recentGames.unshift(gameId);
    
    // Limit to 10 most recent
    if (this.state.recentGames.length > 10) {
      this.state.recentGames.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('recentGames', JSON.stringify(this.state.recentGames));
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      this.state.isFullscreen = true;
      this.elements.fullscreenButton.innerHTML = '<span class="material-icons">fullscreen_exit</span>';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.state.isFullscreen = false;
        this.elements.fullscreenButton.innerHTML = '<span class="material-icons">fullscreen</span>';
      }
    }
  }

  /**
   * Save game state
   * @param {string} gameId - ID of the game to save state for
   */
  saveGameState(gameId) {
    // This would be implemented with the emulator core
    console.log(`Saving state for game: ${gameId}`);
    this.showNotification('Game state saved');
  }

  /**
   * Load game state
   * @param {string} gameId - ID of the game to load state for
   */
  loadGameState(gameId) {
    // This would be implemented with the emulator core
    console.log(`Loading state for game: ${gameId}`);
    this.showNotification('Game state loaded');
  }

  /**
   * Show a notification toast
   * @param {string} message - The message to show
   * @param {string} type - Type of notification ('success', 'error', 'info')
   */
  showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="material-icons">
        ${type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info'}
      </span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger reflow
    void toast.offsetWidth;
    
    // Add visible class
    toast.classList.add('visible');
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Show an error message
   * @param {string} message - The error message to show
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Update the active navigation item
   */
  updateActiveNav() {
    document.querySelectorAll('.nav-item, .category-item').forEach(item => {
      item.classList.toggle('active', item.dataset.category === this.state.currentCategory);
    });
  }
}

// Initialize the UI controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.uiController = new UIController();
});
