import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopicInput = ({ user, onLogout, onQuizGenerated }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic for the quiz');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Simulate quiz generation - in a real app, this would call a backend API
      const quizData = await generateQuiz(topic.trim(), numQuestions, difficulty);
      onQuizGenerated(quizData);
      navigate('/quiz');
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuiz = async (topic, numQuestions, difficulty) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate sample quiz questions based on topic
    const questions = [];
    const topics = {
      'javascript': {
        questions: [
          {
            question: 'What is the correct way to declare a variable in JavaScript?',
            options: ['var name = "John"', 'variable name = "John"', 'v name = "John"', 'declare name = "John"'],
            correct: 0
          },
          {
            question: 'Which method is used to add an element to the end of an array?',
            options: ['push()', 'add()', 'append()', 'insert()'],
            correct: 0
          },
          {
            question: 'What does JSON stand for?',
            options: ['JavaScript Object Notation', 'Java Standard Object Notation', 'JavaScript Oriented Notation', 'Java Script Object Network'],
            correct: 0
          },
          {
            question: 'Which operator is used for strict equality in JavaScript?',
            options: ['==', '===', '=', '!='],
            correct: 1
          },
          {
            question: 'What is the result of typeof null in JavaScript?',
            options: ['null', 'undefined', 'object', 'string'],
            correct: 2
          }
        ]
      },
      'react': {
        questions: [
          {
            question: 'What is React?',
            options: ['A database', 'A JavaScript library for building user interfaces', 'A server-side framework', 'A programming language'],
            correct: 1
          },
          {
            question: 'What is JSX?',
            options: ['A JavaScript extension', 'A syntax extension for JavaScript', 'A CSS framework', 'A database query language'],
            correct: 1
          },
          {
            question: 'What is the purpose of useState in React?',
            options: ['To create global state', 'To manage component state', 'To fetch data', 'To handle events'],
            correct: 1
          },
          {
            question: 'What is the virtual DOM?',
            options: ['A real DOM element', 'A JavaScript representation of the DOM', 'A CSS framework', 'A database'],
            correct: 1
          },
          {
            question: 'What is the correct way to pass data to a child component?',
            options: ['Through global variables', 'Through props', 'Through CSS', 'Through localStorage'],
            correct: 1
          }
        ]
      },
      'python': {
        questions: [
          {
            question: 'What is the correct way to create a list in Python?',
            options: ['list = []', 'list = {}', 'list = ()', 'list = <>'],
            correct: 0
          },
          {
            question: 'Which keyword is used to define a function in Python?',
            options: ['function', 'def', 'func', 'define'],
            correct: 1
          },
          {
            question: 'What is the result of 3 ** 2 in Python?',
            options: ['6', '9', '5', '1'],
            correct: 1
          },
          {
            question: 'Which method is used to add an item to a list?',
            options: ['add()', 'insert()', 'append()', 'Both append() and insert()'],
            correct: 3
          },
          {
            question: 'What is PEP 8?',
            options: ['A Python library', 'A Python Enhancement Proposal for code style', 'A Python framework', 'A Python database'],
            correct: 1
          }
        ]
      }
    };

    // Get questions based on topic or generate generic ones
    let topicQuestions = [];
    const topicLower = topic.toLowerCase();
    
    if (topics[topicLower]) {
      topicQuestions = topics[topicLower].questions;
    } else {
      // Generate generic questions for any topic
      topicQuestions = [
        {
          question: `What is the most important aspect of ${topic}?`,
          options: ['Theory', 'Practice', 'Both theory and practice', 'Memorization'],
          correct: 2
        },
        {
          question: `Which of the following is NOT related to ${topic}?`,
          options: ['Basic concepts', 'Advanced techniques', 'Cooking recipes', 'Best practices'],
          correct: 2
        },
        {
          question: `How would you best learn ${topic}?`,
          options: ['Reading only', 'Practice only', 'Combination of reading and practice', 'Watching videos only'],
          correct: 2
        },
        {
          question: `What is the primary goal when studying ${topic}?`,
          options: ['To memorize everything', 'To understand concepts', 'To pass exams', 'To impress others'],
          correct: 1
        },
        {
          question: `Which skill is most important for ${topic}?`,
          options: ['Speed', 'Accuracy', 'Creativity', 'All of the above'],
          correct: 3
        }
      ];
    }

    // Select random questions based on requested number
    const selectedQuestions = topicQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numQuestions, topicQuestions.length));

    return {
      topic: topic,
      difficulty: difficulty,
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      user: user,
      createdAt: new Date().toISOString()
    };
  };

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
            <h1 className="title" style={{ margin: 0, fontSize: 'var(--font-size-3xl)' }}>
              Quiz Generator
            </h1>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
              Welcome back, <strong>{user.username}</strong>! 👋
            </p>
          </div>
          <button onClick={onLogout} className="btn btn-outline">
            Logout
          </button>
        </div>

        <div style={{ 
          background: 'var(--gray-50)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          border: '1px solid var(--gray-200)'
        }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: '600', 
            color: 'var(--gray-800)', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🎯 Create Your Quiz
          </h2>
          <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
            Enter any topic you'd like to be quizzed on. We'll generate personalized questions 
            to test your knowledge and help you learn!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic" className="form-label">
              📚 Quiz Topic
            </label>
            <input
              type="text"
              id="topic"
              className="form-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript, React, Python, History, Science, Math..."
              required
              disabled={isGenerating}
            />
            <div style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--gray-500)', 
              marginTop: '0.5rem' 
            }}>
              💡 Try topics like: JavaScript, React, Python, History, Science, Math, Geography, Literature
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="form-group">
              <label htmlFor="numQuestions" className="form-label">
                📊 Number of Questions
              </label>
              <select
                id="numQuestions"
                className="form-input"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                disabled={isGenerating}
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Extended)</option>
                <option value={15}>15 Questions (Comprehensive)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty" className="form-label">
                ⚡ Difficulty Level
              </label>
              <select
                id="difficulty"
                className="form-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isGenerating}
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn"
            disabled={isGenerating}
            style={{ 
              width: '100%', 
              fontSize: 'var(--font-size-lg)',
              padding: 'var(--space-lg) var(--space-xl)'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '3px solid transparent', 
                  borderTop: '3px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Generating Your Quiz...
              </span>
            ) : (
              '🚀 Generate Quiz'
            )}
          </button>
        </form>

        {isGenerating && (
          <div className="loading">
            <div style={{ fontSize: 'var(--font-size-lg)', marginBottom: '0.5rem' }}>
              🎨 Creating your personalized quiz...
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
              This may take a few moments while we craft the perfect questions for you
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: '600', 
            color: 'var(--gray-700)', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✨ Quiz Features
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--gray-600)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⏱️</span> 5-minute timer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📊</span> Instant scoring
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔄</span> Question navigation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📱</span> Mobile optimized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicInput;