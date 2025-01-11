import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children, baseWorkerUrl, token }) => {
  const [favorites, setFavorites] = useState([]);

  // Fetch favorites on load
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch(`${baseWorkerUrl}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setFavorites(data.favorites || []);
        } else {
          console.error('Error fetching favorites:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    }
    if (token) fetchFavorites();
  }, [baseWorkerUrl, token]);

  const addFavorite = async (movie) => {
    try {
      const response = await fetch(`${baseWorkerUrl}/favorites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movie),
      });
      if (response.ok) {
        setFavorites((prev) => [...prev, movie]);
      } else {
        const error = await response.json();
        console.error('Error adding favorite:', error);
      }
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  };

  const removeFavorite = async (movieId) => {
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
        setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
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
