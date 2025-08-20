# Cat Games Emulator

A modern web-based emulator for playing cat-themed HTML5 games in a unified interface.

## Features

Play multiple cat-themed HTML5 games from one place
-Modern, responsive UI with dark/light mode support
 Fast loading and smooth performance
 Search and filter games by title or category
 Mark games as favorites for quick access
 Save/load game states (where supported by games)

- Fullscreen mode for immersive gaming
 Mobile-friendly design

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for development)

## for installation just open the html file in the cat emu clone here file 

## Adding Games

To add a new game to the emulator:

1. Add the game files to the `games` directory
2. Update the `assets/games.json` file with the game's metadata:
   ```json
   {
     "id": "unique-game-id",
     "title": "Game Title",
     "description": "A short description of the game",
     "category": "Action",
     "path": "path/to/game/index.html",
     "cover": "path/to/cover-image.jpg",
     "width": 800,
     "height": 600
   }
   ```

## Project Structure

```
cat-games-emulator/
├── assets/                  # Static assets
│   ├── games.json           # Game manifest
│   ├── icons/               # App icons
│   └── sounds/              # Sound effects
├── css/                     # Stylesheets
│   ├── emulator.css         # Main emulator styles
│   └── game-selector.css    # Game grid styles
├── games/                   # Game files
├── js/                      # JavaScript files
│   ├── emulator-core.js     # Core emulator functionality
│   ├── game-loader.js       # Game loading and management
│   ├── save-system.js       # Save/load functionality
│   └── ui.js                # User interface controls
├── index.html               # Main HTML file
└── README.md                # This file
```

## Built With

- HTML5
- CSS3 (with CSS Variables)
- JavaScript (ES6+)
- [Material Icons](https://fonts.google.com/icons)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- All game assets are property of their respective owners
- Inspired by classic game emulators and launchers
- Thanks to all the open-source projects that made this possible
