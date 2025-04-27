import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from 'use-debounce';
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";


// API setup 
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
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the search term to prevent making too many API requests
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);


  // Fetching Movies from API
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage('');
    setMovieList([]);

    // Setting up API and making API communication
    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response = await fetch(endpoint, API_OPTIONS);

      // Error handling of API calls
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error('failed to fetch movies');
      }
      
      const data = await response.json();
  
      // Updating search count
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


  // Fetching trending movies
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }


  // Fetching searched movies, loading trending movies
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);


  useEffect(() => {
    loadTrendingMovies();
  }, []);


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


        {trendingMovies.length > 0 && (
            <section className="trending mb-15">
              <h2 className="text-2xl text-center mb-8">Trending Movies on Monobo</h2>

              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          
        <section className="all-movies">
          <h2 className="text-4xl text-center mb-20">Current Popular Movies</h2>
          
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
