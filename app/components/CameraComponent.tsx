'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { evaluateHandGesture, HandGestureData, LLMEvaluationResult } from '../services/llmEvaluation';

// Custom hook to suppress WebGL console spam
const useConsoleSuppression = () => {
  const originalWarnRef = useRef<typeof console.warn | null>(null);
  const originalErrorRef = useRef<typeof console.error | null>(null);
  const isSuppressedRef = useRef(false);

  const suppressConsole = useCallback(() => {
    if (isSuppressedRef.current) return;
    
    originalWarnRef.current = console.warn;
    originalErrorRef.current = console.error;
    
    console.warn = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && (
        message.includes('WebGL') || 
        message.includes('OpenGL') || 
        message.includes('gl_context') ||
        message.includes('hands soluti') ||
        message.includes('simd wasm bin.js') ||
        message.includes('WebGL context') ||
        message.includes('disabled') ||
        message.includes('destroyed') ||
        message.includes('created') ||
        message.includes('overflowing')
      )) {
        return; // Suppress WebGL-related messages
      }
      originalWarnRef.current?.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && (
        message.includes('WebGL') || 
        message.includes('OpenGL') || 
        message.includes('gl_context') ||
        message.includes('hands soluti') ||
        message.includes('simd wasm bin.js') ||
        message.includes('WebGL context') ||
        message.includes('disabled') ||
        message.includes('destroyed') ||
        message.includes('created') ||
        message.includes('overflowing')
      )) {
        return; // Suppress WebGL-related messages
      }
      originalErrorRef.current?.apply(console, args);
    };
    
    isSuppressedRef.current = true;
  }, []);

  const restoreConsole = useCallback(() => {
    if (!isSuppressedRef.current) return;
    
    if (originalWarnRef.current) {
      console.warn = originalWarnRef.current;
    }
    if (originalErrorRef.current) {
      console.error = originalErrorRef.current;
    }
    
    isSuppressedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      restoreConsole();
    };
  }, [restoreConsole]);

  return { suppressConsole, restoreConsole };
};

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

interface GestureAnalysis {
  letter: string;
  confidence: number;
  fingerStates: {
    thumb: { extended: boolean; angle: number };
    index: { extended: boolean; angle: number };
    middle: { extended: boolean; angle: number };
    ring: { extended: boolean; angle: number };
    pinky: { extended: boolean; angle: number };
  };
  handOrientation: string;
  stability: { isStable: boolean; score: number };
}

export default function CameraComponent({ targetLetter, onCorrectGesture, isActive }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<GestureAnalysis | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stableFrames, setStableFrames] = useState(0);
  const [llmResult, setLlmResult] = useState<LLMEvaluationResult | null>(null);
  
  // Performance optimization refs
  const previousLandmarksRef = useRef<HandLandmark[] | null>(null);
  const lastAnalysisTimeRef = useRef(0);
  const lastDrawTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Console suppression hook
  const { suppressConsole, restoreConsole } = useConsoleSuppression();

  // Optimized stability check with debouncing
  const isHandStable = useCallback((currentLandmarks: HandLandmark[], previousLandmarks: HandLandmark[] | null): boolean => {
    if (!previousLandmarks) return false;
    
    let totalMovement = 0;
    const keyPoints = [0, 4, 8, 12, 16, 20]; // Wrist and fingertips
    
    for (const index of keyPoints) {
      const current = currentLandmarks[index];
      const previous = previousLandmarks[index];
      
      const movement = Math.sqrt(
        Math.pow(current.x - previous.x, 2) + 
        Math.pow(current.y - previous.y, 2)
      );
      
      totalMovement += movement;
    }
    
    const averageMovement = totalMovement / keyPoints.length;
    return averageMovement < 0.03;
  }, []);

  // Optimized finger analysis
  const analyzeFingers = useCallback((landmarks: HandLandmark[]) => {
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerBases = [2, 5, 9, 13, 17];
    const fingerMids = [3, 6, 10, 14, 18];
    
    const fingerStates = {
      thumb: { extended: false, angle: 0 },
      index: { extended: false, angle: 0 },
      middle: { extended: false, angle: 0 },
      ring: { extended: false, angle: 0 },
      pinky: { extended: false, angle: 0 }
    };
    
    const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
    
    fingerNames.forEach((finger, index) => {
      const tip = landmarks[fingerTips[index]];
      const base = landmarks[fingerBases[index]];
      const mid = landmarks[fingerMids[index]];
      const wrist = landmarks[0];
      
      const tipToWrist = Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) + 
        Math.pow(tip.y - wrist.y, 2)
      );
      
      const midToWrist = Math.sqrt(
        Math.pow(mid.x - wrist.x, 2) + 
        Math.pow(mid.y - wrist.y, 2)
      );
      
      const extensionRatio = tipToWrist / midToWrist;
      fingerStates[finger].extended = extensionRatio > 1.1;
      fingerStates[finger].angle = Math.atan2(tip.y - base.y, tip.x - base.x);
    });
    
    return fingerStates;
  }, []);

  // Optimized gesture classification
  const classifyGesture = useCallback((fingerStates: any): { letter: string; confidence: number } => {
    const { thumb, index, middle, ring, pinky } = fingerStates;
    
    const patterns: Record<string, { pattern: boolean[]; confidence: number }> = {
      'A': { pattern: [true, false, false, false, false], confidence: 0.9 },
      'B': { pattern: [false, true, true, true, true], confidence: 0.9 },
      'C': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'D': { pattern: [false, true, false, false, false], confidence: 0.9 },
      'E': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'F': { pattern: [true, true, true, false, false], confidence: 0.9 },
      'G': { pattern: [false, true, false, false, false], confidence: 0.9 },
      'H': { pattern: [false, true, true, false, false], confidence: 0.9 },
      'I': { pattern: [false, false, false, false, true], confidence: 0.9 },
      'J': { pattern: [false, false, false, false, true], confidence: 0.9 },
      'K': { pattern: [false, true, true, false, false], confidence: 0.9 },
      'L': { pattern: [true, true, false, false, false], confidence: 0.9 },
      'M': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'N': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'O': { pattern: [false, false, false, false, false], confidence: 0.7 },
      'P': { pattern: [false, false, true, false, false], confidence: 0.9 },
      'Q': { pattern: [false, true, false, false, false], confidence: 0.9 },
      'R': { pattern: [false, true, true, false, false], confidence: 0.9 },
      'S': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'T': { pattern: [false, false, false, false, false], confidence: 0.8 },
      'U': { pattern: [false, true, true, false, false], confidence: 0.9 },
      'V': { pattern: [false, true, true, false, false], confidence: 0.9 },
      'W': { pattern: [false, true, true, true, false], confidence: 0.9 },
      'X': { pattern: [false, true, false, false, false], confidence: 0.9 },
      'Y': { pattern: [true, false, false, false, true], confidence: 0.9 },
      'Z': { pattern: [false, true, false, false, false], confidence: 0.9 }
    };

    let bestMatch = '';
    let bestScore = 0;

    for (const [letter, pattern] of Object.entries(patterns)) {
      const expected = pattern.pattern;
      const actual = [thumb.extended, index.extended, middle.extended, ring.extended, pinky.extended];
      
      let matches = 0;
      for (let i = 0; i < 5; i++) {
        if (expected[i] === actual[i]) matches++;
      }
      
      const score = (matches / 5) * pattern.confidence;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = letter;
      }
    }

    return { letter: bestMatch, confidence: bestScore };
  }, []);

  // Optimized hand orientation detection
  const determineHandOrientation = useCallback((landmarks: HandLandmark[]): string => {
    const wrist = landmarks[0];
    const middleFinger = landmarks[12];
    
    const dx = middleFinger.x - wrist.x;
    const dy = middleFinger.y - wrist.y;
    
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }, []);

  // Optimized stability score calculation
  const calculateStabilityScore = useCallback((currentLandmarks: HandLandmark[], previousLandmarks: HandLandmark[] | null): number => {
    if (!previousLandmarks) return 0.8;
    
    let totalMovement = 0;
    const keyPoints = [0, 4, 8, 12, 16, 20];
    
    for (const index of keyPoints) {
      const current = currentLandmarks[index];
      const previous = previousLandmarks[index];
      
      const movement = Math.sqrt(
        Math.pow(current.x - previous.x, 2) + 
        Math.pow(current.y - previous.y, 2)
      );
      
      totalMovement += movement;
    }
    
    const averageMovement = totalMovement / keyPoints.length;
    return Math.max(0, 1 - (averageMovement * 5));
  }, []);

  // Optimized hand gesture analysis with throttling
  const analyzeHandGesture = useCallback((landmarks: HandLandmark[], previousLandmarks: HandLandmark[] | null): GestureAnalysis => {
    const now = performance.now();
    if (now - lastAnalysisTimeRef.current < 100) { // Throttle to 10fps
      return currentAnalysis || {
        letter: '',
        confidence: 0,
        fingerStates: {
          thumb: { extended: false, angle: 0 },
          index: { extended: false, angle: 0 },
          middle: { extended: false, angle: 0 },
          ring: { extended: false, angle: 0 },
          pinky: { extended: false, angle: 0 }
        },
        handOrientation: 'up',
        stability: { isStable: false, score: 0 }
      };
    }
    
    lastAnalysisTimeRef.current = now;
    
    const fingerStates = analyzeFingers(landmarks);
    const handOrientation = determineHandOrientation(landmarks);
    const stabilityScore = calculateStabilityScore(landmarks, previousLandmarks);
    const { letter, confidence } = classifyGesture(fingerStates);
    const isStable = stabilityScore > 0.6;

    return {
      letter,
      confidence,
      fingerStates,
      handOrientation,
      stability: { isStable, score: stabilityScore }
    };
  }, [analyzeFingers, determineHandOrientation, calculateStabilityScore, classifyGesture, currentAnalysis]);

  // Optimized LLM evaluation with debouncing
  const evaluateWithLLM = useCallback(async (landmarks: HandLandmark[]) => {
    if (isEvaluating) return;
    
    setIsEvaluating(true);
    setLlmResult(null);
    
    try {
      const fingerStates = analyzeFingers(landmarks);
      
      const gestureData: HandGestureData = {
        landmarks,
        targetLetter,
        fingerStates,
        isStable: true,
        stabilityScore: 0.9
      };

      const evaluation = await evaluateHandGesture(gestureData);
      setLlmResult(evaluation);
      
      if (evaluation.isCorrect) {
        setTimeout(() => {
          onCorrectGesture();
          setStableFrames(0);
          setLlmResult(null);
        }, 1000);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsEvaluating(false);
    }
  }, [targetLetter, isEvaluating, analyzeFingers, onCorrectGesture]);

  // Optimized landmark drawing with throttling
  const drawLandmarks = useCallback((results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const now = performance.now();
    if (now - lastDrawTimeRef.current < 50) { // Throttle to 20fps
      return;
    }
    lastDrawTimeRef.current = now;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        const isCorrect = currentAnalysis?.letter === targetLetter;
        const strokeColor = isCorrect ? '#00FF00' : '#FF0000';
        const fillColor = isCorrect ? '#00FF00' : '#FF0000';
        
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // index
          [0, 9], [9, 10], [10, 11], [11, 12], // middle
          [0, 13], [13, 14], [14, 15], [15, 16], // ring
          [0, 17], [17, 18], [18, 19], [19, 20], // pinky
          [0, 5], [5, 9], [9, 13], [13, 17] // palm
        ];
        
        canvasCtx.strokeStyle = strokeColor;
        canvasCtx.lineWidth = 2;
        canvasCtx.fillStyle = fillColor;
        
        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          
          canvasCtx.beginPath();
          canvasCtx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
          canvasCtx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
          canvasCtx.stroke();
        });

        // Draw landmarks with finger feedback
        const fingerTips = [4, 8, 12, 16, 20];
        const fingerNames = ['T', 'I', 'M', 'R', 'P'];
        
        landmarks.forEach((landmark: any, index: number) => {
          const isFingerTip = fingerTips.includes(index);
          let landmarkColor = fillColor;
          let landmarkSize = 3;
          
          if (isFingerTip && currentAnalysis?.fingerStates) {
            const fingerIndex = fingerTips.indexOf(index);
            const fingerKey = ['thumb', 'index', 'middle', 'ring', 'pinky'][fingerIndex] as keyof typeof currentAnalysis.fingerStates;
            const isExtended = currentAnalysis.fingerStates[fingerKey].extended;
            landmarkColor = isExtended ? '#00FF00' : '#FF0000';
            landmarkSize = 6;
            
            const x = landmark.x * canvasRef.current!.width;
            const y = landmark.y * canvasRef.current!.height;
            
            canvasCtx.fillStyle = isExtended ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 15, 0, 2 * Math.PI);
            canvasCtx.fill();
            
            canvasCtx.strokeStyle = isExtended ? '#00FF00' : '#FF0000';
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 15, 0, 2 * Math.PI);
            canvasCtx.stroke();
            
            canvasCtx.fillStyle = '#FFFFFF';
            canvasCtx.font = 'bold 12px Arial';
            canvasCtx.textAlign = 'center';
            canvasCtx.textBaseline = 'middle';
            canvasCtx.fillText(fingerNames[fingerIndex], x, y - 20);
            
            canvasCtx.fillStyle = isExtended ? '#00FF00' : '#FF0000';
            canvasCtx.font = 'bold 10px Arial';
            canvasCtx.fillText(isExtended ? 'OPEN' : 'CLOSED', x, y + 20);
          }
          
          canvasCtx.fillStyle = landmarkColor;
          canvasCtx.beginPath();
          canvasCtx.arc(
            landmark.x * canvasRef.current!.width,
            landmark.y * canvasRef.current!.height,
            landmarkSize,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();
        });
        
        // Draw finger connection lines with status colors
        if (currentAnalysis?.fingerStates) {
          const fingerConnections = [
            { start: 0, end: 4, finger: 'thumb' },
            { start: 0, end: 8, finger: 'index' },
            { start: 0, end: 12, finger: 'middle' },
            { start: 0, end: 16, finger: 'ring' },
            { start: 0, end: 20, finger: 'pinky' }
          ];
          
          fingerConnections.forEach(({ start, end, finger }) => {
            const isExtended = currentAnalysis.fingerStates[finger as keyof typeof currentAnalysis.fingerStates].extended;
            const connectionColor = isExtended ? '#00FF00' : '#FF0000';
            
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            canvasCtx.strokeStyle = connectionColor;
            canvasCtx.lineWidth = 3;
            canvasCtx.setLineDash([5, 5]);
            
            canvasCtx.beginPath();
            canvasCtx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
            canvasCtx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
            canvasCtx.stroke();
            
            canvasCtx.setLineDash([]);
          });
        }
      }
    }
    canvasCtx.restore();
  }, [currentAnalysis, targetLetter]);

  // Optimized MediaPipe initialization with error suppression
  const initializeHands = useCallback(async () => {
    try {
      const { Hands } = await import('@mediapipe/hands');
      const { Camera } = await import('@mediapipe/camera_utils');

      // Suppress WebGL warnings and errors
      originalConsoleWarnRef.current = console.warn;
      originalConsoleErrorRef.current = console.error;
      
      console.warn = (...args) => {
        const message = args[0];
        if (typeof message === 'string' && (
          message.includes('WebGL') || 
          message.includes('OpenGL') || 
          message.includes('gl_context') ||
          message.includes('hands soluti') ||
          message.includes('simd wasm bin.js') ||
          message.includes('WebGL context') ||
          message.includes('disabled') ||
          message.includes('destroyed') ||
          message.includes('created')
        )) {
          return; // Suppress WebGL-related warnings
        }
        originalConsoleWarnRef.current?.apply(console, args);
      };
      
      console.error = (...args) => {
        const message = args[0];
        if (typeof message === 'string' && (
          message.includes('WebGL') || 
          message.includes('OpenGL') || 
          message.includes('gl_context') ||
          message.includes('hands soluti') ||
          message.includes('simd wasm bin.js') ||
          message.includes('WebGL context') ||
          message.includes('disabled') ||
          message.includes('destroyed') ||
          message.includes('created')
        )) {
          return; // Suppress WebGL-related errors
        }
        originalConsoleErrorRef.current?.apply(console, args);
      };

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.3
      });

      const FRAME_SKIP = 6; // Process every 6th frame to reduce load

      let lastProcessTime = 0;
      const PROCESS_INTERVAL = 100; // Process every 100ms max

      hands.onResults((results: any) => {
        const now = performance.now();
        if (now - lastProcessTime < PROCESS_INTERVAL) {
          return; // Skip if processing too frequently
        }
        lastProcessTime = now;

        frameCountRef.current++;
        if (frameCountRef.current % FRAME_SKIP !== 0) return;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const analysis = analyzeHandGesture(landmarks, previousLandmarksRef.current);
          const stable = isHandStable(landmarks, previousLandmarksRef.current);
          
          setCurrentAnalysis(analysis);
          
          if (stable) {
            setStableFrames(prev => prev + 1);
            
            if (stableFrames >= 1 && !isEvaluating) {
              evaluateWithLLM(landmarks);
            }
          } else {
            setStableFrames(0);
          }
          
          previousLandmarksRef.current = landmarks;
          drawLandmarks(results);
        } else {
          setCurrentAnalysis(null);
          setStableFrames(0);
          previousLandmarksRef.current = null;
        }
      });

      return { hands, Camera };
    } catch (error) {
      // Silent error handling
      throw error;
    }
  }, [analyzeHandGesture, isHandStable, stableFrames, isEvaluating, evaluateWithLLM, drawLandmarks]);

  // Optimized camera initialization with cleanup
  useEffect(() => {
    if (!isActive) {
      setIsCameraActive(false);
      return;
    }

    let isInitializing = true;
    let cleanupTimeout: NodeJS.Timeout | undefined;

    const initializeCamera = async () => {
      setError(null);
      
      try {
        if (!videoRef.current) {
          throw new Error('Video element not found');
        }
        
        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Get camera stream with optimized settings
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 480 }, 
            height: { ideal: 360 },
            facingMode: 'user',
            frameRate: { ideal: 15 } // Lower frame rate for better performance
          } 
        });
        
        streamRef.current = stream;
        
        // Set up video
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          
          await new Promise<void>((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error('Video element not found'));
              return;
            }
            
            videoRef.current.onloadedmetadata = () => {
              videoRef.current!.play().then(resolve).catch(reject);
            };
            videoRef.current.onerror = reject;
          });
        }
        
        // Initialize MediaPipe
        const { hands: handsInstance, Camera: CameraClass } = await initializeHands();
        handsRef.current = handsInstance;
        
        cameraRef.current = new CameraClass(videoRef.current!, {
          onFrame: async () => {
            if (!isInitializing && videoRef.current && videoRef.current.readyState === 4) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (error) {
                // Silent error handling
              }
            }
          },
          width: 480,
          height: 360
        });

        await cameraRef.current.start();
        isInitializing = false;
        setIsCameraActive(true);
      } catch (error) {
        setError('Failed to initialize camera. Please check permissions and try again.');
        setIsCameraActive(false);
      }
    };

    initializeCamera();

    return () => {
      isInitializing = true;
      
      // Clear any pending timeouts
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
      
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch (error) {}
      }
      if (handsRef.current) {
        try { handsRef.current.close(); } catch (error) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Restore original console methods
      if (originalConsoleWarnRef.current) {
        console.warn = originalConsoleWarnRef.current;
      }
      if (originalConsoleErrorRef.current) {
        console.error = originalConsoleErrorRef.current;
      }
      
      setIsCameraActive(false);
    };
  }, [isActive, initializeHands]);

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
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Hand Gesture Recognition</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-2">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsCameraActive(false);
              setTimeout(() => {
                if (isActive) {
                  const event = new Event('resize');
                  window.dispatchEvent(event);
                }
              }, 100);
            }}
            className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Retry Camera
          </button>
        </div>
      )}
      
      <div className="relative" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain rounded-lg border-2 border-gray-300"
          autoPlay
          playsInline
          muted
          style={{ 
            backgroundColor: '#000000',
            transform: 'scaleX(-1)'
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          width={480}
          height={360}
        />
        
        {/* Target Letter */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg p-3 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Target</p>
            <p className="text-2xl font-bold text-blue-400">{targetLetter}</p>
          </div>
        </div>
        
        {/* Detection Status */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Detected</p>
            <p className={`text-xl font-bold ${
              currentAnalysis?.letter ? 
                (currentAnalysis.letter === targetLetter ? 'text-green-400' : 'text-red-400') : 
                'text-gray-300'
            }`}>
              {currentAnalysis?.letter || 'None'}
            </p>
            {currentAnalysis && (
              <p className="text-xs text-gray-300">
                {Math.round(currentAnalysis.confidence * 100)}% confidence
              </p>
            )}
          </div>
        </div>
        
        {/* Hand Guide */}
        {!currentAnalysis && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-2 border-dashed border-white rounded-full opacity-60 flex items-center justify-center bg-black bg-opacity-20">
                <span className="text-white text-sm font-bold text-center leading-tight">
                  Place hand<br />here
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Stability Indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Stability</span>
              <span className="text-sm">{stableFrames}/2</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentAnalysis?.stability.isStable ? 'bg-green-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min((stableFrames / 2) * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="mt-2 text-xs">
              {currentAnalysis ? (
                <div className="space-y-1">
                  <p className={`font-medium ${
                    currentAnalysis.letter === targetLetter ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentAnalysis.letter === targetLetter ? '✅ Correct!' : '❌ Try again'}
                  </p>
                  <p className="text-gray-300">
                    Stability: {Math.round(currentAnalysis.stability.score * 100)}%
                  </p>
                  {llmResult && (
                    <p className={`font-medium ${
                      llmResult.isCorrect ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      AI: {llmResult.isCorrect ? '✅ Confirmed' : '⚠️ Needs adjustment'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">Position your hand in the center</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      {currentAnalysis && (
        <div className="mt-4 space-y-3">
          {/* Finger Analysis */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2">Finger Analysis</h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {Object.entries(currentAnalysis.fingerStates).map(([finger, state]) => (
                <div key={finger} className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    state.extended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {finger.charAt(0).toUpperCase()}
                  </div>
                  <p className={`font-medium ${
                    state.extended ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {state.extended ? 'Extended' : 'Closed'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* LLM Evaluation */}
          {llmResult && (
            <div className={`rounded-lg p-3 border ${
              llmResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                llmResult.isCorrect ? 'text-green-800' : 'text-orange-800'
              }`}>
                AI Analysis: {llmResult.isCorrect ? '✅ Correct Gesture' : '⚠️ Needs Improvement'}
              </h4>
              <p className={`text-sm mb-2 ${
                llmResult.isCorrect ? 'text-green-700' : 'text-orange-700'
              }`}>
                {llmResult.reasoning}
              </p>
              {llmResult.feedback.length > 0 && (
                <div className="mt-2">
                  <p className={`font-medium mb-1 ${
                    llmResult.isCorrect ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {llmResult.isCorrect ? 'Great job!' : 'Suggestions:'}
                  </p>
                  <ul className={`text-xs space-y-1 ${
                    llmResult.isCorrect ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {llmResult.feedback.slice(0, 3).map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-800 mb-2">💡 How it works</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Hold your hand steady in the center</li>
              <li>• Make the correct sign for letter "{targetLetter}"</li>
              <li>• Keep it stable for 2 frames</li>
              <li>• AI will analyze and confirm if correct</li>
              <li>• Move to next letter when confirmed</li>
            </ul>
          </div>
        </div>
      )}

      {/* Camera Status */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">Camera Status:</span>
        <span className={`text-sm font-medium ${isCameraActive ? 'text-green-600' : 'text-red-600'}`}>
          {isCameraActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
} 