'use client'

import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';

const FAVORITES_KEY = 'movie_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem(FAVORITES_KEY);
      }
    }
  }, []);

  const saveFavorites = (newFavorites: Movie[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const addFavorite = (movie: Movie) => {
    const newFavorites = [...favorites, movie];
    saveFavorites(newFavorites);
  };

  const removeFavorite = (movieId: number) => {
    const newFavorites = favorites.filter(movie => movie.id !== movieId);
    saveFavorites(newFavorites);
  };

  const toggleFavorite = (movie: Movie) => {
    const isFavorite = favorites.some(fav => fav.id === movie.id);
    if (isFavorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  const isFavorite = (movieId: number) => {
    return favorites.some(movie => movie.id === movieId);
  };

  const favoriteIds = favorites.map(movie => movie.id);

  return {
    favorites,
    favoriteIds,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
