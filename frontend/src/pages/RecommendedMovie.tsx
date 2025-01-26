import React from 'react';
import '../styles/RecommendedMovie.css';

interface Movie {
  movieTitle: string;
  year: number;
  ageRating: string;
  duration: string;
  genre: string;
  imdbRating: number;
  description: string;
  imageLink: string;
}

interface RecommendedMovieProps {
  movies: Movie[] | undefined;
  setPage: (page: "intro" | "questionForm" | "recommendedMovie") => void;
}

const RecommendedMovie: React.FC<RecommendedMovieProps> = ({ movies, setPage }) => {
  return (
    <div className="recommended-movie-container">
      {movies && movies.length > 0 ? (
        movies.map((movie, index) => (
          <div key={index} className="movie-info">
            <h3 className="movie-title">
              {movie.movieTitle} <span className="year">({movie.year})</span>
            </h3>
            <div className="movie-poster">
              <img
                className="poster-image"
                src={movie.imageLink}
                alt={`${movie.movieTitle} Poster`}
              />
            </div>
            <p className="movie-genres">{movie.genre}</p>
            <p className="movie-description">{movie.description}</p>
            <div className="movie-ratings">
              <div className="viewer-rating">
                <p className="rating">
                  Viewer Rating: <span className="red-bold">{movie.imdbRating}</span>
                </p>
              </div>
              <div className="age-rating">
                <p className="rating">
                  Age Rating: <span className="red-bold">{movie.ageRating}</span>
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No movies available.</p>
      )}

      <button
        onClick={() => {
          setPage("intro");
        }}
        type="button"
        className="backToIntro"
      >
        <span className="material-symbols-rounded">restart_alt</span>
      </button>
    </div>
  );
};

export default RecommendedMovie;
