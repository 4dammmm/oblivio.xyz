document.addEventListener('DOMContentLoaded', () => {
  // Elementi DOM
  const heroSection = document.getElementById('heroSection');
  const heroTitle = document.getElementById('heroTitle');
  const heroDescription = document.getElementById('heroDescription');
  const heroPlayBtn = document.querySelector('.btn-play');
  const heroInfoBtn = document.querySelector('.btn-info');
  
  const trendingScroller = document.getElementById('trendingScroller');
  const popularScroller = document.getElementById('popularScroller');
  const topRatedScroller = document.getElementById('topRatedScroller');
  const searchResultsScroller = document.getElementById('searchResultsScroller');
  const searchResultsRow = document.getElementById('searchResultsRow');
  const searchResultsTitle = document.getElementById('searchResultsTitle');
  
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const navLinks = document.querySelectorAll('.nav-left nav a');
  const header = document.querySelector('.netflix-header');
  const movieModal = document.getElementById('movieModal');
  const closeModalBtn = document.querySelector('.close');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const detailsDiv = document.getElementById('movieDetails');

  const PLACEHOLDER_POSTER = 'images/placeholder.jpg';
  
  let currentMode = 'trending';
  let lastQuery = '';
  let lastFocusedEl = null;
  let currentHeroMovie = null;

  // Inizializzazione
  showLoading();
  Promise.all([
    loadHeroMovie(),
    loadTrendingMovies(),
    loadPopularMovies(),
    loadTopRatedMovies()
  ]).finally(() => {
    hideLoading();
  });

  // Event Listeners
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      currentMode = link.dataset.category;
      lastQuery = '';
      searchInput.value = '';
      searchResultsRow.style.display = 'none';
      
      // Mostra tutte le row
      document.querySelectorAll('.row:not(#searchResultsRow)').forEach(row => {
        row.style.display = 'block';
      });
      
      // Scrolling smooth alla row
      document.getElementById(`${currentMode}Row`).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Modal events
  closeModalBtn.addEventListener('click', hideModal);
  window.addEventListener('click', (e) => {
    if (e.target === movieModal) hideModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && movieModal.style.display === 'block') {
      hideModal();
    }
  });

  // Hero buttons events
  heroPlayBtn.addEventListener('click', () => {
    if (currentHeroMovie) {
      showMovieDetails(currentHeroMovie.id);
    }
  });

  heroInfoBtn.addEventListener('click', () => {
    if (currentHeroMovie) {
      showMovieDetails(currentHeroMovie.id);
    }
  });

  // Scroll effect per header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Funzioni di utilità
  function showLoading() {
    loadingOverlay.classList.add('active');
  }

  function hideLoading() {
    loadingOverlay.classList.remove('active');
  }

  function setImageFallback(imgEl) {
    imgEl.addEventListener('error', () => {
      imgEl.src = PLACEHOLDER_POSTER;
    });
  }

  function showModal() {
    lastFocusedEl = document.activeElement;
    movieModal.style.display = 'block';
    movieModal.setAttribute('aria-hidden', 'false');
    closeModalBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    movieModal.style.display = 'none';
    movieModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    
    const player = document.getElementById('trailerPlayer');
    if (player) player.src = '';
    
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  // Caricamento dati
  async function loadHeroMovie() {
    try {
      const data = await fetchTrendingMovies();
      const movies = data?.results || [];
      if (movies.length > 0) {
        currentHeroMovie = movies[0];
        updateHero(movies[0]);
      }
    } catch (err) {
      console.error('Errore caricamento hero:', err);
    }
  }

  function updateHero(movie) {
    if (!movie) return;
    
    heroTitle.textContent = movie.title || 'Film in Trend';
    heroDescription.textContent = movie.overview || 'Scopri i film più popolari del momento';
    
    if (movie.backdrop_path) {
      heroSection.style.backgroundImage = `linear-gradient(to right, rgba(20,20,20,0.8), rgba(20,20,20,0.4)), url(${TMDB_IMAGE_BASE}original${movie.backdrop_path})`;
    }
    
    heroPlayBtn.onclick = () => {
      const tmdbId = movie.id;
      const vixLink = `https://vixsrc.to/movie/${tmdbId}`;
      window.open(vixLink, '_blank');
    };
  }

  async function loadTrendingMovies() {
    try {
      const data = await fetchTrendingMovies();
      displayMoviesInScroller(data?.results || [], trendingScroller);
    } catch (err) {
      console.error('Errore caricamento trending:', err);
      trendingScroller.innerHTML = '<p class="error">Errore nel caricamento</p>';
    }
  }

  async function loadPopularMovies() {
    try {
      const data = await fetchPopularMovies(1);
      displayMoviesInScroller(data?.results || [], popularScroller);
    } catch (err) {
      console.error('Errore caricamento popolari:', err);
      popularScroller.innerHTML = '<p class="error">Errore nel caricamento</p>';
    }
  }

  async function loadTopRatedMovies() {
    try {
      const data = await fetchTopRatedMovies(1);
      displayMoviesInScroller(data?.results || [], topRatedScroller);
    } catch (err) {
      console.error('Errore caricamento top rated:', err);
      topRatedScroller.innerHTML = '<p class="error">Errore nel caricamento</p>';
    }
  }

  function displayMoviesInScroller(movies, scrollerElement) {
    scrollerElement.innerHTML = '';
    
    const validMovies = movies.filter(m => m?.poster_path);
    
    if (!validMovies.length) {
      scrollerElement.innerHTML = '<p class="no-results">Nessun film trovato</p>';
      return;
    }
    
    validMovies.forEach(movie => {
      const poster = document.createElement('div');
      poster.className = 'poster';
      poster.style.backgroundImage = `url(${TMDB_IMAGE_BASE}w500${movie.poster_path})`;
      poster.title = movie.title;
      
      poster.addEventListener('click', () => showMovieDetails(movie.id));
      
      scrollerElement.appendChild(poster);
    });
  }

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    showLoading();
    try {
      currentMode = 'search';
      lastQuery = query;
      
      // Nascondi tutte le row tranne i risultati
      document.querySelectorAll('.row:not(#searchResultsRow)').forEach(row => {
        row.style.display = 'none';
      });
      
      searchResultsRow.style.display = 'block';
      searchResultsTitle.textContent = `Risultati per: "${query}"`;
      
      const data = await searchMovies(query, 1);
      displayMoviesInScroller(data?.results || [], searchResultsScroller);
    } catch (err) {
      console.error('Errore ricerca:', err);
      searchResultsScroller.innerHTML = '<p class="error">Errore nella ricerca</p>';
    } finally {
      hideLoading();
    }
  }

  async function showMovieDetails(movieId) {
    showLoading();
    try {
      const movie = await getMovieDetails(movieId);
      if (!movie) return;
      
      const videos = movie.videos?.results || [];
      const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                     videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
                     videos.find(v => v.site === 'YouTube');
      
      const tmdbLink = `https://www.themoviedb.org/movie/${movie.id}`;
      const tmdbId = movie.id;
      const vixLink = `https://vixsrc.to/movie/${tmdbId}`;
      const imdbId = movie.external_ids?.imdb_id;
      const imdbLink = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;
      
      detailsDiv.innerHTML = `
        <div class="movie-detail-header">
          <img class="detail-poster" 
               src="${movie.poster_path ? `${TMDB_IMAGE_BASE}w500${movie.poster_path}` : PLACEHOLDER_POSTER}" 
               alt="${escapeHtml(movie.title)}" />
          
          <div class="detail-info">
            <h2>${escapeHtml(movie.title)}</h2>
            <p><strong>Titolo Originale:</strong> ${escapeHtml(movie.original_title)}</p>
            <p><strong>Data di Uscita:</strong> ${escapeHtml(movie.release_date || 'N/A')}</p>
            <p><strong>Durata:</strong> ${movie.runtime ? `${movie.runtime} min` : 'N/A'}</p>
            <p><strong>Voto:</strong> ${movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'}</p>
            <div class="genres">
              ${movie.genres?.map(g => `<span class="genre">${escapeHtml(g.name)}</span>`).join('') || ''}
            </div>
          </div>
        </div>
        
        <div class="movie-detail-body">
          <h3>Trama</h3>
          <p>${escapeHtml(movie.overview || 'Nessuna descrizione disponibile.')}</p>
          
          <div class="actions">
            <a class="watch-btn play-btn" href="${vixLink}" target="_blank" rel="noopener">
              <i class="fas fa-play"></i> Guarda ora
            </a>
            <a class="watch-btn" href="${tmdbLink}" target="_blank" rel="noopener">
              <i class="fas fa-external-link-alt"></i> TMDB
            </a>
            ${imdbLink ? `
              <a class="watch-btn" href="${imdbLink}" target="_blank" rel="noopener">
                <i class="fab fa-imdb"></i> IMDb
              </a>
            ` : ''}
            ${trailer ? `
              <button class="trailer-btn" type="button" data-youtube="${escapeHtml(trailer.key)}">
                <i class="fas fa-film"></i> Trailer
              </button>
            ` : ''}
          </div>
          
          ${trailer ? `
            <div id="trailerContainer" style="display:none; margin-top:30px;">
              <iframe
                id="trailerPlayer"
                width="100%"
                height="400"
                src=""
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          ` : ''}
        </div>
      `;
      
      // Aggiungi fallback per l'immagine
      const posterImg = detailsDiv.querySelector('.detail-poster');
      setImageFallback(posterImg);
      
      // Aggiungi listener per il trailer
      const trailerBtn = detailsDiv.querySelector('.trailer-btn');
      if (trailerBtn) {
        trailerBtn.addEventListener('click', () => toggleTrailer(trailerBtn.dataset.youtube));
      }
      
      showModal();
    } catch (err) {
      console.error('Errore dettagli film:', err);
      alert('Impossibile caricare i dettagli del film');
    } finally {
      hideLoading();
    }
  }

  function toggleTrailer(youtubeKey) {
    const container = document.getElementById('trailerContainer');
    const player = document.getElementById('trailerPlayer');
    if (!container || !player || !youtubeKey) return;
    
    const isHidden = container.style.display === 'none' || !container.style.display;
    
    if (isHidden) {
      player.src = `https://www.youtube.com/embed/${youtubeKey}?autoplay=1`;
      container.style.display = 'block';
    } else {
      player.src = '';
      container.style.display = 'none';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
});
