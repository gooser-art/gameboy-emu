import React from "react";
import './Modal.css';

const games = [
  {
    id: 1,
    title: "Cat HTML5 Game",
    image: "https://via.placeholder.com/200x150?text=Cat+HTML5+Game",
    url: "https://tiwb.github.io/catmario/"
  },
  {
    id: 2,
    title: "Catch The Cat",
    image: "https://via.placeholder.com/200x150?text=Catch+The+Cat",
    url: "https://example.com/catch-the-cat"
  },
  {
    id: 3,
    title: "Cat Mario",
    image: "https://via.placeholder.com/200x150?text=Cat+Mario",
    url: "https://example.com/cat-mario"
  },
  {
    id: 4,
    title: "Circle The Cat",
    image: "https://via.placeholder.com/200x150?text=Circle+The+Cat",
    url: "https://example.com/circle-the-cat"
  },
  {
    id: 5,
    title: "Meomatch",
    image: "https://via.placeholder.com/200x150?text=Meomatch",
    url: "https://example.com/meomatch"
  },
  {
    id: 6,
    title: "Pet The Catto",
    image: "https://via.placeholder.com/200x150?text=Pet+The+Catto",
    url: "https://example.com/pet-the-catto"
  },
  {
    id: 7,
    title: "Phaser Cat",
    image: "https://via.placeholder.com/200x150?text=Phaser+Cat",
    url: "https://example.com/phaser-cat"
  },
  {
    id: 8,
    title: "Whack A Cat",
    image: "https://via.placeholder.com/200x150?text=Whack+A+Cat",
    url: "https://example.com/whack-a-cat"
  }
];

const Modal = () => {
    return (
        <div className="modal-container">
            <h1>Cat Games Collection</h1>
            <div className="games-grid">
                {games.map((game) => (
                    <a 
                        key={game.id} 
                        href={game.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="game-tile"
                    >
                        <img src={game.image} alt={game.title} />
                        <h3>{game.title}</h3>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Modal;
