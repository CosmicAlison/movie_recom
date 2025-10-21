from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import faiss
import joblib
import gc
import os

app = Flask(__name__)
CORS(app)

global movies, vectorizer, svd, index
movies = pd.read_parquet("movies.parquet")
vectorizer = joblib.load("vectorizer.pkl")
svd = joblib.load("svd.pkl")
index = faiss.read_index("tfidf.index")
print("✅ Resources loaded into memory.")

@app.route("/")
def home():
    return "Picflix FAISS recommendation API running."

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    genre = data.get("genre", [])
    themes = data.get("themes", [])
    movie_age = data.get("movie_age", None)

    # Generate query vector
    query_text = " ".join(genre + themes)
    q_vec = vectorizer.transform([query_text])
    q_vec = svd.transform(q_vec).astype("float32")
    faiss.normalize_L2(q_vec)

    # FAISS search
    D, I = index.search(q_vec, 20)
    results = movies.iloc[I[0]].copy()

    # Optional: age filter
    if movie_age:
        current_year = pd.Timestamp.now().year
        if movie_age == "Yes":
            results = results[results["year"] >= current_year - 10]
        elif movie_age == "No":
            results = results[results["year"] < current_year - 10]

    # Sort and limit
    results["similarity"] = D[0][:len(results)]
    results = results.sort_values(by=["vote_average", "similarity"], ascending=False).head(15)

    recs = results[["original_title", "year", "genres", "vote_average", "overview", "poster_path", "similarity"]]
    gc.collect()
    return jsonify({"recommendations": recs.to_dict(orient="records")})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
