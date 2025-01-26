import pandas
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
import time
import numpy as np

# urls stores the url for ten pages of movie rankings (1000 movies)
urls = ["https://www.imdb.com/search/title/?count=100&groups=top_1000&sort=user_rating",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=101&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=201&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=301&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=401&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=501&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=601&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=701&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=801&ref_=adv_nxt",
        "https://www.imdb.com/search/title/?groups=top_1000&sort=user_rating,desc&count=100&start=901&ref_=adv_nxt"]
s = Service('C:\\Users\\aliso\\Downloads\\chromedriver-win64_s\\chromedriver-win64\\chromedriver.exe')
driver = webdriver.Chrome(service=s)

all_titles = []
release_years = []
age_ratings = []
movie_lengths = []
movie_genres = []
ratings = []
movie_descriptions = []
image_urls = []

for url in urls:
    driver.get(url)
    # ensures dynamic content has time to load
    time.sleep(5)

    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")

    # extract all movie info from page
    info = soup.find_all('div', {'class': 'lister-item mode-advanced'})
    for x in info:
        title = x.h3.a.text
        all_titles.append(title)
        year = x.h3.find('span', {'class': 'lister-item-year text-muted unbold'}).text.replace('(', '').replace(')', '').replace('I', '')
        release_years.append(year)
        age = x.p.find('span', {'class': 'certificate'})
        if age:
            age_text = age.get_text()
        else:
            age_text = "Unrated"
        age_ratings.append(age_text)
        length = x.p.find('span', {'class': 'runtime'}).text.replace(' min', '')
        movie_lengths.append(length)
        genre = x.p.find('span', {'class': 'genre'}).text.replace('\n', '')
        movie_genres.append(genre)
        rating = x.find('div', {'class': 'inline-block ratings-imdb-rating'}).get('data-value').replace('\n', '')
        ratings.append(rating)
        description = x.find_all('p', {'class': 'text-muted'})
        movie_descriptions.append(description[1].text)
        cover_link = x.find('img', {'alt':title}).get('loadlate')
        print(description)
        print(cover_link)
        if cover_link:
            image_urls.append(cover_link)
        else:
            cover_link = x.find('img', {'alt': title}).get('src')
            image_urls.append(cover_link)

print("Image URLS" + image_urls[0] + '\n')
print("Movie Descriptions" + movie_descriptions[0] + '\n')
print("Certificate" + age_ratings[0] + '\n')

# create pandas data frame from arrays by formatting them as tuples
movie_data = pandas.DataFrame({'Movie Title': all_titles, 'Year': release_years, 'Age Rating': age_ratings,
                               'Duration': movie_lengths, 'Genre': movie_genres,
                               'IMDB Rating': ratings, 'Description': movie_descriptions,
                               'Image Links': image_urls})

#save data frame to csv file
movie_data.to_csv('all_movies.csv')