import React, { useState } from 'react';
import MathGame from './MathGame';
import LanguageGame from './LanguageGame';
import './App.css';

const playArcadeSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'square'; // Classic 8-bit arcade sound
    
    const now = audioCtx.currentTime;
    if (type === 'up') { // Happy ascending arpeggio
      oscillator.frequency.setValueAtTime(261.63, now); // C4
      oscillator.frequency.setValueAtTime(329.63, now + 0.1); // E4
      oscillator.frequency.setValueAtTime(392.00, now + 0.2); // G4
      oscillator.frequency.setValueAtTime(523.25, now + 0.3); // C5
    } else if (type === 'down') { // Sad descending arpeggio
      oscillator.frequency.setValueAtTime(392.00, now); // G4
      oscillator.frequency.setValueAtTime(311.13, now + 0.1); // Eb4
      oscillator.frequency.setValueAtTime(261.63, now + 0.2); // C4
      oscillator.frequency.setValueAtTime(196.00, now + 0.3); // G3
    }
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playCorrectSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine'; // Smooth, happy chime
    
    const now = audioCtx.currentTime;
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  } catch (e) { }
};

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'levels', 'math', 'pt', 'en'
  const [subject, setSubject] = useState(null);
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState({ math: { correct: 0, wrong: 0 }, pt: { correct: 0, wrong: 0 }, en: { correct: 0, wrong: 0 } });
  const [isDynamicMode, setIsDynamicMode] = useState(false);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [levelBanner, setLevelBanner] = useState(null); // 'up' or 'down'
  const [mixedModeType, setMixedModeType] = useState(null); // 'pt' or 'en'
  const [usedWords, setUsedWords] = useState({ pt: [], en: [] });
  const [learnedWords, setLearnedWords] = useState({ pt: [], en: [] });

  const dynamicLevelColors = ['#e8f5e9', '#fff9c4', '#fff3e0', '#fce4ec', '#f3e5f5'];
  const defaultColor = '#f0f8ff';
  const bgColor = isDynamicMode && level ? dynamicLevelColors[level - 1] : defaultColor;

  const goHome = () => {
    setCurrentView('home');
    setSubject(null);
    setLevel(null);
    setIsDynamicMode(false);
    setCorrectInLevel(0);
    setConsecutiveWrong(0);
    setMixedModeType(null);
    setUsedWords({ pt: [], en: [] });
    setLearnedWords({ pt: [], en: [] });
    setScore({ math: { correct: 0, wrong: 0 }, pt: { correct: 0, wrong: 0 }, en: { correct: 0, wrong: 0 } });
  };

  const selectSubject = (sub) => {
    setSubject(sub);
    setCurrentView('levels');
  };

  const showSummary = () => {
    const totalMath = score.math.correct + score.math.wrong;
    const totalPt = learnedWords.pt.length;
    const totalEn = learnedWords.en.length;

    if (totalMath > 0 || totalPt > 0 || totalEn > 0) {
      setCurrentView('summary');
    } else {
      goHome(); // Nothing to show, just go home
    }
  };

  const markWordAsUsed = (lang, wordStr) => {
    setUsedWords(prev => ({ ...prev, [lang]: [...prev[lang], wordStr] }));
  };

  const startMixedMode = (lang) => {
    setMixedModeType(lang);
    setIsDynamicMode(true); // Mixed mode is inherently dynamic
    setLevel(1);
    const subjects = ['math', lang];
    const startSubject = subjects[Math.floor(Math.random() * subjects.length)];
    setSubject(startSubject);
    setCurrentView(startSubject);
  };

  const markWordAsLearned = (lang, wordObj) => {
    if (!learnedWords[lang].some(w => w.word === wordObj.word)) {
      setLearnedWords(prev => ({ ...prev, [lang]: [...prev[lang], wordObj] }));
    }
  };

  const selectLevel = (lvl) => {
    if (lvl === 'dynamic') {
      setIsDynamicMode(true);
      setLevel(1);
      setCorrectInLevel(0);
      setConsecutiveWrong(0);
    } else {
      setIsDynamicMode(false);
      setLevel(lvl);
    }
    setCurrentView(subject);
  };

  const updateScore = (isCorrect) => {
    let blockLocalNext = false;
    let delay = isCorrect ? 3000 : 1500; // 3 seconds for success, 1.5 for failure

    setScore(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [isCorrect ? 'correct' : 'wrong']: prev[subject][isCorrect ? 'correct' : 'wrong'] + 1
      }
    }));

    const switchSubjectIfMixed = () => {
      if (mixedModeType) {
        const subjects = ['math', mixedModeType];
        let nextSubject = subjects[Math.floor(Math.random() * subjects.length)];
        while (subjects.length > 1 && nextSubject === subject) {
          nextSubject = subjects[Math.floor(Math.random() * subjects.length)];
        }
        setSubject(nextSubject);
        setCurrentView(nextSubject);
      }
    };

    if (isDynamicMode) {
      if (isCorrect) {
        setConsecutiveWrong(0);
        const nextCorrect = correctInLevel + 1;
        if (nextCorrect >= 5 && level < 5) { // 5 Correct Answers to Level Up
          blockLocalNext = true;
          setTimeout(() => {
            setLevelBanner('up');
            playArcadeSound('up');
            setTimeout(() => {
              setLevel(l => l + 1);
              setLevelBanner(null);
              switchSubjectIfMixed();
            }, 2000); // Banner display time
          }, delay);
          setCorrectInLevel(0);
        } else {
          setCorrectInLevel(nextCorrect >= 5 ? 0 : nextCorrect);
          if (mixedModeType) {
            blockLocalNext = true;
            setTimeout(switchSubjectIfMixed, delay);
          }
        }
      } else {
        const nextWrong = consecutiveWrong + 1;
        if (nextWrong >= 4 && level > 1) { // 4 Wrong Answers to Level Down
          blockLocalNext = true;
          setTimeout(() => {
            setLevelBanner('down');
            playArcadeSound('down');
            setTimeout(() => {
              setLevel(l => l - 1);
              setLevelBanner(null);
            }, 2000);
          }, delay);
          setConsecutiveWrong(0);
          setCorrectInLevel(0);
        } else {
          setConsecutiveWrong(nextWrong >= 4 ? 0 : nextWrong);
        }
      }
    }

    return blockLocalNext;
  };

  return (
    <div className="app-container" style={{ backgroundColor: bgColor }}>
      {subject && (currentView === 'math' || currentView === 'pt' || currentView === 'en') && (
        <div className="scoreboard">
          ⭐ Score - Correct: {score[subject].correct} | Wrong: {score[subject].wrong}
          {isDynamicMode && <div style={{ fontSize: '18px', marginTop: '5px', color: '#d32f2f' }}>{subject === 'en' ? 'Dynamic Mode Active' : 'Modo Dinâmico Ativo'}</div>}
        </div>
      )}

      {levelBanner && (
        <div className={`level-banner ${levelBanner}`}>
          {levelBanner === 'up' 
            ? (subject === 'en' ? '🚀 Level Up! 🚀' : '🚀 Subiu de Nível! 🚀') 
            : (subject === 'en' ? '🔻 Level Down 🔻' : '🔻 Baixou de Nível 🔻')}
        </div>
      )}

      {currentView === 'home' && (
        <div className="home-screen">
          <h1>Choose an Activity!</h1>
          <button className="big-btn math-btn" onClick={() => selectSubject('math')}>🔢 Matemática</button>
          <button className="big-btn pt-btn" onClick={() => selectSubject('pt')}>🇵🇹 Português</button>
          <button className="big-btn en-btn" onClick={() => selectSubject('en')}>🇬🇧 Inglês</button>
          <button className="big-btn mixed-btn" onClick={() => startMixedMode('pt')}>🔀 Misto (Mat / PT)</button>
          <button className="big-btn mixed-btn" onClick={() => startMixedMode('en')}>🔀 Misto (Mat / EN)</button>
        </div>
      )}

      {currentView === 'summary' && (
        <div className="summary-screen">
          <h1>Resumo da Sessão</h1>

          {(score.math.correct > 0 || score.math.wrong > 0) && (
            <div className="summary-section">
              <h2>Matemática</h2>
              <p>Respostas Corretas: {score.math.correct}</p>
              <p>Respostas Erradas: {score.math.wrong}</p>
              <p><b>Percentagem de Acerto: {
                Math.round((score.math.correct / (score.math.correct + score.math.wrong)) * 100)
              }%</b></p>
            </div>
          )}

          {learnedWords.pt.length > 0 && (
            <div className="summary-section">
              <h2>Palavras Aprendidas (PT)</h2>
              <div className="word-list">
                {learnedWords.pt.map(word => <span key={word.word} className="word-item">{word.image} {word.word}</span>)}
              </div>
            </div>
          )}

          {learnedWords.en.length > 0 && (
            <div className="summary-section">
              <h2>Learned Words (EN)</h2>
              <div className="word-list">
                {learnedWords.en.map(word => <span key={word.word} className="word-item">{word.image} {word.word}</span>)}
              </div>
            </div>
          )}

          <button className="nav-btn" onClick={goHome} style={{ backgroundColor: '#4CAF50', fontSize: '24px', padding: '20px 40px' }}>Jogar de Novo</button>
        </div>
      )}

      {currentView === 'levels' && (
        <div className="level-screen">
          <h2>{subject === 'en' ? 'Choose a Level' : 'Escolhe o Nível'}</h2>
          <div className="level-grid">
            <button className="level-btn" onClick={() => selectLevel('dynamic')} style={{ width: '100%', marginBottom: '15px', backgroundColor: '#FF5722' }}>
              {subject === 'en' ? 'Dynamic Mode' : 'Modo Dinâmico'}
            </button>
            {[1, 2, 3, 4, 5].map(lvl => (
              <button key={lvl} className="level-btn" onClick={() => selectLevel(lvl)}>
                {subject === 'en' ? `Level ${lvl}` : `Nível ${lvl}`}
              </button>
            ))}
          </div>
          <button className="nav-btn" onClick={goHome}>🏠 {subject === 'en' ? 'Main Menu' : 'Menu Principal'}</button>
        </div>
      )}

      {currentView === 'math' && <MathGame level={level} goHome={showSummary} updateScore={updateScore} playCorrectSound={playCorrectSound} />}
      {(currentView === 'pt' || currentView === 'en') && (
        <LanguageGame 
          language={subject} 
          level={level} goHome={showSummary} 
          updateScore={updateScore} 
          playCorrectSound={playCorrectSound} 
          usedWords={usedWords[subject] || []} 
          markWordAsUsed={(w) => markWordAsUsed(subject, w)} 
          markWordAsLearned={(wordObj) => markWordAsLearned(subject, wordObj)} 
        />
      )}
    </div>
  );
}