# precompute_embeddings.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
import faiss
import joblib
import numpy as np

movies = pd.read_csv("processed_movies.csv.gz", compression="gzip")

# TF-IDF
vectorizer = TfidfVectorizer(stop_words="english", max_features=20000)
tfidf = vectorizer.fit_transform(movies["combined"])

# Dimensionality reduction
svd = TruncatedSVD(n_components=200)
reduced = svd.fit_transform(tfidf).astype("float32")

# Normalize vectors
faiss.normalize_L2(reduced)

# Build FAISS index
index = faiss.IndexFlatIP(reduced.shape[1])
index.add(reduced)

movies.to_parquet("movies.parquet", index=False)
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(svd, "svd.pkl")
faiss.write_index(index, "tfidf.index")
np.save("reduced.npy", reduced)
print("✅ Precomputation complete.")
