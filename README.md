
# Movie Recommendation API (Backend Folder)

This repository contains the code for a movie recommendation system built with Flask and scikit-learn. The system provides recommendations based on genre and themes using TF-IDF vectorization and cosine similarity.

## Features
- **Movie Recommendation**: Users can submit a `POST` request with their desired genre, movie age and themes, and the system will return movie recommendations based on their input.
- **CORS Support**: The API supports Cross-Origin Resource Sharing (CORS) to allow it to be used in web applications.
- **Cosine Similarity**: Uses cosine similarity to compute similarity between the user input and a dataset of movies.

## Requirements

- Python 3.x
- Flask
- Flask-CORS
- pandas
- scikit-learn

### Install dependencies

To install the necessary dependencies, run:
pip install -r requirements.txt

## Running the Application

### Start the Flask server

To run the server locally, use:
python main.py

## Endpoints

### `/recommend` - Movie Recommendations

- **Method**: `POST`
- **Request JSON**:
  {
      "genre": ["Action", "Adventure"],
      "themes": ["Superhero", "Science Fiction"],
      "occasion": "Yes",
      "movie_age": "Yes",
      "mood": "Exciting"
  }

  - `genre`: A list of movie genres (e.g., ["Action", "Adventure"]).
  - `themes`: A list of themes (e.g., ["Superhero", "Science Fiction"]).
  - `occasion`: (Optional) Whether the movie is suitable for the occasion.
  - `movie_age`: (Optional) Filters movies by age (e.g., "Yes" for recent movies).
  - `mood`: (Optional) User's desired mood for the movie (e.g., "Exciting").

- **Response**:
  {
      "recommendations": [
          {
              "original_title": "Avengers: Endgame",
              "year": 2019,
              "genres": ["Action", "Adventure", "Science Fiction"],
              "vote_average": 8.4,
              "overview": "After the devastating events of Avengers: Infinity War, the Avengers assemble once more...",
              "poster_path": "/path_to_poster.jpg",
              "similarity": 0.92
          },
      ]
  }

  - `original_title`: Movie's title.
  - `year`: Year of release.
  - `genres`: Genres of the movie.
  - `vote_average`: Average user rating for the movie.
  - `overview`: Short description of the movie.
  - `poster_path`: Path to the movie's poster image.
  - `similarity`: The similarity score between the movie and the user input.

## Data

The dataset used for recommendations is stored in `processed_movies.csv.gz`. It includes various attributes for each movie, such as title, genre, overview, keywords, and more.

- The `combined` field is a concatenation of movie genres, overview, and keywords, which is used to calculate the similarity score.
  
## Notes

- This API does not require a database, as it directly loads a CSV file (`processed_movies.csv.gz`) to make recommendations.
- The TF-IDF vectorizer is pre-trained on the `combined` field and is used to compute the similarity between the user input and movie data.
