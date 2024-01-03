import { useState, useEffect } from "react";

const apiKey = "1e729541";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return { movies, error, isLoading };
}
