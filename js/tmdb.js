// js/tmdb.js
// Config TMDB (v3 con api_key). Per produzione: meglio proxy backend o Bearer token.
const TMDB_API_KEY = '4cae158cc09617efbbfdc02318ed60c1';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'it-IT');

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  // evita cache aggressive (GitHub Pages + browser + SW)
  url.searchParams.set('_ts', Date.now().toString());

  const res = await fetch(url.toString(), { cache: 'no-store' });

  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch {}
    throw new Error(`TMDB ${res.status} ${res.statusText} ${detail}`);
  }
  return res.json();
}

async function fetchTrendingMovies() {
  return tmdbFetch('/trending/movie/week');
}

async function fetchPopularMovies(page = 1) {
  return tmdbFetch('/movie/popular', { page });
}

async function fetchTopRatedMovies(page = 1) {
  return tmdbFetch('/movie/top_rated', { page });
}

async function searchMovies(query, page = 1) {
  return tmdbFetch('/search/movie', { query, page, include_adult: false });
}

async function getMovieDetails(movieId) {
  // external_ids per link IMDb, videos per trailer
  return tmdbFetch(`/movie/${movieId}`, { append_to_response: 'videos,external_ids' });
}
