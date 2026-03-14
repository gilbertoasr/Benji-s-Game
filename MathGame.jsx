import React, { useState, useEffect } from 'react';

export default function MathGame({ level, goHome, updateScore, playCorrectSound }) {
  const [problem, setProblem] = useState({ num1: 0, num2: 0, operator: '+' });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const [showFailure, setShowFailure] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const generateProblem = () => {
    let n1, n2, op;
    if (level === 1) {
      n1 = Math.floor(Math.random() * 10);
      n2 = Math.floor(Math.random() * 10);
      op = Math.random() > 0.5 ? '+' : '-';
      if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
    } else if (level === 2) {
      n1 = Math.floor(Math.random() * 81) + 10; // 10 to 90
      n2 = Math.floor(Math.random() * (100 - n1 - 9)) + 10; // ensures total is <= 100
      op = '+';
    } else if (level === 3) {
      n1 = Math.floor(Math.random() * 90) + 10;
      n2 = Math.floor(Math.random() * 90) + 10;
      op = '-';
      if (n1 < n2) [n1, n2] = [n2, n1];
    } else if (level === 4) {
      n1 = (Math.floor(Math.random() * 81) + 10) * 10; // Round numbers 100 to 900
      n2 = (Math.floor(Math.random() * (100 - (n1 / 10) - 9)) + 10) * 10; // ensures total is <= 1000
      op = '+';
    } else if (level === 5) {
      n1 = (Math.floor(Math.random() * 900) + 100) * 10; // Round numbers 1000 to 9990
      n2 = (Math.floor(Math.random() * 900) + 100) * 10; // Round numbers 1000 to 9990
      op = '+';
    }
    setProblem({ num1: n1, num2: n2, operator: op });
    setUserAnswer('');
    setFeedback(null);
    setShowSuccess(null);
    setShowFailure(false);
    setWrongCount(0);
  };

  useEffect(() => {
    generateProblem();
  }, [level]);

  const handleNumClick = (num) => setUserAnswer(prev => prev + num);
  const handleClear = () => setUserAnswer('');

  const handleSubmit = () => {
    if (userAnswer === '') return;
    const correctAnswer = problem.operator === '+' ? problem.num1 + problem.num2 : problem.num1 - problem.num2;
    if (parseInt(userAnswer) === correctAnswer) {
      setFeedback('correct');
      playCorrectSound();
      setShowSuccess(correctAnswer);
      
      const willChange = updateScore(true);
      setTimeout(() => {
        setShowSuccess(null);
        if (!willChange) {
          generateProblem();
        }
      }, 3000); // 3s to match fireworks, hides exactly when Level banner appears
    } else {
      setFeedback('wrong');
      setShowFailure(true);
      setWrongCount(prev => prev + 1);
      const willChange = updateScore(false);
      setTimeout(() => {
        setFeedback(null);
        setShowFailure(false);
      }, 1500); // Hides exactly when Level Down banner appears
      setUserAnswer('');
    }
  };

  const decomposeNumber = (num) => {
    const str = num.toString();
    if (str.length <= 1) return str;
    const parts = [];
    for (let i = 0; i < str.length; i++) {
      const digit = parseInt(str[i], 10);
      if (digit !== 0) {
        parts.push(digit * Math.pow(10, str.length - 1 - i));
      }
    }
    return parts.join(' + ');
  };

  return (
    <div className="math-game">
      <h2>Matemática - Nível {level}</h2>
      
      {showSuccess !== null && (
        <div className="success-banner">
          <div className="fireworks top-left">🎉</div>
          <div className="fireworks top-right">✨</div>
          <div className="fireworks bottom-left">🎆</div>
          <div className="fireworks bottom-right">🎉</div>
          <div className="success-frame">{showSuccess}</div>
        </div>
      )}

      {showFailure && (
        <div className="failure-banner">
          <div className="failure-frame">😞</div>
        </div>
      )}
      
      <div className="equation-board">
        {problem.num1} {problem.operator} {problem.num2} = {userAnswer || '?'}
      </div>

      {wrongCount >= 2 && level >= 2 && (
        <div className="hint-container">
          <div className="hint-box">💡 Dica: {problem.num2} = {decomposeNumber(problem.num2)}</div>
        </div>
      )}

      {feedback && <div className={`feedback ${feedback}`}>{feedback === 'correct' ? '✅ Correto!' : '❌ Tenta outra vez!'}</div>}
      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
          <button key={num} onClick={() => handleNumClick(num)} className="num-btn">{num}</button>
        ))}
        <button onClick={handleClear} className="num-btn action-btn">C</button>
        <button onClick={handleSubmit} className="num-btn action-btn submit-btn">OK</button>
      </div>
      <div className="controls">
        <button className="nav-btn" onClick={goHome}>🏠 Início</button>
      </div>
    </div>
  );
}