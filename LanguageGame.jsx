import React, { useState, useEffect } from 'react';
import { wordDB } from './words';

export default function LanguageGame({ language, level, goHome, updateScore, playCorrectSound, usedWords, markWordAsUsed, markWordAsLearned }) {
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [scrambled, setScrambled] = useState([]);
  const [assembled, setAssembled] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [previousWord, setPreviousWord] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const [showFailure, setShowFailure] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const loadNewWord = () => {
    const wordsForLevel = wordDB[language][level] || wordDB[language][1];
    let availableWords = wordsForLevel.filter(w => !usedWords.includes(w.word));
    
    if (availableWords.length === 0) {
      availableWords = wordsForLevel; // Recycle words if they finish all of them
    }
    
    let randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    if (availableWords.length > 1) {
      while (previousWord && randomWord.word === previousWord.word) {
        randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      }
    }
    
    setCurrentWordObj(randomWord);
    
    // Ensure the scramble is never the correct word initially
    let shuffled = [...randomWord.syllables].sort(() => Math.random() - 0.5);
    while (shuffled.join('') === randomWord.word && randomWord.syllables.length > 1) {
      shuffled = [...randomWord.syllables].sort(() => Math.random() - 0.5);
    }
    
    setScrambled(shuffled);
    setAssembled([]);
    setHasStarted(false);
    setFeedback(null);
    setShowSuccess(null);
    setShowFailure(false);
    setWrongCount(0);
  };

  useEffect(() => {
    loadNewWord();
  }, [level, language]);

  const speakWord = () => {
    if (!currentWordObj) return;
    const utterance = new SpeechSynthesisUtterance(currentWordObj.word);
    utterance.lang = language === 'en' ? 'en-US' : 'pt-PT';
    window.speechSynthesis.speak(utterance);
    setHasStarted(true);
  };

  const handleDragStart = (e, syllable, sourceIndex, sourceArray) => {
    e.dataTransfer.setData("syllable", syllable);
    e.dataTransfer.setData("sourceIndex", sourceIndex);
    e.dataTransfer.setData("sourceArray", sourceArray);
  };

  const handleDropToAssembled = (e) => {
    e.preventDefault();
    const syllable = e.dataTransfer.getData("syllable");
    const sourceArray = e.dataTransfer.getData("sourceArray");
    const sourceIndex = e.dataTransfer.getData("sourceIndex");

    if (sourceArray === "scrambled") {
      setAssembled([...assembled, syllable]);
      const newScrambled = [...scrambled];
      newScrambled.splice(sourceIndex, 1);
      setScrambled(newScrambled);
    }
  };

  // Mobile-friendly tap to move
  const handleTapScrambled = (syllable, sourceIndex) => {
    setAssembled([...assembled, syllable]);
    const newScrambled = [...scrambled];
    newScrambled.splice(sourceIndex, 1);
    setScrambled(newScrambled);
  };

  const handleTapAssembled = (syllable, sourceIndex) => {
    setScrambled([...scrambled, syllable]);
    const newAssembled = [...assembled];
    newAssembled.splice(sourceIndex, 1);
    setAssembled(newAssembled);
  };

  const handleDragOver = (e) => e.preventDefault();

  const checkAnswer = () => {
    if (assembled.length === 0) return;
    if (assembled.join('') === currentWordObj.word) {
      setFeedback('correct');
      setPreviousWord(currentWordObj);
      playCorrectSound();
      setShowSuccess(currentWordObj.image || '🌟');
      markWordAsLearned(currentWordObj);
      markWordAsUsed(currentWordObj.word);
      
      const willChange = updateScore(true);
      setTimeout(() => {
        setShowSuccess(null);
        if (!willChange) loadNewWord();
      }, 3000);
    } else {
      setFeedback('wrong');
      setShowFailure(true);
      setWrongCount(prev => prev + 1);
      const willChange = updateScore(false);
      setTimeout(() => {
        let reshuffled = [...currentWordObj.syllables].sort(() => Math.random() - 0.5);
        while (reshuffled.join('') === currentWordObj.word && currentWordObj.syllables.length > 1) {
          reshuffled = [...currentWordObj.syllables].sort(() => Math.random() - 0.5);
        }
        setScrambled(reshuffled);
        setAssembled([]);
        setFeedback(null);
        setShowFailure(false);
      }, 1500);
    }
  };

  return (
    <div className="language-game">
      <h2>{language === 'en' ? `Level ${level}` : `Nível ${level}`}</h2>

      {showSuccess && (
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

      {!hasStarted ? (
        <div className="start-screen">
          <p className="instruction">{language === 'en' ? 'Listen to the word first!' : 'Ouça a palavra primeiro!'}</p>
          <button className="big-btn play-btn" onClick={speakWord}>▶️ {language === 'en' ? 'Play Word' : 'Ouvir Palavra'}</button>
        </div>
      ) : (
        <div className="game-screen">
          <button className="nav-btn" onClick={speakWord}>🔁 {language === 'en' ? 'Repeat Audio' : 'Repetir Som'}</button>

          <div className="syllable-container scrambled-area">
            {scrambled.map((syl, index) => (
              <div 
                key={`scrambled-${index}`} 
                className="syllable-block" 
                draggable 
                onDragStart={(e) => handleDragStart(e, syl, index, "scrambled")}
                onClick={() => handleTapScrambled(syl, index)}
              >
                {syl}
              </div>
            ))}
          </div>

          <p className="instruction">{language === 'en' ? 'Drag or tap below:' : 'Arraste ou toque para baixo:'}</p>

          <div className="drop-zone" onDrop={handleDropToAssembled} onDragOver={handleDragOver}>
            {assembled.length === 0 && <span className="placeholder">...</span>}
            {assembled.map((syl, index) => (
              <div 
                key={`assembled-${index}`} 
                className="syllable-block assembled"
                onClick={() => handleTapAssembled(syl, index)}
              >
                {syl}
              </div>
            ))}
          </div>

          {wrongCount >= 2 && currentWordObj && (
            <div className="hint-container" style={{ justifyContent: 'center' }}>
              <div className="hint-box">💡 {language === 'en' ? 'Hint: The first syllable is' : 'Dica: A primeira sílaba é'} "{currentWordObj.syllables[0]}"</div>
            </div>
          )}

          <button onClick={checkAnswer} className="nav-btn" style={{ padding: '20px 40px', fontSize: '24px', backgroundColor: '#4CAF50', width: '100%' }}>
            ✅ {language === 'en' ? 'Submit Answer' : 'Confirmar Resposta'}
          </button>

          {feedback && <div className={`feedback ${feedback}`}>{feedback === 'correct' ? '✅ Correto!' : '❌ Tenta outra vez!'}</div>}
        </div>
      )}
      <div className="controls"><button className="nav-btn" onClick={goHome}>🏠 {language === 'en' ? 'Home' : 'Início'}</button></div>
    </div>
  );
}