import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children, baseWorkerUrl }) => {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Fetch favorites on load
  useEffect(() => {
    async function fetchFavorites() {
      if (!token) {
        console.error('Cannot fetch favorites. Token is missing.');
        return;
      }

      try {
        const response = await fetch(`${baseWorkerUrl}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setFavorites(data || []);
        } else {
          console.error('Error fetching favorites:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    }

    fetchFavorites();
  }, [baseWorkerUrl, token]);

  const addFavorite = async (movie) => {
    if (!token) {
      console.error('Cannot add favorite. Token is missing.');
      return;
    }

    try {
      const payload = {
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path, // Ensure correct property name
      };

      console.log('Payload sent to worker:', payload);

      const response = await fetch(`${baseWorkerUrl}/favorites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFavorites((prev) => [...prev, payload]);
      } else {
        const error = await response.json();
        console.error('Error adding favorite:', error);
      }
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  };

  const removeFavorite = async (movieId) => {
    if (!token) {
      console.error('Cannot remove favorite. Token is missing.');
      return;
    }

    try {
      const response = await fetch(`${baseWorkerUrl}/favorites`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId }),
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((movie) => movie.movieId !== movieId));
      } else {
        const error = await response.json();
        console.error('Error removing favorite:', error);
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
