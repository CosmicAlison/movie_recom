import React, { useState } from "react";
import '../styles/QuestionForm.css';


interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
}

interface QuestionFormProps {
  onSubmit: (answers: Record<number, string|string[]>) => void; 
  setPage : (page: "intro" | "questionForm" | "recommendedMovie") => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, setPage }) => {
  const questions: Question[] = [
    {
      id: 1,
      type: "checkbox",
      question: "Which movie themes are you interested in? You may pick multiple.",
      options: ["Friendship", "Teenagers", "Vampires", "Love", "Space", "Superheroes","Survival", "Coming of Age", "Post-Apocalyptic", "Dystopian", "Revenge", "Highschool","Nostalgia", "Weddings", "Set in the Past", "Travel", "Food", "Activism", "Family", "Birthdays"],
    },
    {
      id: 2,
      type: "radio",
      question: "What is the occasion for the movie viewing?",
      options: ["Relaxing and De-Stressing Alone", "With Family", "Date Night", "Friends Night In"],
    },
    {
      id: 3,
      type: "checkbox",
      question: "Which genres are you most interested in today?",
      options: ["Action", "Adventure", "Romance", "Drama", "Comedy", "Horror", "Science-Fiction", "Animation", "Biography", "Crime", "Documentary", "Musical",  "Fantasy", "Mystery", "War", "Western" ],
    },
    {
      id: 4,
      type: "radio",
      question: "Do you want to watch something recent?",
      options: ["Yes", "No", "Doesn't matter"],
    },
    {
      id: 5,
      type: "radio",
      question: "What is your current mood?",
      options: ["Happy", "Sad", "Excited", "Chill"],
    },
  ];

  // State for current question index and user answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { type, value, checked } = e.target;
    const questionId = questions[currentQuestionIndex].id;
  
    setAnswers((prevAnswers) => {
      if (type === 'checkbox') {
        const currentAnswers = prevAnswers[questionId] || [];
        const currentAnswersArray = Array.isArray(currentAnswers) ? currentAnswers : [];
        return {
          ...prevAnswers,
          [questionId]: checked
            ? [...currentAnswers, value]
            : currentAnswersArray.filter((answer) => answer !== value), 
        };
      } else {
        return {
          ...prevAnswers,
          [questionId]: value,
        };
      }
    });
  };


  const handleNext = (): void => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];
  
    if (
      (currentQuestion.type === "radio" && !currentAnswer) ||
      (currentQuestion.type === "checkbox" && (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)))
    ) {
      alert("Please select an option before proceeding.");
      return;
    }
  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      onSubmit(answers); // Submit answers on the last question
    }
  };

  const handleBack = (): void => {
    if (currentQuestionIndex > 0){
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
    else{
      setPage('intro');
    }
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="form-container">
      <div className="back-button-div">
        <button type="button" className="back-button" onClick={handleBack}>
        <span className="material-symbols-rounded">arrow_back_ios</span>
        </button>
      </div>
      <h3 className="question-title">{questions[currentQuestionIndex].question}</h3>
      <form>
        {questions[currentQuestionIndex].options.map((option) => (
          <div key={option} className="option">
            <input
              type={questions[currentQuestionIndex].type}
              id={option}
              name={option}
              value={option}
              checked={
                questions[currentQuestionIndex].type === 'checkbox'? answers[questions[currentQuestionIndex].id]?.includes(option) 
                : answers[questions[currentQuestionIndex].id] === option 
              }
              onChange={handleOptionChange}
            />
            <label htmlFor={option}>{option}</label>
          </div>
        ))}
      </form>

      <button type="button" onClick={handleNext} className="next-button">
        {isLastQuestion ? "Get Recommendation" : "Next"}
      </button>
    </div>
  );
};

export default QuestionForm;
