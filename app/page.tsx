'use client';

import { useState, useRef } from 'react';
import CameraComponent from './components/CameraComponent';
import AlphabetGuide from './components/AlphabetGuide';
import NameInput from './components/NameInput';

interface LearningState {
  userName: string;
  currentLetterIndex: number;
  isLearning: boolean;
}

export default function Home() {
  const [learningState, setLearningState] = useState<LearningState>({
    userName: '',
    currentLetterIndex: 0,
    isLearning: false
  });
  
  const isProcessingRef = useRef(false);

  const handleNameSubmit = (name: string) => {
    setLearningState({
      userName: name.toUpperCase(),
      currentLetterIndex: 0,
      isLearning: true
    });
  };

  const handleNextLetter = () => {
    // Prevent multiple calls if already completed or processing
    if (!learningState.isLearning || isProcessingRef.current) {
      return;
    }
    
    isProcessingRef.current = true;
    
    if (learningState.currentLetterIndex < learningState.userName.length - 1) {
      setLearningState(prev => ({
        ...prev,
        currentLetterIndex: prev.currentLetterIndex + 1
      }));
    } else {
      // Completed all letters
      setLearningState(prev => ({
        ...prev,
        isLearning: false,
        currentLetterIndex: 0
      }));
    }
    
    // Reset processing flag after a delay
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 2000); // 2 second delay to prevent rapid successive calls
  };

  const handleReset = () => {
    setLearningState({
      userName: '',
      currentLetterIndex: 0,
      isLearning: false
    });
  };

  const { userName, currentLetterIndex, isLearning } = learningState;
  const currentLetter = userName[currentLetterIndex] || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <a
              href="https://github.com/davidagustin/spell-your-name"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sign Language Spell Your Name
          </h1>
          <p className="text-lg text-gray-600">
            Learn to spell your name in American Sign Language
          </p>
        </header>

        {!userName ? (
          <NameInput onSubmit={handleNameSubmit} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ProgressCard 
                userName={userName}
                currentLetterIndex={currentLetterIndex}
                onNextLetter={handleNextLetter}
                onReset={handleReset}
              />

              {isLearning ? (
                <CameraComponent
                  targetLetter={currentLetter}
                  onCorrectGesture={handleNextLetter}
                  isActive={isLearning}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-600 mb-4">
                      🎉 Congratulations! 🎉
                    </h3>
                    <p className="text-lg text-gray-700 mb-4">
                      You successfully spelled "{userName}" in sign language!
                    </p>
                    <button
                      onClick={handleReset}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors text-lg"
                    >
                      Try Another Name
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <AlphabetGuide currentLetter={currentLetter} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgressCardProps {
  userName: string;
  currentLetterIndex: number;
  onNextLetter: () => void;
  onReset: () => void;
}

function ProgressCard({ userName, currentLetterIndex, onNextLetter, onReset }: ProgressCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Current Progress
      </h2>
      <div className="mb-4">
        <p className="text-lg text-gray-600 mb-2">
          Spelling: <span className="font-mono text-xl">{userName}</span>
        </p>
        <p className="text-lg text-gray-600">
          Current letter: <span className="font-bold text-2xl text-blue-600">
            {userName[currentLetterIndex]}
          </span>
        </p>
        <div className="mt-4">
          <div className="flex gap-1">
            {userName.split('').map((letter, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index < currentLetterIndex
                    ? 'bg-green-500 text-white'
                    : index === currentLetterIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onNextLetter}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Next Letter
        </button>
        <button
          onClick={onReset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
