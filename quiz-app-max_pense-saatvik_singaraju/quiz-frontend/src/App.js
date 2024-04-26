import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);  // State to store the score
  const [totalScore, setTotalScore] = useState(0); // Holds the total possible score


  // Load the quiz
  useEffect(() => {
    loadQuiz();
  }, []);

  function loadQuiz() {
    setIsLoading(true);
    fetch('http://localhost:3000/generate-quiz')
      .then(response => response.json())
      .then(data => {
        if (data.QAs) {
          setQuestions(data.QAs.map(q => ({
            ...q,
            shuffledOptions: shuffleOptions([...q.incorrect, q.answers[0]])
          })));
          initializeAnswers(data.QAs);
        }
        setIsLoading(false);
        setShowFeedback(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }

  function loadLearning() {
    setIsLoading(true);
    fetch('http://localhost:3000/learning-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({score : score / totalScore})
    })
      .then(response => response.json())
      .then(data => {
        if (data.QAs) {
          setQuestions(data.QAs.map(q => ({
            ...q,
            shuffledOptions: shuffleOptions([...q.incorrect, q.answers[0]])
          })));
          initializeAnswers(data.QAs);
        }
        setIsLoading(false);
        setShowFeedback(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }

  const initializeAnswers = (questions) => {
    let initialAnswers = {};
    questions.forEach(question => {
      initialAnswers[question.question] = '';
    });
    setAnswers(initialAnswers);
  };

  const shuffleOptions = (options) => {
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  const handleAnswerChange = (question, option) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [question]: option
    }));
  };

  const handleSubmit = () => {
    const results = questions.map(question => ({
      questionText: question.question,
      selectedAnswer: answers[question.question],
      correctAnswer: question.answers[0],
      difficulty: question.difficulty,
      isCorrect: answers[question.question] === question.answers[0]
    }));

    // Calculate score based on difficulty
    const score = results.reduce((total, current) => {
      return total + (current.isCorrect ? current.difficulty : 0);
    }, 0);

    // Calculate the total possible score
    const totalPossibleScore = results.reduce((total, current) => {
      return total + current.difficulty;
    }, 0);
    
    fetch('http://localhost:3000/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ results })
    })
    .then(response => response.json())
    .then(data => {
      setFeedback(data);
      setShowFeedback(true);
      setScore(score); // Store the score in state
      setTotalScore(totalPossibleScore); // Store the total possible score
    })
    .catch(error => {
      console.error('Error fetching feedback:', error);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        {isLoading ? (
          <div className="loader"></div>
        ) : showFeedback ? (
          <div>
            <h1>Your Score: {score} out of {totalScore}</h1> {/* Display score out of total score */}
            <pre>{feedback}</pre>
            <button onClick={loadLearning}>Try another quiz</button>
          </div>
        ) : (
          <div>
            <h1>Quiz</h1>
            {questions.map((question, index) => (
              <div key={index} className="question-block">
                <h2>{question.question}</h2>
                {question.shuffledOptions.map((option, idx) => (
                  <div key={idx}>
                    <input type="radio" id={`${question.question}-${option}`}
                           name={question.question} value={option}
                           onChange={() => handleAnswerChange(question.question, option)}
                           checked={answers[question.question] === option} />
                    <label htmlFor={`${question.question}-${option}`}>{option}</label>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={handleSubmit}>Submit Quiz</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
