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
  genre: string;
  imdbRating: number;
  description: string;
  imageLink: string;
}


const App: React.FC = () => {
  const [page, setPage] = useState<'intro' | 'questionForm' | 'recommendedMovie'|'loadingPage'|'Error' >('intro');
  const [answers, setAnswers] = useState<Record<number, string|string[]>>({});
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const handleFormSubmit = (answers: Record<number, string | string[]>) => {
    setPage("loadingPage");
    setAnswers(answers);
    const apiData = {
      occasion: answers[2] as string,
      movie_age: answers[4] as string,
      genre: answers[3] as string[],
      themes: answers[1] as string[],
      mood: answers[5] as string,
    };

    fetch("https://movie-recom-sa3u.onrender.com/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    })
      .then((response) => response.json())
      .then((data) => {
        const dataList = data.recommendations;
        const parsedDataList: Movie[] = [];

        dataList.forEach((x: any) => {
          const parsedData: Movie = {
            description: x["overview"].trim(),
            genre: x["genres"],
            imdbRating: x["vote_average"],
            movieTitle: x["original_title"],
            imageLink: `https://image.tmdb.org/t/p/w500${x["poster_path"]}`,
            year: x["year"],
            
          };
          parsedDataList.push(parsedData);
        })
          setRecommendedMovies(parsedDataList);
          setPage('recommendedMovie')
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        setPage('Error');
      });
  };

  return (
    <div className="App">
      <img onClick={()=>{setPage('intro')}} src={require ("./assets/picflix.png")} alt="PicFlix" className="logo"/>
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
          <RecommendedMovie movies={recommendedMovies} setPage={setPage} />
        </MainContainer>
      )}
      {page === 'loadingPage' && (
        <MainContainer>
          <LoadingPage/>
        </MainContainer>
      )}
      {page === 'Error' && (
        <MainContainer>
          <Error/>
        </MainContainer>
      )}
    </div>
  );
};


export default App;
