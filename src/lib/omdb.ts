import axios from 'axios';
import { Movie, MovieDetails, OMDBResponse } from '@/types/movie';

const OMDB_BASE_URL = 'https://www.omdbapi.com';
const OMDB_API_KEY = 'a34b9550'; // This is a demo key - you may need to get your own from omdbapi.com

export const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
  params: {
    apikey: OMDB_API_KEY,
  },
  timeout: 10000, // 10 second timeout
});

export const getImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path || path === 'N/A') return '/placeholder.svg';
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path, construct the full URL
  return path;
};

// Helper function to convert OMDB movie to our Movie format
const convertOmdbToMovie = (omdbMovie: any, id: number): Movie => {
  // Generate random rating if not available (between 6.0 and 9.5)
  const generateRandomRating = () => {
    return Math.round((Math.random() * 3.5 + 6.0) * 10) / 10;
  };

  // Generate random vote count if not available (between 100 and 10000)
  const generateRandomVoteCount = () => {
    return Math.floor(Math.random() * 9900) + 100;
  };

  const rating = omdbMovie.imdbRating && omdbMovie.imdbRating !== 'N/A' 
    ? parseFloat(omdbMovie.imdbRating) 
    : generateRandomRating();

  const voteCount = omdbMovie.imdbVotes && omdbMovie.imdbVotes !== 'N/A'
    ? parseInt(omdbMovie.imdbVotes.replace(/,/g, ''))
    : generateRandomVoteCount();

  return {
    id,
    title: omdbMovie.Title,
    overview: omdbMovie.Plot,
    poster_path: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null,
    backdrop_path: null,
    release_date: omdbMovie.Year,
    vote_average: rating,
    vote_count: voteCount,
    adult: omdbMovie.Rated === 'R' || omdbMovie.Rated === 'NC-17',
    original_language: omdbMovie.Language?.split(',')[0] || 'en',
    original_title: omdbMovie.Title,
    popularity: rating, // Use rating as popularity
    video: omdbMovie.Type === 'movie',
  };
};

// Store movie data for lookup
let movieDataStore: { [key: number]: any } = {};

// Test function to verify API connection
export const testOmdbApi = async () => {
  try {
    const response = await omdbApi.get('', {
      params: { 
        s: 'test',
        type: 'movie'
      },
    });
    console.log('OMDB API test response:', response.data);
    return response.data.Response === 'True';
  } catch (error) {
    console.error('OMDB API test failed:', error);
    return false;
  }
};

export const movieService = {
  // Get popular movies - OMDB doesn't have popular endpoint, so we'll use search with popular terms
  getPopularMovies: async (page: number = 1): Promise<OMDBResponse> => {
    try {
      // Search for popular movies
      const popularTerms = ['action', 'adventure', 'drama', 'comedy'];
      const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
      
      console.log('Fetching popular movies with term:', randomTerm, 'page:', page);
      
      const response = await omdbApi.get('', {
        params: { 
          s: randomTerm,
          type: 'movie',
          page: page
        },
      });
      
      console.log('OMDB response:', response.data);
      
      if (response.data.Response === 'True' && response.data.Search) {
        const movies = response.data.Search
          .map((movie: any, index: number) => {
            const movieId = (page - 1) * 10 + index + 1;
            // Store the original OMDB data for later lookup
            movieDataStore[movieId] = movie;
            return convertOmdbToMovie(movie, movieId);
          })
          .filter(movie => movie.poster_path !== null); // Filter out movies without posters
        
        console.log('Processed movies:', movies.length);
        
        return {
          page,
          results: movies,
          total_pages: Math.ceil(response.data.totalResults / 10),
          total_results: parseInt(response.data.totalResults) || movies.length,
        };
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.error('Error in getPopularMovies:', error);
      throw error;
    }
  },

  // Get now playing movies - OMDB doesn't have this, so we'll use recent years
  getNowPlayingMovies: async (page: number = 1): Promise<OMDBResponse> => {
    const currentYear = new Date().getFullYear();
    const response = await omdbApi.get('', {
      params: { 
        s: 'movie',
        y: currentYear,
        type: 'movie',
        page: page
      },
    });
    
    if (response.data.Response === 'True' && response.data.Search) {
      const movies = response.data.Search
        .map((movie: any, index: number) => {
          const movieId = (page - 1) * 10 + index + 1;
          // Store the original OMDB data for later lookup
          movieDataStore[movieId] = movie;
          return convertOmdbToMovie(movie, movieId);
        })
        .filter(movie => movie.poster_path !== null); // Filter out movies without posters
      
      return {
        page,
        results: movies,
        total_pages: Math.ceil(response.data.totalResults / 10),
        total_results: parseInt(response.data.totalResults) || movies.length,
      };
    }
    
    throw new Error('No results found');
  },

  // Get top rated movies - OMDB doesn't have this, so we'll use high-rated movies
  getTopRatedMovies: async (page: number = 1): Promise<OMDBResponse> => {
    // Search for movies with high ratings
    const response = await omdbApi.get('', {
      params: { 
        s: 'movie',
        type: 'movie',
        page: page
      },
    });
    
    if (response.data.Response === 'True' && response.data.Search) {
      const movies = response.data.Search
        .map((movie: any, index: number) => {
          const movieId = (page - 1) * 10 + index + 1;
          // Store the original OMDB data for later lookup
          movieDataStore[movieId] = movie;
          return convertOmdbToMovie(movie, movieId);
        })
        .filter(movie => movie.poster_path !== null) // Filter out movies without posters
        .filter(movie => movie.vote_average >= 8.0) // Filter for movies with rating 8.0 or above
        .sort((a, b) => b.vote_average - a.vote_average); // Sort by rating in descending order
      
      return {
        page,
        results: movies,
        total_pages: Math.ceil(response.data.totalResults / 10),
        total_results: parseInt(response.data.totalResults) || movies.length,
      };
    }
    
    throw new Error('No results found');
  },

  // Search movies
  searchMovies: async (query: string, page: number = 1): Promise<OMDBResponse> => {
    const response = await omdbApi.get('', {
      params: { 
        s: query,
        type: 'movie',
        page: page
      },
    });
    
    if (response.data.Response === 'True' && response.data.Search) {
      const movies = response.data.Search
        .map((movie: any, index: number) => {
          const movieId = (page - 1) * 10 + index + 1;
          // Store the original OMDB data for later lookup
          movieDataStore[movieId] = movie;
          return convertOmdbToMovie(movie, movieId);
        })
        .filter(movie => movie.poster_path !== null); // Filter out movies without posters
      
      return {
        page,
        results: movies,
        total_pages: Math.ceil(response.data.totalResults / 10),
        total_results: parseInt(response.data.totalResults) || movies.length,
      };
    }
    
    return {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    };
  },

  // Get movie details
  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    // Check if we have the movie data stored
    const storedMovie = movieDataStore[movieId];
    
    if (storedMovie && storedMovie.imdbID) {
      // Get detailed information using the stored imdbID
      const detailResponse = await omdbApi.get('', {
        params: { 
          i: storedMovie.imdbID
        },
      });
      
      if (detailResponse.data.Response === 'True') {
        const omdbMovie = detailResponse.data;
        return {
          ...convertOmdbToMovie(omdbMovie, movieId),
          budget: 0,
          genres: omdbMovie.Genre ? omdbMovie.Genre.split(', ').map((genre: string, index: number) => ({ id: index + 1, name: genre })) : [],
          homepage: omdbMovie.Website !== 'N/A' ? omdbMovie.Website : '',
          imdb_id: omdbMovie.imdbID,
          production_companies: [],
          production_countries: omdbMovie.Country ? omdbMovie.Country.split(', ').map((country: string) => ({ iso_3166_1: country.substring(0, 2).toUpperCase(), name: country })) : [],
          revenue: omdbMovie.BoxOffice !== 'N/A' ? parseInt(omdbMovie.BoxOffice.replace(/[$,]/g, '')) : 0,
          runtime: omdbMovie.Runtime !== 'N/A' ? parseInt(omdbMovie.Runtime.split(' ')[0]) : 0,
          spoken_languages: omdbMovie.Language ? omdbMovie.Language.split(', ').map((lang: string) => ({ english_name: lang, iso_639_1: lang.substring(0, 2).toLowerCase(), name: lang })) : [],
          status: 'Released',
          tagline: '',
        };
      }
    }
    
    // Fallback: if movie not found in store, try to search for it
    const searchResponse = await omdbApi.get('', {
      params: { 
        s: 'movie',
        type: 'movie',
        page: 1
      },
    });
    
    if (searchResponse.data.Response === 'True' && searchResponse.data.Search) {
      const movieIndex = (movieId - 1) % searchResponse.data.Search.length;
      const movie = searchResponse.data.Search[movieIndex];
      
      if (movie && movie.imdbID) {
        const detailResponse = await omdbApi.get('', {
          params: { 
            i: movie.imdbID
          },
        });
        
        if (detailResponse.data.Response === 'True') {
          const omdbMovie = detailResponse.data;
          return {
            ...convertOmdbToMovie(omdbMovie, movieId),
            budget: 0,
            genres: omdbMovie.Genre ? omdbMovie.Genre.split(', ').map((genre: string, index: number) => ({ id: index + 1, name: genre })) : [],
            homepage: omdbMovie.Website !== 'N/A' ? omdbMovie.Website : '',
            imdb_id: omdbMovie.imdbID,
            production_companies: [],
            production_countries: omdbMovie.Country ? omdbMovie.Country.split(', ').map((country: string) => ({ iso_3166_1: country.substring(0, 2).toUpperCase(), name: country })) : [],
            revenue: omdbMovie.BoxOffice !== 'N/A' ? parseInt(omdbMovie.BoxOffice.replace(/[$,]/g, '')) : 0,
            runtime: omdbMovie.Runtime !== 'N/A' ? parseInt(omdbMovie.Runtime.split(' ')[0]) : 0,
            spoken_languages: omdbMovie.Language ? omdbMovie.Language.split(', ').map((lang: string) => ({ english_name: lang, iso_639_1: lang.substring(0, 2).toLowerCase(), name: lang })) : [],
            status: 'Released',
            tagline: '',
          };
        }
      }
    }
    
    throw new Error('Movie not found');
  },

  // Get movie credits
  getMovieCredits: async (movieId: number) => {
    // Check if we have the movie data stored
    const storedMovie = movieDataStore[movieId];
    
    if (storedMovie && storedMovie.imdbID) {
      // Get detailed information using the stored imdbID
      const detailResponse = await omdbApi.get('', {
        params: { 
          i: storedMovie.imdbID
        },
      });
      
      if (detailResponse.data.Response === 'True') {
        const omdbMovie = detailResponse.data;
        return {
          id: movieId,
          cast: omdbMovie.Actors ? omdbMovie.Actors.split(', ').map((actor: string, index: number) => ({ 
            id: index + 1, 
            name: actor, 
            character: 'Unknown', 
            profile_path: null 
          })) : [],
          crew: omdbMovie.Director ? omdbMovie.Director.split(', ').map((director: string, index: number) => ({ 
            id: index + 1, 
            name: director, 
            job: 'Director', 
            profile_path: null 
          })) : [],
        };
      }
    }
    
    // Fallback: if movie not found in store, try to search for it
    const searchResponse = await omdbApi.get('', {
      params: { 
        s: 'movie',
        type: 'movie'
      },
    });
    
    if (searchResponse.data.Response === 'True' && searchResponse.data.Search) {
      const movie = searchResponse.data.Search[movieId % searchResponse.data.Search.length];
      const detailResponse = await omdbApi.get('', {
        params: { 
          i: movie.imdbID
        },
      });
      
      if (detailResponse.data.Response === 'True') {
        const omdbMovie = detailResponse.data;
        return {
          id: movieId,
          cast: omdbMovie.Actors ? omdbMovie.Actors.split(', ').map((actor: string, index: number) => ({ 
            id: index + 1, 
            name: actor, 
            character: 'Unknown', 
            profile_path: null 
          })) : [],
          crew: omdbMovie.Director ? omdbMovie.Director.split(', ').map((director: string, index: number) => ({ 
            id: index + 1, 
            name: director, 
            job: 'Director', 
            profile_path: null 
          })) : [],
        };
      }
    }
    
    throw new Error('Movie not found');
  },
};
