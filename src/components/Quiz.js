import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Quiz = ({ quizData, user, onLogout }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const getScorePercentage = () => {
    return Math.round((calculateScore() / totalQuestions) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Great job! Well done!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Not bad! Room for improvement.";
    return "Keep studying! You can do better!";
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const restartQuiz = () => {
    navigate('/topic');
  };

  if (!quizStarted) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 className="title" style={{ margin: 0, fontSize: 'var(--font-size-3xl)' }}>
              Quiz Ready! 🎯
            </h1>
            <button onClick={onLogout} className="btn btn-outline">
              Logout
            </button>
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)'
          }}>
            <div style={{ 
              fontSize: 'var(--font-size-2xl)', 
              fontWeight: '700', 
              color: 'var(--gray-800)', 
              marginBottom: '0.5rem',
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📚 {quizData.topic}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              <div className="badge badge-primary">
                📊 {totalQuestions} Questions
              </div>
              <div className="badge badge-warning">
                ⚡ {quizData.difficulty.charAt(0).toUpperCase() + quizData.difficulty.slice(1)}
              </div>
              <div className="badge badge-success">
                ⏱️ 5 minutes
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            marginBottom: '2rem',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: 'var(--gray-800)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Quiz Instructions
            </h3>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--gray-600)', 
              lineHeight: '1.8',
              paddingLeft: '1rem'
            }}>
              <li>📖 Read each question carefully</li>
              <li>✅ Select the best answer from the 4 options</li>
              <li>🔄 Navigate between questions using Previous/Next buttons</li>
              <li>⏰ Complete the quiz within 5 minutes</li>
              <li>📊 Your score will be calculated based on correct answers</li>
            </ul>
          </div>

          <button 
            onClick={startQuiz} 
            className="btn" 
            style={{ 
              fontSize: 'var(--font-size-xl)', 
              padding: 'var(--space-lg) var(--space-2xl)',
              width: '100%',
              background: 'var(--success-gradient)'
            }}
          >
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = getScorePercentage();

    return (
      <div className="container">
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 className="title" style={{ margin: 0, fontSize: 'var(--font-size-3xl)' }}>
              Quiz Complete! 🎉
            </h1>
            <button onClick={onLogout} className="btn btn-outline">
              Logout
            </button>
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div className="score-display">
              {score}/{totalQuestions}
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: '800', 
              background: 'var(--success-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem'
            }}>
              {percentage}%
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-xl)', 
              color: 'var(--gray-600)', 
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              {getScoreMessage()}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div className="badge badge-success">
                ✅ {score} Correct
              </div>
              <div className="badge badge-warning">
                ❌ {totalQuestions - score} Incorrect
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'var(--gray-50)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            marginBottom: '2rem',
            border: '1px solid var(--gray-200)'
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: 'var(--gray-800)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Quiz Summary
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem', 
              color: 'var(--gray-600)',
              fontSize: 'var(--font-size-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📚 Topic:</span>
                <strong>{quizData.topic}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⚡ Difficulty:</span>
                <strong>{quizData.difficulty.charAt(0).toUpperCase() + quizData.difficulty.slice(1)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📝 Questions:</span>
                <strong>{totalQuestions}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⏱️ Time Used:</span>
                <strong>{formatTime(300 - timeLeft)}</strong>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={restartQuiz} 
              className="btn"
              style={{ 
                background: 'var(--success-gradient)',
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--space-md) var(--space-xl)'
              }}
            >
              🚀 Take Another Quiz
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-outline"
              style={{ 
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--space-md) var(--space-xl)'
              }}
            >
              🔄 Retake This Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 className="title" style={{ margin: 0, fontSize: 'var(--font-size-2xl)' }}>
              📚 {quizData.topic} Quiz
            </h1>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: '700', 
              color: timeLeft < 60 ? 'var(--error)' : 'var(--gray-700)',
              background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'var(--gray-50)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${timeLeft < 60 ? 'var(--error)' : 'var(--gray-200)'}`
            }}>
              ⏰ {formatTime(timeLeft)}
            </div>
            <button onClick={onLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="question-card">
          <div className="question-text">
            {currentQuestion.question}
          </div>

          <ul className="options-list">
            {currentQuestion.options.map((option, index) => (
              <li
                key={index}
                className={`option-item ${
                  selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <span style={{ 
                  fontWeight: '700', 
                  marginRight: '1rem',
                  fontSize: 'var(--font-size-lg)',
                  color: '#667eea'
                }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <button
            onClick={handlePreviousQuestion}
            className="btn btn-outline"
            disabled={currentQuestionIndex === 0}
            style={{ minWidth: '120px' }}
          >
            ← Previous
          </button>

          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {Array.from({ length: totalQuestions }, (_, index) => (
              <div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: selectedAnswers[index] !== undefined 
                    ? 'var(--success)' 
                    : index === currentQuestionIndex 
                      ? '#667eea' 
                      : 'var(--gray-300)',
                  border: index === currentQuestionIndex ? '2px solid #667eea' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)'
                }}
                title={`Question ${index + 1}${selectedAnswers[index] !== undefined ? ' - Answered' : ''}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextQuestion}
            className="btn"
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            style={{ 
              minWidth: '120px',
              background: currentQuestionIndex === totalQuestions - 1 
                ? 'var(--success-gradient)' 
                : 'var(--primary-gradient)'
            }}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
