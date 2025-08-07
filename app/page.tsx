'use client';

import { useState } from 'react';
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

  const handleNameSubmit = (name: string) => {
    setLearningState({
      userName: name.toUpperCase(),
      currentLetterIndex: 0,
      isLearning: true
    });
  };

  const handleNextLetter = () => {
    if (learningState.currentLetterIndex < learningState.userName.length - 1) {
      setLearningState(prev => ({
        ...prev,
        currentLetterIndex: prev.currentLetterIndex + 1
      }));
    } else {
      setLearningState(prev => ({
        ...prev,
        isLearning: false,
        currentLetterIndex: 0
      }));
    }
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
        <header className="text-center mb-8">
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

              <CameraComponent
                targetLetter={currentLetter}
                onCorrectGesture={handleNextLetter}
                isActive={isLearning}
              />
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
