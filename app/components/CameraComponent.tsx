'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraComponentProps {
  targetLetter: string;
  onCorrectGesture: () => void;
  isActive: boolean;
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface GestureResult {
  letter: string;
  feedback: string[];
}

export default function CameraComponent({ targetLetter, onCorrectGesture, isActive }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedLetter, setDetectedLetter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detectionCount, setDetectionCount] = useState<number>(0);
  const [lastDetectedLetter, setLastDetectedLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      setIsCameraActive(false);
      return;
    }

    let hands: any = null;
    let camera: any = null;

    const initializeCamera = async () => {
      try {
        setError(null);
        
        // Dynamically import MediaPipe modules
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');

        hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          refineLandmarks: false
        });

        hands.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const result = classifyHandGesture(landmarks);
            const letter = result.letter;
            
            setDetectedLetter(letter);
            
            // Add stability check - require consistent detection for confidence
            if (letter === lastDetectedLetter) {
              setDetectionCount(prev => prev + 1);
            } else {
              setDetectionCount(1);
              setLastDetectedLetter(letter);
            }
            
            if (letter === targetLetter) {
              setConfidence(0.9);
              setIsCorrect(true);
              // Require 3 consistent detections before triggering
              if (detectionCount >= 3) {
                setTimeout(() => {
                  onCorrectGesture();
                  setIsCorrect(false);
                  setDetectionCount(0);
                }, 1000);
              }
            } else {
              setConfidence(0.3);
              setIsCorrect(false);
            }
          } else {
            setDetectedLetter(null);
            setConfidence(0);
            setIsCorrect(false);
            setDetectionCount(0);
            setLastDetectedLetter(null);
          }

          // Draw hand landmarks
          drawHandLandmarks(results);
        });

        camera = new Camera(videoRef.current!, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await camera.start();
        setIsCameraActive(true);
      } catch (error) {
        console.error('Error initializing camera:', error);
        setError('Failed to initialize camera. Please check permissions and try again.');
      }
    };

    initializeCamera();

    return () => {
      if (camera) {
        camera.stop();
      }
      setIsCameraActive(false);
    };
  }, [isActive, targetLetter, onCorrectGesture, lastDetectedLetter, detectionCount]);

  const drawHandLandmarks = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand connections
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // index
          [0, 9], [9, 10], [10, 11], [11, 12], // middle
          [0, 13], [13, 14], [14, 15], [15, 16], // ring
          [0, 17], [17, 18], [18, 19], [19, 20], // pinky
          [0, 5], [5, 9], [9, 13], [13, 17] // palm connections
        ];
        
        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          canvasCtx.beginPath();
          canvasCtx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
          canvasCtx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
          canvasCtx.strokeStyle = isCorrect ? '#00FF00' : '#FF0000';
          canvasCtx.lineWidth = 2;
          canvasCtx.stroke();
        });
      }
    }
    canvasCtx.restore();
  };

  const classifyHandGesture = (landmarks: HandLandmark[]): GestureResult => {
    // Define finger landmarks
    const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
    const fingerBases = [2, 5, 9, 13, 17];
    const fingerMids = [3, 6, 10, 14, 18];
    const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
    
    // Calculate finger extension with more precision
    const fingerStates = fingerTips.map((tip, index) => {
      const tipY = landmarks[tip].y;
      const baseY = landmarks[fingerBases[index]].y;
      const midY = landmarks[fingerMids[index]].y;
      
      // More lenient detection for better accuracy
      const isExtended = tipY < baseY - 0.01; // Reduced threshold
      const isPartiallyExtended = tipY < midY;
      
      return { extended: isExtended, partial: isPartiallyExtended };
    });

    // Enhanced gesture patterns with more specific detection
    const gestures: { [key: string]: { pattern: boolean[], confidence: number } } = {
      'A': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'B': { pattern: [false, true, true, true, true], confidence: 0.85 },
      'C': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'D': { pattern: [false, true, false, false, false], confidence: 0.9 },
      'E': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'F': { pattern: [false, true, true, false, false], confidence: 0.85 },
      'G': { pattern: [false, true, false, false, false], confidence: 0.9 },
      'H': { pattern: [false, true, true, false, false], confidence: 0.85 },
      'I': { pattern: [false, false, false, false, true], confidence: 0.9 },
      'J': { pattern: [false, false, false, false, true], confidence: 0.9 },
      'K': { pattern: [false, true, true, false, false], confidence: 0.85 },
      'L': { pattern: [true, true, false, false, false], confidence: 0.9 },
      'M': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'N': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'O': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'P': { pattern: [false, false, true, false, false], confidence: 0.8 },
      'Q': { pattern: [false, true, false, false, false], confidence: 0.8 },
      'R': { pattern: [false, true, true, false, false], confidence: 0.8 },
      'S': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'T': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'U': { pattern: [false, true, true, false, false], confidence: 0.85 },
      'V': { pattern: [false, true, true, false, false], confidence: 0.85 },
      'W': { pattern: [false, true, true, true, false], confidence: 0.9 },
      'X': { pattern: [false, true, false, false, false], confidence: 0.8 },
      'Y': { pattern: [false, false, false, false, true], confidence: 0.9 },
      'Z': { pattern: [false, true, false, false, false], confidence: 0.8 }
    };

    // Enhanced matching algorithm with feedback
    let bestMatch = 'A';
    let bestScore = 0;
    let feedback: string[] = [];

    for (const [letter, gesture] of Object.entries(gestures)) {
      const pattern = gesture.pattern;
      const confidence = gesture.confidence;
      
      let patternScore = 0;
      const letterFeedback: string[] = [];
      
      pattern.forEach((expected, index) => {
        const actual = fingerStates[index].extended;
        if (expected === actual) {
          patternScore++;
        } else {
          if (expected && !actual) {
            letterFeedback.push(`Extend your ${fingerNames[index]} finger`);
          } else if (!expected && actual) {
            letterFeedback.push(`Close your ${fingerNames[index]} finger`);
          }
        }
      });
      
      patternScore = patternScore / pattern.length;
      const finalScore = patternScore * confidence;

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = letter;
        feedback = letterFeedback;
      }
    }

    console.log('Classification debug:', {
      bestMatch,
      bestScore,
      fingerStates: fingerStates.map((state, i) => ({ finger: fingerNames[i], extended: state.extended }))
    });

    return {
      letter: bestScore > 0.3 ? bestMatch : 'A', // Lower threshold for detection
      feedback: bestScore > 0.3 ? feedback : ['Position your hand in the center', 'Make sure all fingers are visible']
    };
  };

  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Camera</h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">Camera is inactive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Camera</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full rounded-lg border-2 border-gray-300"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          width={640}
          height={480}
        />
        
        {/* Target Display */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg p-2 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Target</p>
            <p className="text-lg font-bold text-blue-400">{targetLetter}</p>
          </div>
        </div>
        
        {/* Hand Positioning Guide */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border border-dashed border-white rounded-full opacity-30"></div>
          </div>
        </div>
        
        {/* Status Display */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-2 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Detected</p>
            <p className={`text-lg font-bold ${
              detectedLetter ? (isCorrect ? 'text-green-400' : 'text-red-400') : 'text-gray-300'
            }`}>
              {detectedLetter || 'None'}
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-70 rounded-lg p-2 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">Progress</span>
              <span className="text-xs">{detectionCount}/3</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  isCorrect ? 'bg-green-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min((detectionCount / 3) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1 text-gray-300">
              {detectionCount >= 3 ? 'Perfect! Hold...' : 
               detectionCount >= 1 ? 'Good! Keep holding...' : 
               'Position your hand'}
            </p>
            
            {/* Debug Info */}
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="font-semibold text-yellow-800">Debug:</p>
              <p>Hand: {detectedLetter || 'None'}</p>
              <p>Target: {targetLetter}</p>
              <p>Count: {detectionCount}/3</p>
              <p>Confidence: {confidence.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Target Letter:</span>
          <span className="text-lg font-bold text-blue-600">{targetLetter}</span>
        </div>
        
        {detectedLetter && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Detected:</span>
            <span className={`text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {detectedLetter}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-sm font-medium ${isCameraActive ? 'text-green-600' : 'text-red-600'}`}>
            {isCameraActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {!isCameraActive && !error && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Please allow camera access to start hand gesture recognition.
          </p>
        </div>
      )}

      {isCameraActive && (
        <div className="mt-4 space-y-3">
          {/* Tips */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Tips for Better Detection</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep your hand steady and clearly visible</li>
              <li>• Ensure good lighting on your hand</li>
              <li>• Position your hand 12-18 inches from the camera</li>
              <li>• Hold the sign for 2-3 seconds for detection</li>
              <li>• Use a plain background behind your hand</li>
              <li>• Make sure all fingers are clearly visible</li>
            </ul>
            {detectionCount > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                Detection stability: {detectionCount}/3 frames
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 