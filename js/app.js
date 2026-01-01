
// File: js/app.js
document.addEventListener('DOMContentLoaded', function() {
    const moviesGrid = document.getElementById('moviesGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const navBtns = document.querySelectorAll('.nav-btn');
    const movieModal = document.getElementById('movieModal');
    const closeModal = document.querySelector('.close');

    // Carica film iniziali
    loadTrendingMovies();

    // Cerca film
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    // Navigazione categorie
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            switch(category) {
                case 'trending':
                    loadTrendingMovies();
                    break;
                case 'popular':
                    loadPopularMovies();
                    break;
                case 'top_rated':
                    loadTopRatedMovies();
                    break;
            }
        });
    });

    // Chiudi modal
    closeModal.addEventListener('click', () => {
        movieModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === movieModal) {
            movieModal.style.display = 'none';
        }
    });

    async function loadTrendingMovies() {
        const data = await fetchTrendingMovies();
        displayMovies(data?.results || []);
    }

    async function loadPopularMovies() {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=it-IT&page=1`
        );
        const data = await response.json();
        displayMovies(data?.results || []);
    }

    async function loadTopRatedMovies() {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=it-IT&page=1`
        );
        const data = await response.json();
        displayMovies(data?.results || []);
    }

    async function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            const data = await searchMovies(query);
            displayMovies(data?.results || []);
        }
    }

    function displayMovies(movies) {
        moviesGrid.innerHTML = '';
        
        movies.forEach(movie => {
            if (!movie.poster_path) return;
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${TMDB_IMAGE_BASE}${movie.poster_path}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.release_date?.split('-')[0] || 'N/A'}</p>
                </div>
            `;
            
            movieCard.addEventListener('click', () => showMovieDetails(movie.id));
            moviesGrid.appendChild(movieCard);
        });
    }

    async function showMovieDetails(movieId) {
        const movie = await getMovieDetails(movieId);
        if (!movie) return;

        const detailsDiv = document.getElementById('movieDetails');
        
        // Crea link per VixSrc
        const searchQuery = encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]}`);
        const vixsrcLink = `https://vixsrc.to/search-movie?query=${searchQuery}`;
        
        detailsDiv.innerHTML = `
            <div class="movie-detail-header">
                <img src="${TMDB_IMAGE_BASE}${movie.poster_path}" 
                     alt="${movie.title}"
                     class="detail-poster">
                <div class="detail-info">
                    <h2>${movie.title}</h2>
                    <p><strong>Titolo Originale:</strong> ${movie.original_title}</p>
                    <p><strong>Data di Uscita:</strong> ${movie.release_date}</p>
                    <p><strong>Durata:</strong> ${movie.runtime} minuti</p>
                    <p><strong>Voto:</strong> ${movie.vote_average}/10</p>
                    <div class="genres">
                        ${movie.genres?.map(g => `<span class="genre">${g.name}</span>`).join('') || ''}
                    </div>
                </div>
            </div>
            
            <div class="movie-detail-body">
                <h3>Trama</h3>
                <p>${movie.overview || 'Nessuna descrizione disponibile.'}</p>
                
                <div class="actions">
                    <a href="${vixsrcLink}" 
                       target="_blank" 
                       class="watch-btn">
                       <i class="fas fa-play"></i> Guarda su VixSrc
                    </a>
                    
                    ${movie.videos?.results[0] ? `
                    <button class="trailer-btn" onclick="playTrailer('${movie.videos.results[0].key}')">
                        <i class="fas fa-video"></i> Guarda Trailer
                    </button>
                    ` : ''}
                </div>
                
                ${movie.videos?.results[0] ? `
                <div id="trailerContainer" style="display:none; margin-top:20px;">
                    <iframe id="trailerPlayer" width="100%" height="400" 
                            src="" frameborder="0" 
                            allowfullscreen></iframe>
                </div>
                ` : ''}
            </div>
        `;
        
        movieModal.style.display = 'block';
    }

    // Funzione globale per trailer
    window.playTrailer = function(youtubeKey) {
        const container = document.getElementById('trailerContainer');
        const player = document.getElementById('trailerPlayer');
        
        if (container.style.display === 'none') {
            player.src = `https://www.youtube.com/embed/${youtubeKey}`;
            container.style.display = 'block';
        } else {
            player.src = '';
            container.style.display = 'none';
        }
    };
});
