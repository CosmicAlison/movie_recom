import React from 'react';
import '../styles/RecommendedMovie.css';

interface Movie {
  movieTitle: string;
  year: number;
  ageRating: string;
  duration: string;
  genre: string[];
  imdbRating: number;
  description: string;
  imageLink: string;
}

interface RecommendedMovieProps {
  movie: Movie | undefined;
}

const RecommendedMovie: React.FC<RecommendedMovieProps> = ({ movie }) => {
  return (
    <div className="recommended-movie-container">
      <div className="movie-info">
        <h3 className="movie-title">{movie?.movieTitle}</h3>
        <div className="movie-poster">
          <img className="poster-image" src={movie?.imageLink} alt={`${movie?.movieTitle} Poster`} />
        </div> 
        <p className="movie-genres">{movie?.genre}</p>
        <p className="movie-description">{movie?.description}</p>
        <div className="movie-ratings">
          <div className="viewer-rating">
            <p className='rating'>Viewer Rating: <span className='red-bold'>{movie?.imdbRating}</span></p>
          </div>
          <div className="age-rating">
            <p className='rating'>Age Rating: <span className='red-bold'>{movie?.ageRating}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedMovie;