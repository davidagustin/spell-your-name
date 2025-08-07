'use client';

import { useState } from 'react';
import CameraComponent from './components/CameraComponent';
import AlphabetGuide from './components/AlphabetGuide';
import NameInput from './components/NameInput';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isLearning, setIsLearning] = useState(false);

  const handleNameSubmit = (name: string) => {
    setUserName(name.toUpperCase());
    setCurrentLetterIndex(0);
    setIsLearning(true);
  };

  const handleNextLetter = () => {
    if (currentLetterIndex < userName.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1);
    } else {
      setIsLearning(false);
      setCurrentLetterIndex(0);
    }
  };

  const handleReset = () => {
    setIsLearning(false);
    setCurrentLetterIndex(0);
    setUserName('');
  };

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
                    onClick={handleNextLetter}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Next Letter
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>

              <CameraComponent
                targetLetter={userName[currentLetterIndex]}
                onCorrectGesture={handleNextLetter}
                isActive={isLearning}
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <AlphabetGuide currentLetter={userName[currentLetterIndex]} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
