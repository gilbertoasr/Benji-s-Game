import React, { useState } from 'react';
import MathGame from './MathGame';
import LanguageGame from './LanguageGame';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'levels', 'math', 'pt', 'en'
  const [subject, setSubject] = useState(null);
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState({ math: 0, pt: 0, en: 0 });

  const goHome = () => {
    setCurrentView('home');
    setSubject(null);
    setLevel(null);
  };

  const selectSubject = (sub) => {
    setSubject(sub);
    setCurrentView('levels');
  };

  const selectLevel = (lvl) => {
    setLevel(lvl);
    setCurrentView(subject);
  };

  const updateScore = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => ({ ...prev, [subject]: prev[subject] + 1 }));
    }
  };

  return (
    <div className="app-container">
      <div className="scoreboard">
        ⭐ Scores - Math: {score.math} | PT: {score.pt} | EN: {score.en}
      </div>

      {currentView === 'home' && (
        <div className="home-screen">
          <h1>Choose an Activity!</h1>
          <button className="big-btn math-btn" onClick={() => selectSubject('math')}>🔢 Matemática</button>
          <button className="big-btn pt-btn" onClick={() => selectSubject('pt')}>🇵🇹 Português</button>
          <button className="big-btn en-btn" onClick={() => selectSubject('en')}>🇬🇧 Inglês</button>
        </div>
      )}

      {currentView === 'levels' && (
        <div className="level-screen">
          <h2>{subject === 'en' ? 'Choose a Level' : 'Escolhe o Nível'}</h2>
          <div className="level-grid">
            {[1, 2, 3, 4, 5].map(lvl => (
              <button key={lvl} className="level-btn" onClick={() => selectLevel(lvl)}>
                {subject === 'en' ? `Level ${lvl}` : `Nível ${lvl}`}
              </button>
            ))}
          </div>
          <button className="nav-btn" onClick={goHome}>🏠 {subject === 'en' ? 'Home' : 'Início'}</button>
        </div>
      )}

      {currentView === 'math' && <MathGame level={level} goHome={goHome} updateScore={updateScore} />}
      {(currentView === 'pt' || currentView === 'en') && <LanguageGame language={subject} level={level} goHome={goHome} updateScore={updateScore} />}
    </div>
  );
}