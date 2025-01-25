import React, {useState}  from 'react';
import './App.css';
import MainContainer from './components/MainContainer.tsx';
import QuestionForm from './pages/QuestionForm.tsx';
import RecommendedMovie from './pages/RecommendedMovie.tsx';
import IntroPage from './pages/IntroPage.tsx';
import LoadingPage from './pages/LoadingPage.tsx';
import Error from './pages/Error.tsx';

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


const App: React.FC = () => {
  const [page, setPage] = useState<'intro' | 'questionForm' | 'recommendedMovie'|'loadingPage'|'Error' >('intro');
  const [answers, setAnswers] = useState<Record<number, string|string[]>>({});
  const [recommendedMovie, setRecommendedMovie] = useState<Movie>();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleFormSubmit = (answers: Record<number, string|string[]>) => {
    setPage("loadingPage");
    setAnswers(answers);
    const apiData = {
      occasion: answers[2] as string, 
      movie_age: answers[4] as string, 
      genre: answers[3] as string[], 
      themes: answers[1] as string[], 
      mood: answers[5] as string, 
    };
  
    fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    })
      .then((response) => response.json())
      .then((data) => { 
        const min = 0;
        const max = 9;
        const rand = Math.floor(min + Math.random() * (max - min));
        const parsedData = {
          ageRating: data.recommendations[rand]["Age Rating"],
          description: data.recommendations[rand]["Description"].trim(), 
          duration: `${data.recommendations[rand]["Duration"]} min`,
          genre: data.recommendations[rand]["Genre"],
          imdbRating: data.recommendations[rand]["IMDB Rating"],
          movieTitle: data.recommendations[rand]["Movie Title"],
          imageLink: '',
          year: data.recommendations[rand]["Year"], 
        }
        //Fetch poster from tmdb
        fetch(`https://api.themoviedb.org/3/search/movie?query=${parsedData?.movieTitle}&api_key=${process.env.REACT_APP_TMDB_API_KEY}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        .then((response)=>(response.json()))
        .then((data) => {
          const baseUrl = "https://image.tmdb.org/t/p/w500";
          const posterPath = data.results[0].poster_path;
          const fullPosterUrl = `${baseUrl}${posterPath}`;
          parsedData.imageLink = fullPosterUrl;
          setRecommendedMovie(parsedData); //To do: make a carousel of all the top recomms 
          setPage("recommendedMovie");
        })
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);//To do: show a oops we couldn't find matching profiles on error
      });
  }
  ;

  return (
    <div className="App">
      <img src={require ("./assets/picflix.png")} alt="PicFlix" className="logo"/>
      <button className='login'><span className="material-symbols-rounded">account_circle</span></button>
      {page === 'intro' && (
        <IntroPage onclickEvent={()=>setPage('questionForm')}></IntroPage>
      )}

      {page === 'questionForm' && (
        <MainContainer>
          <QuestionForm onSubmit={handleFormSubmit} setPage={setPage} />
        </MainContainer>
      )}

      {page === 'recommendedMovie' && (
        <MainContainer>
          <RecommendedMovie movie={recommendedMovie} />
        </MainContainer>
      )}
      {page === 'loadingPage' && (
        <MainContainer>
          <LoadingPage/>
        </MainContainer>
      )}
      {page === 'Error' && (
        <MainContainer>
          <LoadingPage/>
        </MainContainer>
      )}
    </div>
  );
};


export default App;