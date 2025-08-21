
const state = {
  query: "",
  sort: "name-asc",
  activeGenre: "All",
  favorites: new Set(JSON.parse(localStorage.getItem("catemu:favs") || "[]")),
};

const GENRES = ["All", "Platformer", "Puzzle", "Arcade", "Adventure", "RPG", "Simulation", "Rhythm", "Strategy"];

// Selected catalog — links are placeholders for now
const CATALOG = [
  { name: "Super Cat Mario", year: 2025, genre: "Platformer", url: "https://gameboy-emu-aca3.vercel.app/" },
  { name: "cat ping pong", year: 2025, genre: "Arcade", url: "https://gameboy-emu-dk45.vercel.app/" },
  { name: "circle the cat game", year: 2025, genre: "Puzzle", url: "https://gameboy-emu-4ori.vercel.app/" },
  { name: "catch the cat", year: 2025, genre: "Arcade", url: "https://gameboy-emu.vercel.app/" },
  { name: "whack a cat", year: 2025, genre: "Arcade", url: "https://alexandraliutsko.github.io/whack-a-cat/" },
  { name: "cat-o-licious", year: 2025, genre: "Adventure", url: "https://fiorix.github.io/cat-o-licious/" },
  { name: "Meo Match", year: 2025, genre: "Puzzle", url: "https://meomatch.netlify.app/", image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1200&auto=format&fit=crop" },
];
 
const els = {
  grid: document.getElementById("grid"),
  template: document.getElementById("cardTemplate"),
  search: document.getElementById("searchInput"),
  filters: document.getElementById("filters"),
  sort: document.getElementById("sortSelect"),
  
};

function saveFavorites() {
  localStorage.setItem("catemu:favs", JSON.stringify([...state.favorites]));
}

// Theme changing functionality removed

function renderFilters() {
  els.filters.innerHTML = "";
  GENRES.forEach((genre) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (state.activeGenre === genre ? " active" : "");
    chip.textContent = genre;
    chip.addEventListener("click", () => {
      state.activeGenre = genre;
      renderFilters();
      renderGrid();
    });
    els.filters.appendChild(chip);
  });
}

function filterAndSort(items) {
  const q = state.query.trim().toLowerCase();
  let list = items.filter((g) =>
    (state.activeGenre === "All" || g.genre === state.activeGenre) &&
    (q.length === 0 || g.name.toLowerCase().includes(q))
  );
  if (state.sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name));
  if (state.sort === "newest") list.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
  return list;
}

function createCard(game, index) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  node.dataset.genre = game.genre;
  node.querySelector(".genre").textContent = game.genre;
  node.querySelector(".year").textContent = String(game.year);

  const nameLink = node.querySelector(".name-link");
  nameLink.textContent = game.name;
  nameLink.href = game.url;

  const coverEl = node.querySelector(".cover");
  const coverImg = node.querySelector(".cover-img");
  if (coverImg) {
    coverImg.alt = game.name + " cover";
    coverImg.loading = "lazy";
    coverImg.decoding = "async";
    setCoverImage(game, coverEl, coverImg, index);
  }

  const favBtn = node.querySelector(".fav");
  const key = game.name;
  const updateFav = () => {
    favBtn.classList.toggle("active", state.favorites.has(key));
    favBtn.textContent = state.favorites.has(key) ? "❤" : "♡";
  };
  updateFav();
  favBtn.addEventListener("click", () => {
    if (state.favorites.has(key)) state.favorites.delete(key); else state.favorites.add(key);
    saveFavorites();
    updateFav();
  });

  const previewBtn = node.querySelector('[data-action="preview"]');
  previewBtn.addEventListener("click", () => {
    window.open(game.url, "_blank", "noopener");
  });

  return node;
}


function setCoverImage(game, coverEl, imgEl) {
  const LOCAL_COVERS = {
    "Super Cat Mario": "cat mario.png",
    "cat ping pong": "cat ping pong.png",
    "circle the cat game": "circle the cat.png",
    "catch the cat": "catch the cat.png",
    "whack a cat": "whack a cat.png",
    "cat-o-licious": "cat-o-licious.png",
    "Meo Match": "me-match.png",
  };

  const file = LOCAL_COVERS[game.name] || "cat-o-licious.png"; // safe fallback
  imgEl.src = file;
  imgEl.alt = game.name + " cover";
  coverEl.classList.add("has-photo");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderGrid() {
  els.grid.setAttribute("aria-busy", "true");
  els.grid.innerHTML = "";
  const list = filterAndSort(CATALOG);
  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.style.color = "var(--muted)";
    empty.textContent = "No cat games match your search.";
    els.grid.appendChild(empty);
  } else {
    const frag = document.createDocumentFragment();
    list.forEach((game, idx) => frag.appendChild(createCard(game, idx)));
    els.grid.appendChild(frag);
  }
  els.grid.setAttribute("aria-busy", "false");
}

// Preview dialog removed; Preview now opens a new tab

function init() {
  renderFilters();
  renderGrid();
  els.search.addEventListener("input", (e) => { state.query = e.target.value; renderGrid(); });
  els.sort.addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
}

document.addEventListener("DOMContentLoaded", init);


