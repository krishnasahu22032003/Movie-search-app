const apiKey = "e0ed588e";
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const moviesList = document.getElementById("moviesList");
const spinner = document.getElementById("spinner");
const errorDiv = document.getElementById("error");
const movieModal = document.getElementById("movieModal");
const modalDetails = document.getElementById("modalDetails");
const closeModal = document.getElementById("closeModal");
const pagination = document.getElementById("pagination");

let currentPage = 1;
let currentSearch = "";

searchBtn?.addEventListener("click", () => {
  currentPage = 1;
  searchMovies();
});

searchInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    currentPage = 1;
    searchMovies();
  }
});

closeModal?.addEventListener("click", () => {
  movieModal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === movieModal) {
    movieModal.classList.add("hidden");
  }
});

function showSpinner() {
  spinner?.classList.remove("hidden");
}

function hideSpinner() {
  spinner?.classList.add("hidden");
}

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;

  currentSearch = query;
  moviesList.innerHTML = "";
  errorDiv.textContent = "";
  showSpinner();

  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&page=${currentPage}`);
    const data = await res.json();
    hideSpinner();

    if (data.Response === "False") {
      errorDiv.textContent = data.Error;
      return;
    }

    displayMovies(data.Search);
    setupPagination(Math.ceil(data.totalResults / 10));
  } catch (err) {
    hideSpinner();
    errorDiv.textContent = "Something went wrong. Please try again.";
  }
}

function displayMovies(movies) {
  moviesList.innerHTML = movies.map(movie => `
    <div class="movie" onclick="showDetails('${movie.imdbID}')">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    </div>
  `).join('');
}

async function showDetails(imdbID) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full`);
    const data = await res.json();

    modalDetails.innerHTML = `
      <h2>${data.Title} (${data.Year})</h2>
      <p><strong>Genre:</strong> ${data.Genre}</p>
      <p><strong>Director:</strong> ${data.Director}</p>
      <p><strong>Actors:</strong> ${data.Actors}</p>
      <p><strong>Plot:</strong> ${data.Plot}</p>
      <button onclick="addToFavorites('${data.imdbID}', '${data.Title}')">⭐ Add to Favorites</button>
    `;

    movieModal.classList.remove("hidden");
  } catch {
    modalDetails.innerHTML = `<p>Unable to fetch movie details.</p>`;
  }
}

function setupPagination(totalPages) {
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages && i <= 5; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.opacity = 0.6;
    btn.addEventListener("click", () => {
      currentPage = i;
      searchMovies();
    });
    pagination.appendChild(btn);
  }
}

function addToFavorites(imdbID, title) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some(movie => movie.imdbID === imdbID)) {
    favorites.push({ imdbID, title });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${title} added to favorites!`);
  } else {
    alert(`${title} is already in favorites.`);
  }
}

window.showDetails = showDetails; // expose globally

// Toggle favorites panel
const toggleBtn = document.getElementById("toggleFavorites");
const favPanel = document.getElementById("favoritesPanel");
const favList = document.getElementById("favoritesList");

toggleBtn?.addEventListener("click", () => {
  favPanel.classList.toggle("hidden");
  showFavoritesOnMain();
});

function showFavoritesOnMain() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favList.innerHTML = "<p style='color:#bbb'>No favorites added yet.</p>";
  } else {
    favList.innerHTML = favorites.map((movie, index) => `
      <div class="movie" style="position: relative;">
        <img src="https://img.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}" alt="${movie.title}" onclick="window.open('https://www.imdb.com/title/${movie.imdbID}', '_blank')">
        <h3>${movie.title}</h3>
        <button class="remove-btn" onclick="removeFromFavorites('${movie.imdbID}')">🗑 Remove</button>
      </div>
    `).join('');
  }
}
function removeFromFavorites(imdbID) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(movie => movie.imdbID !== imdbID);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavoritesOnMain(); // Refresh sidebar list
}


