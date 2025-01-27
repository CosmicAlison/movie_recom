import pandas as pd
from flask import Flask, render_template, request, jsonify
import datetime
from flask_cors import CORS

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)

movies_df = pd.read_csv('../backend/movies.csv')
movies_df['release_date'] = pd.to_datetime(movies_df['release_date'])
movies_df['year'] = movies_df['release_date'].dt.year
movies_df = movies_df[movies_df['original_language'] == 'en']
movies_df = movies_df.dropna(subset=['poster_path'])
movies_df = movies_df.dropna(subset=['year'])
movies_df['combined'] = movies_df['genres'] + movies_df['overview'] +  movies_df['keywords']
movies_df['combined'] = movies_df['combined'].fillna('unavailable')

vectorizer = TfidfVectorizer(stop_words='english')

# Fit the vectorizer on the combined text data (genre + description)
tfidf_matrix = vectorizer.fit_transform(movies_df['combined'])


@app.route("/")
def home():
    return "Movie Recommendation server is running!"

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    if 'genre' in data and 'themes' in data: 
        try:
            occasion = data['occasion']
            movie_age = data['movie_age']
            genre = data['genre']
            themes = data['themes']
            mood = data['mood']

            # Transform user input into a TF-IDF vector using the same vectorizer
            user_input_vector = vectorizer.transform([" ".join( genre + themes)])
            
            # Compute the cosine similarity between the user input and the movie database
            cosine_similarities = cosine_similarity(user_input_vector, tfidf_matrix)
        
            # Create a DataFrame for cosine similarity
            cosine_sim_df = pd.DataFrame(cosine_similarities.T, columns=["similarity"], index=movies_df.index)
            movies_df["similarity"] = cosine_sim_df["similarity"]

            # Filter movies based on `movie_age`
            current_year = pd.Timestamp.now().year
            if movie_age == "Yes":
                filtered_movies = movies_df[movies_df["year"] >= current_year - 15]
            elif movie_age == "No":
                filtered_movies = movies_df[movies_df["year"] < current_year - 15]
            else: 
                filtered_movies = movies_df

            # Sort movies based on similarity in descending order
            sorted_movies = filtered_movies.sort_values(by="similarity", ascending=False)

        
            recommendations = sorted_movies[
                ["original_title", "year", "runtime", "genres", "vote_average", "overview", "poster_path", "similarity"]
            ].head(10)
            recommendations = recommendations.sort_values(by="vote_average", ascending=False).to_dict(orient="records")
            print(recommendations)

            return jsonify({"recommendations": recommendations})
        except: 
            return jsonify({'error': 'Could not provide recommendations'}), 400
    return jsonify({'error': 'Theme and genre fields not included'}), 400

if __name__ == "__main__":
    app.run(debug=True)
