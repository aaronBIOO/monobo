import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from 'use-debounce';
import { updateSearchCount } from "./appwrite.js";


// API setup initialized
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);


  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage('');
    setMovieList([]);

    // Setting up API and making API communication functional
    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response = await fetch(endpoint, API_OPTIONS);

      // Error handling of API calls
      if (!response.ok) {

        // Logging the response status and message for better debugging in console
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error('failed to fetch movies');
      }
      
      const data = await response.json();

      /*
      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        
        return;
      }
      */

      /* setMovieList(data.results || []); */

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
      setMovieList(data.results || []);
    } catch (error) {
      console.error(`Error: fetching movies was interrupted: ${error}`);
      setErrorMessage('Error: fetching movies was interrupted. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

    // Calling fetchMovies function to fetch movies
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        {/* Header section of the site */}
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          {/* Search component */}
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        
        {/* Listing movies from API call */}
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          
          {/* Handling loading from API calls and potential error from calls */}
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
             <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App
