import { useEffect, useState } from "react";
import StarComponent from "./StarComponent";

const apiKey = "1e729541";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Input({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function FoundResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

export default function App() {
  const [query, setQuery] = useState("inception");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMovieId, setMovieId] = useState(null);

  function handleAddMovieToWatched(movie) {
    setWatched((movies) => [...movies, movie]);
  }

  function handleSetMovieId(id) {
    console.log(id);
    setMovieId((movieId) => (movieId === id ? null : id));
  }

  function handleUnsetMovieId() {
    setMovieId(null);
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchFilms() {
        try {
          setLoading(true);
          const resp = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!resp.ok)
            throw new Error("Something wrong happened while request proceeded");
          const data = await resp.json();

          if (!data.Search) throw new Error("There is no data for this film");

          setMovies(data.Search);
          // setError("");
        } catch (err) {
          console.log(err.message);
          console.log(err.name);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchFilms();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Input query={query} setQuery={setQuery} />
        <FoundResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSetMovieId={handleSetMovieId} />
          )}
          {error && <Error message={error} />}
        </Box>
        <Box>
          {openMovieId ? (
            <MovieDetail
              movieId={openMovieId}
              onUnsetMovieId={handleUnsetMovieId}
              onSetWatchedMovie={handleAddMovieToWatched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WathedMovieList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Error({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

function Loading() {
  return <p className="loader">Loading movies...</p>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function MovieList({ movies, onSetMovieId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} onSetMovieId={onSetMovieId} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSetMovieId }) {
  return (
    <li key={movie.imdbID} onClick={() => onSetMovieId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WathedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetail({ movieId, onUnsetMovieId, onSetWatchedMovie }) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleMovieToWatched() {
    const newWatchedMovie = {
      imdbID: movieId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onSetWatchedMovie(newWatchedMovie);
    onUnsetMovieId();
  }

  useEffect(
    function () {
      async function fetchMovie() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`
        );

        const data = await res.json();
        setMovie(data);
      }
      fetchMovie();
    },
    [movieId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = title;

      return () => {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  useEffect(function () {
    function handlerEscape(e) {
      if (e.key === "Escape") {
        onUnsetMovieId();
      }
    }
    document.addEventListener("keydown", handlerEscape);

    return function () {
      document.removeEventListener("keydown", handlerEscape);
    };
  });

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onUnsetMovieId}>
          &larr;
        </button>
        <img src={poster} alt={`Movie ${title}`}></img>
        <div className="details-overview">
          <h2>{movie.Title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarComponent
            starsNum={10}
            size={24}
            onSetTestRaiting={setUserRating}
          />
          {userRating ? (
            <button className="btn-add" onClick={() => handleMovieToWatched()}>
              + Add to list
            </button>
          ) : null}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}
