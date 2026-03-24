/**
 * Game Library Explorer - Core Logic
 * 
 * This script handles fetching data from the RAWG API, 
 * rendering game cards, and processing search, filter, and sort requests.
 */

// 1. Configuration - Replace with your own API key from https://rawg.io/apidocs
const API_KEY = '1b8168855d78457295b971a1b6d65b13'; 
const BASE_URL = 'https://api.rawg.io/api/games';

// 2. State Management - This stores our data locally so we don't have to keep fetching
let allGames = []; // Original list from the API
let favoriteGames = JSON.parse(localStorage.getItem('favoriteGames')) || []; // Load favorites from local storage

// 3. DOM Elements - Select elements we need to interact with
const gameGrid = document.getElementById('gameGrid');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const sortSelect = document.getElementById('sortSelect');
const loadingIndicator = document.getElementById('loading');

/**
 * 4. Fetch Games from API
 */
async function fetchGames() {
    // Show loading spinner
    loadingIndicator.classList.remove('hidden');
    gameGrid.innerHTML = '';

    try {
        // If no API key is provided, we use a fallback or show a message
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            gameGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #dc2626;">Please add your RAWG API Key in script.js to see live data!</p>';
            loadingIndicator.classList.add('hidden');
            return;
        }

        const response = await fetch(`${BASE_URL}?key=${API_KEY}&page_size=40`);
        const data = await response.json();
        
        // Store the results in our allGames state
        allGames = data.results;
        
        // Render the games
        renderGames(allGames);
    } catch (error) {
        console.error("Error fetching games:", error);
        gameGrid.innerHTML = '<p>Oops! Something went wrong while loading games.</p>';
    } finally {
        // Hide loading spinner
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * 5. Render Game Cards using .map()
 */
function renderGames(gamesToShow) {
    if (gamesToShow.length === 0) {
        gameGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No games found matching your criteria.</p>';
        return;
    }

    // Use .map() to transform our array of game objects into HTML strings
    const gameCardsHTML = gamesToShow.map(game => {
        // Check if this game is in our favorites
        const isFavorite = favoriteGames.includes(game.id);
        
        return `
            <div class="game-card">
                <img src="${game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${game.name}">
                <div class="game-info">
                    <h3>${game.name}</h3>
                    <div class="rating">⭐ ${game.rating || 'N/A'}</div>
                    <div class="genres">
                        ${game.genres.map(g => g.name).join(', ')}
                    </div>
                    <button class="fav-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${game.id})">
                        ${isFavorite ? '❤️ In Favorites' : '🤍 Add to Favorites'}
                    </button>
                </div>
            </div>
        `;
    }).join(''); // Join the array into a single string

    gameGrid.innerHTML = gameCardsHTML;
}

/**
 * 6. Search, Filter, and Sort (The Core Requirement)
 */
function applyFilters() {
    // Get current values
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
    const sortValue = sortSelect.value;

    // STEP 1: Filter by Search Term
    let filteredResults = allGames.filter(game => 
        game.name.toLowerCase().includes(searchTerm)
    );

    // STEP 2: Filter by Genre (if one is selected)
    if (selectedGenre) {
        filteredResults = filteredResults.filter(game => 
            game.genres.some(genre => genre.slug === selectedGenre)
        );
    }

    // STEP 3: Sort the Results
    filteredResults.sort((a, b) => {
        if (sortValue === 'rating-desc') return b.rating - a.rating; // High to Low
        if (sortValue === 'rating-asc') return a.rating - b.rating;  // Low to High
        if (sortValue === 'name-asc') return a.name.localeCompare(b.name); // A to Z
        if (sortValue === 'name-desc') return b.name.localeCompare(a.name); // Z to A
        return 0;
    });

    // STEP 4: Render the updated list
    renderGames(filteredResults);
}

/**
 * 7. Bonus: Toggle Favorites with localStorage
 */
function toggleFavorite(gameId) {
    const index = favoriteGames.indexOf(gameId);
    
    if (index === -1) {
        // Add to favorites if not already there
        favoriteGames.push(gameId);
    } else {
        // Remove from favorites if it's already there
        favoriteGames.splice(index, 1);
    }

    // Save updated list to localStorage
    localStorage.setItem('favoriteGames', JSON.stringify(favoriteGames));
    
    // Re-render games to update the button UI
    applyFilters();
}

/**
 * 8. Event Listeners
 */
searchInput.addEventListener('input', applyFilters);
genreFilter.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);

// Initial Load
fetchGames();
