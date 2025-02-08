import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

debug = False
movies_df = None
vectorizer = None
tfidf_matrix = None


def load_resources():
    """
    Load movie data and TF-IDF vectorizer.
    """
    global movies_df, vectorizer, tfidf_matrix
    if movies_df is None:
        movies_df = pd.read_csv('processed_movies.csv.gz', compression='gzip')
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(movies_df['combined'])


@app.route('/_ah/warmup', methods=['GET'])
def warmup():
    """
    endpoint for pre-loading data and models to prevent cold starts in app engine.
    """
    load_resources()
    return "Warmup completed", 200


@app.route("/")
def home():
    return "Movie Recommendation server is running!"


@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight request successful"}), 200

    data = request.get_json()
    if 'genre' in data and 'themes' in data:
        try:
            # Ensure resources are loaded before recommendations
            load_resources()

            occasion = data['occasion']
            movie_age = data['movie_age']
            genre = data['genre']
            themes = data['themes']
            mood = data['mood']

            user_input_vector = vectorizer.transform([" ".join(genre + themes)])
            cosine_similarities = cosine_similarity(user_input_vector, tfidf_matrix)

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

            # Sort movies based on similarity in descending order
            sorted_movies = filtered_movies.sort_values(by="similarity", ascending=False)

            recommendations = sorted_movies[
                ["original_title", "year", "genres", "vote_average", "overview", "poster_path", "similarity"]
            ].head(10)
            recommendations = recommendations.sort_values(by="vote_average", ascending=False).to_dict(orient="records")

            return jsonify({"recommendations": recommendations})

        except Exception as e:
            if debug:
                print(e)
            return jsonify({'error': 'Could not provide recommendations'}), 400

    if debug:
        print("Bad data from frontend")
    return jsonify({'error': 'Theme and genre fields not included'}), 400


if __name__ == "__main__":
    load_resources()  
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
    app.run(host="0.0.0.0", debug=True)
