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
       const response = await fetch(`${baseWorkerUrl}/favorites`, {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           movieId: movie.id,
           title: movie.title,
           posterPath: movie.poster_path,
         }),
       });

       console.log('Payload sent to worker:', {
         movieId: movie.id,
         title: movie.title,
         posterPath: movie.poster_path,
       });

       console.log('Favorites fetched from worker:', favorites);
   
       if (response.ok) {
         // Add the new favorite with the correct structure
         const newFavorite = {
           movieId: movie.id,
           title: movie.title,
           posterPath: movie.poster_path,
         };
         setFavorites((prev) => [...prev, newFavorite]);
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
