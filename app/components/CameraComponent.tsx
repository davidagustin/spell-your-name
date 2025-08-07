'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraComponentProps {
  targetLetter: string;
  onCorrectGesture: () => void;
  isActive: boolean;
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
  const [fingerFeedback, setFingerFeedback] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) {
      setIsCameraActive(false);
      return;
    }

    let hands: any = null;
    let camera: any = null;

    const initializeCamera = async () => {
      try {
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
          modelComplexity: 0, // Use simpler model for better performance
          minDetectionConfidence: 0.5, // Lower threshold to detect hands more easily
          minTrackingConfidence: 0.5,  // Lower threshold for tracking
          refineLandmarks: false        // Disable for better performance
        });

        hands.onResults((results: any) => {
          console.log('MediaPipe results:', results.multiHandLandmarks ? results.multiHandLandmarks.length : 'No hands');
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const result = classifyHandGesture(landmarks);
            const letter = result.letter;
            const feedback = result.feedback;
            
            console.log('Detected letter:', letter, 'Target:', targetLetter);
            
            // Update finger feedback immediately
            setFingerFeedback(feedback);
            
            // Show detection immediately for better feedback
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
            console.log('No hand detected');
            setDetectedLetter(null);
            setConfidence(0);
            setIsCorrect(false);
            setDetectionCount(0);
            setLastDetectedLetter(null);
            setFingerFeedback([]);
          }

          // Draw hand landmarks
          if (canvasRef.current && videoRef.current) {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx) {
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
              
              if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                  // Draw hand connections manually since HAND_CONNECTIONS might not be available
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
                  drawLandmarks(canvasCtx, landmarks, {
                    color: isCorrect ? '#00FF00' : '#FF0000',
                    lineWidth: 1,
                    radius: 3
                  });
                }
              }
              canvasCtx.restore();
            }
          }
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
      }
    };

    initializeCamera();

    return () => {
      if (camera) {
        camera.stop();
      }
      setIsCameraActive(false);
    };
  }, [isActive, targetLetter, onCorrectGesture]);

  const classifyHandGesture = (landmarks: any[]): { letter: string, feedback: string[] } => {
    // Improved gesture classification with better accuracy and feedback
    
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
      
      // More precise finger detection
      const isExtended = tipY < baseY - 0.02; // Add threshold for better accuracy
      const isPartiallyExtended = tipY < midY;
      
      return { extended: isExtended, partial: isPartiallyExtended };
    });

    // Enhanced gesture patterns with more specific detection
    const gestures: { [key: string]: { pattern: boolean[], confidence: number } } = {
      'A': { pattern: [false, false, false, false, false], confidence: 0.8 }, // All fingers closed
      'B': { pattern: [false, true, true, true, true], confidence: 0.85 },     // All fingers except thumb extended
      'C': { pattern: [false, false, false, false, false], confidence: 0.7 }, // Curved fingers
      'D': { pattern: [false, true, false, false, false], confidence: 0.9 },  // Only index finger
      'E': { pattern: [false, false, false, false, false], confidence: 0.8 }, // All fingers closed
      'F': { pattern: [false, true, true, false, false], confidence: 0.85 },   // Index and middle extended
      'G': { pattern: [false, true, false, false, false], confidence: 0.9 },  // Only index finger
      'H': { pattern: [false, true, true, false, false], confidence: 0.85 },   // Index and middle extended
      'I': { pattern: [false, false, false, false, true], confidence: 0.9 },  // Only pinky
      'J': { pattern: [false, false, false, false, true], confidence: 0.9 },  // Only pinky
      'K': { pattern: [false, true, true, false, false], confidence: 0.85 },   // Index and middle extended
      'L': { pattern: [true, true, false, false, false], confidence: 0.9 },   // Thumb and index
      'M': { pattern: [false, false, false, false, false], confidence: 0.7 }, // Three fingers on thumb
      'N': { pattern: [false, false, false, false, false], confidence: 0.7 }, // Two fingers on thumb
      'O': { pattern: [false, false, false, false, false], confidence: 0.7 }, // All fingers curved
      'P': { pattern: [false, false, true, false, false], confidence: 0.8 },  // Middle finger down
      'Q': { pattern: [false, true, false, false, false], confidence: 0.8 },  // Index finger down
      'R': { pattern: [false, true, true, false, false], confidence: 0.8 },   // Crossed fingers
      'S': { pattern: [false, false, false, false, false], confidence: 0.8 }, // Fist
      'T': { pattern: [false, false, false, false, false], confidence: 0.7 }, // Thumb between fingers
      'U': { pattern: [false, true, true, false, false], confidence: 0.85 },   // Index and middle together
      'V': { pattern: [false, true, true, false, false], confidence: 0.85 },   // Index and middle apart
      'W': { pattern: [false, true, true, true, false], confidence: 0.9 },    // Three fingers
      'X': { pattern: [false, true, false, false, false], confidence: 0.8 },  // Bent index
      'Y': { pattern: [false, false, false, false, true], confidence: 0.9 },  // Thumb and pinky
      'Z': { pattern: [false, true, false, false, false], confidence: 0.8 }   // Index finger
    };

    // Enhanced matching algorithm with feedback
    let bestMatch = 'A';
    let bestScore = 0;
    let feedback: string[] = [];

    for (const [letter, gesture] of Object.entries(gestures)) {
      const pattern = gesture.pattern;
      const confidence = gesture.confidence;
      
      // Calculate pattern match score and collect feedback
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

    // Add stability check - require higher confidence for detection
    return {
      letter: bestScore > 0.7 ? bestMatch : 'A',
      feedback: bestScore > 0.7 ? feedback : ['Position your hand in the center', 'Make sure all fingers are visible']
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
        
        {/* Minimal Target Display - Top Left */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg p-2 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Target</p>
            <p className="text-lg font-bold text-blue-400">{targetLetter}</p>
          </div>
        </div>
        
        {/* Minimal Hand Positioning Guide */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border border-dashed border-white rounded-full opacity-30"></div>
            
            {/* Red Wireframe Guide for Target Letter */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32">
              {targetLetter === 'A' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 80 L50 20 L80 80 M30 60 L70 60" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <circle cx="50" cy="85" r="8" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                </svg>
              )}
              {targetLetter === 'B' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 35 L70 35 M20 50 L70 50 M20 65 L70 65" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                </svg>
              )}
              {targetLetter === 'C' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M30 20 Q50 20 70 40 Q70 60 50 80 Q30 80 20 60 Q20 40 30 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'D' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <circle cx="50" cy="30" r="15" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                  <path d="M50 30 L50 70" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'E' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 35 L70 35 M20 50 L70 50 M20 65 L70 65" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                </svg>
              )}
              {targetLetter === 'F' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <circle cx="50" cy="30" r="15" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                  <path d="M50 30 L50 70" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'G' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <circle cx="50" cy="30" r="15" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                  <path d="M50 30 L50 70" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'H' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M80 20 L80 80 M20 50 L80 50" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'I' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <circle cx="50" cy="30" r="15" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                  <path d="M50 30 L50 70" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'J' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M50 30 Q70 50 50 70 Q30 50 50 30" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'K' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 L80 80 M20 80 L80 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'L' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'M' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M30 20 L30 80 M50 20 L50 80 M70 20 L70 80" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                </svg>
              )}
              {targetLetter === 'N' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M30 20 L30 80 M70 20 L70 80" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                </svg>
              )}
              {targetLetter === 'O' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <ellipse cx="50" cy="50" rx="25" ry="35" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'P' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 Q50 20 80 20 Q80 50 50 50 Q20 50 20 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'Q' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 Q50 20 80 20 Q80 50 50 50 Q20 50 20 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'R' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 L80 80 M20 80 L80 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'S' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 Q50 20 80 20 Q80 50 50 50 Q20 50 20 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'T' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M50 20 L50 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'U' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M80 20 L80 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'V' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M80 20 L80 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 L50 50 L80 20" stroke="red" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
                </svg>
              )}
              {targetLetter === 'W' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M40 20 L40 80 M60 20 L60 80 M80 20 L80 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'X' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 L80 80 M20 80 L80 20" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'Y' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L20 80 M80 20 L80 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 80 L80 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
              {targetLetter === 'Z' && (
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                  <path d="M20 20 L80 20 L80 80 L20 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                  <path d="M20 20 L80 80" stroke="red" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                </svg>
              )}
            </div>
          </div>
        </div>
        

        
        {/* Simple Status Display - Top Right */}
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
        
        {/* Minimal Progress Indicator - Bottom */}
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

      {!isCameraActive && (
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