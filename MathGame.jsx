import React, { useState, useEffect } from 'react';

export default function MathGame({ level, goHome, updateScore }) {
  const [problem, setProblem] = useState({ num1: 0, num2: 0, operator: '+' });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const generateProblem = () => {
    let n1, n2, op;
    if (level === 1) {
      n1 = Math.floor(Math.random() * 10);
      n2 = Math.floor(Math.random() * 10);
      op = Math.random() > 0.5 ? '+' : '-';
      if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
    } else if (level === 2) {
      n1 = Math.floor(Math.random() * 90) + 10;
      n2 = Math.floor(Math.random() * 90) + 10;
      op = '+';
    } else if (level === 3) {
      n1 = Math.floor(Math.random() * 90) + 10;
      n2 = Math.floor(Math.random() * 90) + 10;
      op = '-';
      if (n1 < n2) [n1, n2] = [n2, n1];
    } else if (level === 4) {
      n1 = Math.floor(Math.random() * 900) + 100;
      n2 = Math.floor(Math.random() * 900) + 100;
      op = '+';
    } else if (level === 5) {
      n1 = Math.floor(Math.random() * 9000) + 1000;
      n2 = Math.floor(Math.random() * 9000) + 1000;
      op = '+';
    }
    setProblem({ num1: n1, num2: n2, operator: op });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateProblem();
  }, [level]);

  const handleNumClick = (num) => setUserAnswer(prev => prev + num);
  const handleClear = () => setUserAnswer('');

  const handleSubmit = () => {
    const correctAnswer = problem.operator === '+' ? problem.num1 + problem.num2 : problem.num1 - problem.num2;
    if (parseInt(userAnswer) === correctAnswer) {
      setFeedback('correct');
      updateScore(true);
      setTimeout(generateProblem, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1500);
      setUserAnswer('');
    }
  };

  return (
    <div className="math-game">
      <h2>Matemática - Nível {level}</h2>
      <div className="equation-board">
        {problem.num1} {problem.operator} {problem.num2} = {userAnswer || '?'}
      </div>
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