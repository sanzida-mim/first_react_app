import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [movieList, setmovieList] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [debouncedSearchTearm, setdebouncedSearchTearm] = useState('');

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms.
  useDebounce(() => setdebouncedSearchTearm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setisloading(true);
    setErrorMsg('');

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMsg(data.Error || 'Failed to fetch movies');
        setmovieList([]);
        return;
      }

      setmovieList(data.results || []);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMsg('Error fetching movies. Please try again later.');
    } finally {
      setisloading(false);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTearm);
  }, [debouncedSearchTearm]);

  return (
    <main>
      <div className='pattern' />

        <div className='wrapper'>
          <header>
            <img src='./hero.png' alt='Hero Banner' />
            <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle!</h1>

            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className='all-movies'>
            <h2 className='mt-[40px]'>All Movies</h2>

            {isloading ? (
              <Spinner />
            ) : errorMsg ? (
              <p className='text-red-500'>{errorMsg}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )}
          </section>
        </div>
    </main>
  )
}

export default App