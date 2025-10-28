import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TopicInput from './components/TopicInput';
import Quiz from './components/Quiz';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [quizData, setQuizData] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setQuizData(null);
  };

  const handleQuizGenerated = (quiz) => {
    setQuizData(quiz);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/topic" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/topic" 
            element={
              isAuthenticated ? 
                <TopicInput 
                  user={user} 
                  onLogout={handleLogout}
                  onQuizGenerated={handleQuizGenerated}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/quiz" 
            element={
              quizData ? 
                <Quiz 
                  quizData={quizData}
                  user={user}
                  onLogout={handleLogout}
                /> : 
                <Navigate to="/topic" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
