import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
from flask import Flask, render_template, request, jsonify
import datetime
import random

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

# one hot encode the fields with categorical data
movies = pd.read_csv('all_movies.csv')
movies = movies.astype({'Year': 'int'})
movies = movies.astype({'IMDB Rating': 'int'})
ohe_age = pd.get_dummies(movies[['Age Rating']])

descriptions = movies['Description']
significant_words = []
# loop through the descriptions rows
for ind in descriptions.index:
    # remove non-alphanumeric characters using regex and make lower case
    alpha_num_text = re.sub(r'[^a-zA-Z\s]', '', descriptions[ind]).lower()

    words = word_tokenize(alpha_num_text)

    # create a set of stop words in english
    stop_words = set(stopwords.words('english'))

    # Filter out words not in the stopwords set
    filtered_words = [word for word in words if word not in stop_words]

    # Join the filtered words back into a sentence
    filtered_text = ' '.join(filtered_words)

    # TfidfVectorizer
    vectorizer = TfidfVectorizer()

    # Calculate TF-IDF scores for each word in the text
    tfidf_matrix = vectorizer.fit_transform([filtered_text])

    # Get the feature names (words) from the vectorizer
    feature_names = vectorizer.get_feature_names_out()

    # Find the index of the word with the highest TF-IDF score
    most_significant_index = tfidf_matrix.argmax()

    # Get the most significant word using its index
    most_significant_word = feature_names[most_significant_index]

    significant_words.append(most_significant_word)

movies["Most Significant"] = significant_words

app = Flask(__name__)


@app.route('/')
def home():
    return render_template(r'index.html')


@app.route('/recommend', methods=['POST'])
def recommend():
    # retrieve data from the client side
    data = request.get_json()
    print(data)
    occasion = data['occasion']
    movie_age = data['movie_age']
    age_rating = data['age_rating']
    genre = data['genre']
    themes = data['themes']

    # deduct the oldest desired date of the movie from the current year
    today = datetime.date.today()
    desired_year = today.year - int(movie_age)

    # filter out movies which contain the desired genre
    print(movies)
    similar_movies = pd.DataFrame()
    for theme in themes:
        theme_filtered = movies[movies.Description.str.contains(theme, case=False)]
        similar_movies = pd.concat([similar_movies, theme_filtered])

    if not similar_movies.empty:
        print(similar_movies)
        genre_filtered = similar_movies.loc[similar_movies.Genre.str.contains(genre)]
        if len(genre_filtered.axes[0]) >= 1:
            # pick movies more recent than the desired unless the user wants movies older than 20
            if int(movie_age) != 20:
                age_filtered = genre_filtered.loc[genre_filtered['Year'] >= desired_year]
            else:
                age_filtered = genre_filtered.loc[genre_filtered['Year'] <= desired_year]
            if len(age_filtered.axes[0])>= 1:
                print("result with theme, genre and age criteria filled")
                final_filtered = age_filtered
            else:
                print("result with theme and genre fulfilled")
                final_filtered = genre_filtered  
        else:
            final_filtered = similar_movies
            print("final result with themes")
        print(final_filtered)
    else:  
        genre_filtered = movies[movies.Genre.str.contains(genre)]
        print(genre_filtered)
        if int(movie_age) != 20:
            age_filtered = genre_filtered[genre_filtered['Year'] >= desired_year]
        else: 
            age_filtered = genre_filtered[genre_filtered['Year'] <= desired_year]
        if len(age_filtered.axes[0])>= 2:
            print("final result with genre and age")
            final_filtered = age_filtered
        else:
            final_filtered = genre_filtered
            print("final result with genre")
        print(final_filtered)



    # arrange movies by the highest rating
    sorted_movies = final_filtered.sort_values(by=['IMDB Rating'], ascending=[False])
    print("Chosen movie")

    if not sorted_movies.empty:
        rows = len(sorted_movies.axes[0])
        print("rows")
        print(rows)
        number1 = random.randint(0, (rows-1))
        print("random num") 
        print(number1)
        # pick movie using random index
        recommended_movie = sorted_movies.iloc[number1]
        print(recommended_movie['Movie Title'])
        data = {
            'Title': recommended_movie["Movie Title"],
            'Description': recommended_movie["Description"],
            'URL': recommended_movie["Image Links"]
        }
    else:
        print("No suitable movie found")
        data = {
            'Result': "Unfortunately no suitable movie was found. Please try again."
        }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
