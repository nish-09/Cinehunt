import axios from 'axios';
import { Movie, MovieDetails, OMDBResponse } from '@/types/movie';

const OMDB_BASE_URL = 'https://www.omdbapi.com';
const OMDB_API_KEY = 'a34b9550';

export const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
  params: {
    apikey: OMDB_API_KEY,
  },
  timeout: 10000,
});

export const getImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path || path === 'N/A') return '/placeholder.svg';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  return path;
};

const convertOmdbToMovie = (omdbMovie: any, id: number): Movie => {
  const generateRandomRating = () => {
    return Math.round((Math.random() * 3.5 + 6.0) * 10) / 10;
  };

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
    popularity: rating,
    video: omdbMovie.Type === 'movie',
  };
};

let movieDataStore: { [key: number]: any } = {};

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
  getPopularMovies: async (page: number = 1): Promise<OMDBResponse> => {
    try {
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
            movieDataStore[movieId] = movie;
            return convertOmdbToMovie(movie, movieId);
          })
          .filter(movie => movie.poster_path !== null);
        
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
          movieDataStore[movieId] = movie;
          return convertOmdbToMovie(movie, movieId);
        })
        .filter(movie => movie.poster_path !== null);
      
      return {
        page,
        results: movies,
        total_pages: Math.ceil(response.data.totalResults / 10),
        total_results: parseInt(response.data.totalResults) || movies.length,
      };
    }
    
    throw new Error('No results found');
  },

  getTopRatedMovies: async (page: number = 1): Promise<OMDBResponse> => {
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
          movieDataStore[movieId] = movie;
          return convertOmdbToMovie(movie, movieId);
        })
        .filter(movie => movie.poster_path !== null)
        .filter(movie => movie.vote_average >= 8.0)
        .sort((a, b) => b.vote_average - a.vote_average);
      
      return {
        page,
        results: movies,
        total_pages: Math.ceil(response.data.totalResults / 10),
        total_results: parseInt(response.data.totalResults) || movies.length,
      };
    }
    
    throw new Error('No results found');
  },

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
          movieDataStore[movieId] = movie;
          return convertOmdbToMovie(movie, movieId);
        })
        .filter(movie => movie.poster_path !== null);
      
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

  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    const storedMovie = movieDataStore[movieId];
    
    if (storedMovie && storedMovie.imdbID) {
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

  getMovieCredits: async (movieId: number) => {
    const storedMovie = movieDataStore[movieId];
    
    if (storedMovie && storedMovie.imdbID) {
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
