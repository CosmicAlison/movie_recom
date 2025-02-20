import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
from functools import lru_cache
import gc
import tracemalloc
import psutil
import os

app = Flask(__name__)
CORS(app)

debug = False

def log_memory_usage(stage=""):
    process = psutil.Process()
    memory_usage = process.memory_info().rss / (1024 * 1024)  # Convert to MB
    print(f"[Memory] {stage}: {memory_usage:.2f} MB")

tracemalloc.start()  # Start tracking memory usage

def load_resources():
    """
    Load movie data and TF-IDF vectorizer.
    """
    global movies_df, vectorizer, tfidf_matrix
    movies_df = pd.read_csv('processed_movies.csv.gz', compression='gzip')
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = csr_matrix(vectorizer.fit_transform(movies_df['combined']))
    return movies_df, vectorizer, tfidf_matrix

@lru_cache(maxsize=1)
def get_resources():
    return load_resources()


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route('/_ah/warmup', methods=['GET'])
def warmup():
    """
    endpoint for pre-loading data and models to prevent cold starts in app engine.
    """
    get_resources()
    return "Warmup completed", 200


@app.route("/")
def home():
    return "Movie Recommendation server is running!"


@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight request successful"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response, 200
    
    data = request.get_json()
    if 'genre' in data and 'themes' in data:
        log_memory_usage("Before Loading Data")
        try:
            movies_df, vectorizer, tfidf_matrix = get_resources()
            log_memory_usage("After getting resources")
            movie_age = data['movie_age']
            genre = data['genre']
            themes = data['themes']

            user_input_vector = vectorizer.transform([" ".join(genre + themes)])
            cosine_similarities = cosine_similarity(user_input_vector, tfidf_matrix)
            log_memory_usage("After vectorizing input data")
            del user_input_vector
            gc.collect
            cosine_sim_df = pd.DataFrame(cosine_similarities.T, columns=["similarity"], index=movies_df.index)
            movies_df["similarity"] = cosine_sim_df["similarity"]

            current_year = pd.Timestamp.now().year

            # Filter movies by age 
            if movie_age == "Yes":
                filtered_movies = movies_df[movies_df["year"] >= current_year - 10]
            elif movie_age == "No":
                filtered_movies = movies_df[movies_df["year"] < current_year - 10]
            else:
                filtered_movies = movies_df
            log_memory_usage("After filtering")
            # Sort movies based on similarity in descending order
            sorted_movies = filtered_movies.sort_values(by="similarity", ascending=False)
            del filtered_movies
            gc.collect()

            recommendations = sorted_movies[
                ["original_title", "year", "genres", "vote_average", "overview", "poster_path", "similarity"]
            ].head(10)
            recommendations = recommendations.sort_values(by="vote_average", ascending=False).to_dict(orient="records")

            del sorted_movies
            del cosine_sim_df
            gc.collect()

            return jsonify({"recommendations": recommendations})

        except Exception as e:
            log_memory_usage("On Exception")
            if debug:
                print(e)
            return jsonify({'error': 'Could not provide recommendations'}), 400

    if debug:
        print("Bad data from frontend")
    return jsonify({'error': 'Theme and genre fields not included'}), 400


if __name__ == "__main__":
    get_resources()  
    app.run(host="0.0.0.0", debug=True)











import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


debug = False 

app = Flask(__name__)
CORS(app)
movies_df = pd.read_csv('processed_movies.csv.gz', compression='gzip')
vectorizer = TfidfVectorizer(stop_words='english')

# Fit the vectorizer on the combined text data (genre + description)
tfidf_matrix = vectorizer.fit_transform(movies_df['combined'])

@app.route("/")
def home():
    return "Movie Recommendation server is running!"

@app.route('/recommend', methods=['POST','OPTIONS'])
def recommend():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight request successful"}), 200
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
                filtered_movies = movies_df[movies_df["year"] >= current_year - 10]
            elif movie_age == "No":
                filtered_movies = movies_df[movies_df["year"] < current_year - 10]
            else: 
                filtered_movies = movies_df

            # Sort movies based on similarity in descending order
            sorted_movies = filtered_movies.sort_values(by="similarity", ascending=False)

        
            recommendations = sorted_movies[
                ["original_title", "year", "genres", "vote_average", "overview", "poster_path", "similarity"]
            ].head(10)
            recommendations = recommendations.sort_values(by="vote_average", ascending=False).to_dict(orient="records")

            return jsonify({"recommendations": recommendations})
        except Exception as e: 
            if (debug):
                print(e)
            return jsonify({'error': 'Could not provide recommendations'}), 400
    if(debug):
        print("bad data from frontend")
    return jsonify({'error': 'Theme and genre fields not included'}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
