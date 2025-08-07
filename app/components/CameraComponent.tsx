'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CameraComponentProps {
  targetLetter: string;
  onCorrectGesture: () => void;
  isActive: boolean;
}

interface HandState {
  isInCircle: boolean;
  fingerCount: number;
  confidence: number;
  isStable: boolean;
  landmarks?: any[];
  fingerStates?: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

interface FingerGuide {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

/**
 * CameraComponent - Hand gesture recognition component using MediaPipe
 * 
 * Features:
 * - Real-time hand tracking with MediaPipe
 * - Circle-based hand detection
 * - Finger state detection (open/closed)
 * - Gesture stability validation
 * - Full screen mode support
 * - Visual feedback with colored landmarks and connections
 * 
 * @param targetLetter - The target ASL letter to recognize
 * @param onCorrectGesture - Callback when correct gesture is detected
 * @param isActive - Whether the camera should be active
 */
export default function CameraComponent({ targetLetter, onCorrectGesture, isActive }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [handState, setHandState] = useState<HandState>({
    isInCircle: false,
    fingerCount: 0,
    confidence: 0,
    isStable: false
  });
  const [stableTime, setStableTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const streamRef = useRef<MediaStream | null>(null);
  const isInitializingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastHandStateRef = useRef<HandState | null>(null);
  const stableStartTimeRef = useRef<number | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handsRef = useRef<any>(null);

  // Configuration constants
  const ANALYSIS_INTERVAL = 100; // Analyze every 100ms for responsiveness
  const STABILITY_DURATION = 1000; // Require 1 second of stability (reduced for responsiveness)
  const PROCESSING_COOLDOWN = 1500; // 1.5 second cooldown after processing
  const CIRCLE_RADIUS = 80; // Radius of the detection circle in pixels

  // Hand connections for drawing
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
    [0, 17], [17, 18], [18, 19], [19, 20], // pinky
    [0, 5], [5, 9], [9, 13], [13, 17] // palm connections
  ];

  // ASL gesture patterns (finger states based)
  const gesturePatterns: Record<string, FingerGuide> = {
    'A': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Fist
    'B': { thumb: false, index: true, middle: true, ring: true, pinky: true }, // All fingers extended
    'C': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Curved hand
    'D': { thumb: false, index: true, middle: false, ring: false, pinky: false }, // Index finger only
    'E': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Fist
    'F': { thumb: true, index: true, middle: true, ring: false, pinky: false }, // Three fingers
    'G': { thumb: false, index: true, middle: false, ring: false, pinky: false }, // Index finger
    'H': { thumb: false, index: true, middle: true, ring: false, pinky: false }, // Two fingers
    'I': { thumb: false, index: false, middle: false, ring: false, pinky: true }, // Pinky only
    'J': { thumb: false, index: false, middle: false, ring: false, pinky: true }, // Pinky with movement
    'K': { thumb: false, index: true, middle: true, ring: false, pinky: false }, // Two fingers
    'L': { thumb: true, index: true, middle: false, ring: false, pinky: false }, // L shape
    'M': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Three fingers down
    'N': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Two fingers down
    'O': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Fist
    'P': { thumb: false, index: true, middle: false, ring: false, pinky: false }, // Index finger
    'Q': { thumb: false, index: true, middle: false, ring: false, pinky: false }, // Index finger
    'R': { thumb: false, index: true, middle: true, ring: false, pinky: false }, // Two fingers crossed
    'S': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Fist
    'T': { thumb: false, index: false, middle: false, ring: false, pinky: false }, // Fist
    'U': { thumb: false, index: true, middle: true, ring: false, pinky: false }, // Two fingers
    'V': { thumb: false, index: true, middle: true, ring: false, pinky: false }, // Two fingers
    'W': { thumb: false, index: true, middle: true, ring: true, pinky: false }, // Three fingers
    'X': { thumb: false, index: true, middle: false, ring: false, pinky: false }, // Index finger bent
    'Y': { thumb: true, index: false, middle: false, ring: false, pinky: true }, // Thumb and pinky
    'Z': { thumb: false, index: true, middle: false, ring: false, pinky: false } // Index finger
  };

  // Initialize MediaPipe Hands
  const initializeMediaPipe = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      // Dynamically import MediaPipe
      const { Hands } = await import('@mediapipe/hands');
      
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      // Wait for MediaPipe to be ready
      await new Promise((resolve) => {
        const checkReady = () => {
          if (hands && typeof hands.initialize === 'function') {
            resolve(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });

      // Set options with proper error handling
      try {
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // Use simpler model to avoid runtime issues
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });
      } catch (optionsError) {
        console.warn('Failed to set MediaPipe options, using defaults:', optionsError);
        // Continue with default options
      }

      hands.onResults((results) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        if (videoRef.current) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw detection circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, CIRCLE_RADIUS, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          
          // Check if hand is in circle
          const wristX = landmarks[0].x * canvas.width;
          const wristY = landmarks[0].y * canvas.height;
          const distanceFromCenter = Math.sqrt(
            Math.pow(wristX - centerX, 2) + Math.pow(wristY - centerY, 2)
          );
          
          const isInCircle = distanceFromCenter <= CIRCLE_RADIUS;
          
          // Update circle color based on hand position
          ctx.strokeStyle = isInCircle ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 3;
          ctx.setLineDash(isInCircle ? [] : [10, 5]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, CIRCLE_RADIUS, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);

          if (isInCircle) {
            // Detect finger states first
            const fingerStates = detectFingerStates(landmarks);
            const fingerCount = Object.values(fingerStates).filter(Boolean).length;
            
            // Draw hand landmarks and connections with finger state colors
            drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height, fingerStates);
            
            // Update hand state
            const currentHandState: HandState = {
              isInCircle: true,
              fingerCount,
              confidence: 0.8,
              isStable: false,
              landmarks,
              fingerStates
            };

            setHandState(currentHandState);
            lastHandStateRef.current = currentHandState;
          } else {
            setHandState({
              isInCircle: false,
              fingerCount: 0,
              confidence: 0,
              isStable: false
            });
          }
        } else {
          setHandState({
            isInCircle: false,
            fingerCount: 0,
            confidence: 0,
            isStable: false
          });
        }
      });

      handsRef.current = hands;

      // Start processing frames
      const processFrame = async () => {
        if (handsRef.current && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            await handsRef.current.send({ image: videoRef.current });
          } catch (sendError) {
            console.warn('MediaPipe send error:', sendError);
            // Continue processing even if send fails
          }
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);

    } catch (error) {
      console.error('MediaPipe initialization failed:', error);
      setError('Advanced hand tracking unavailable. Using basic detection.');
      
      // Fallback to basic hand detection
      const processFrame = async () => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            // Basic hand detection fallback
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // Simple circle detection
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, CIRCLE_RADIUS, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
            
            setHandState({
              isInCircle: false,
              fingerCount: 0,
              confidence: 0,
              isStable: false
            });
          }
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };
      
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, []);

  // Draw hand landmarks and connections
  const drawHandLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number, fingerStates?: FingerGuide) => {
    // Draw connections with color based on finger states
    ctx.lineWidth = 2;
    
    HAND_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (startPoint && endPoint) {
        // Determine line color based on finger states
        let lineColor = '#00FF00'; // Default green
        
        // Check if this connection is part of a finger and set color accordingly
        // Thumb connections (landmarks 1-4)
        if ((start >= 1 && start <= 4) || (end >= 1 && end <= 4)) {
          lineColor = fingerStates?.thumb ? '#00FF00' : '#FF0000';
        }
        // Index finger connections (landmarks 5-8)
        else if ((start >= 5 && start <= 8) || (end >= 5 && end <= 8)) {
          lineColor = fingerStates?.index ? '#00FF00' : '#FF0000';
        }
        // Middle finger connections (landmarks 9-12)
        else if ((start >= 9 && start <= 12) || (end >= 9 && end <= 12)) {
          lineColor = fingerStates?.middle ? '#00FF00' : '#FF0000';
        }
        // Ring finger connections (landmarks 13-16)
        else if ((start >= 13 && start <= 16) || (end >= 13 && end <= 16)) {
          lineColor = fingerStates?.ring ? '#00FF00' : '#FF0000';
        }
        // Pinky finger connections (landmarks 17-20)
        else if ((start >= 17 && start <= 20) || (end >= 17 && end <= 20)) {
          lineColor = fingerStates?.pinky ? '#00FF00' : '#FF0000';
        }
        // Wrist connections (landmark 0) - color based on overall hand state
        else if (start === 0 || end === 0) {
          const anyFingerOpen = fingerStates && Object.values(fingerStates).some(Boolean);
          lineColor = anyFingerOpen ? '#00FF00' : '#FF0000';
        }
        
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * width;
      const y = landmark.y * height;
      
      // All dots are either red or green based on finger state
      let color = '#FF0000'; // Default red
      let radius = 4;
      let label = '';
      
      // Determine which finger this landmark belongs to and set color accordingly
      if (index === 0) { // Wrist
        // Wrist color based on overall hand state (if any finger is open, wrist is green)
        const anyFingerOpen = fingerStates && Object.values(fingerStates).some(Boolean);
        color = anyFingerOpen ? '#00FF00' : '#FF0000';
        radius = 6;
      }
      else if ([1, 2, 3, 4].includes(index)) { // Thumb landmarks
        color = fingerStates?.thumb ? '#00FF00' : '#FF0000';
        radius = 5;
        if (index === 4) { // Thumb tip
          label = fingerStates?.thumb ? 'O' : 'C';
          radius = 6;
        }
      }
      else if ([5, 6, 7, 8].includes(index)) { // Index finger landmarks
        color = fingerStates?.index ? '#00FF00' : '#FF0000';
        radius = 5;
        if (index === 8) { // Index tip
          label = fingerStates?.index ? 'O' : 'C';
          radius = 6;
        }
      }
      else if ([9, 10, 11, 12].includes(index)) { // Middle finger landmarks
        color = fingerStates?.middle ? '#00FF00' : '#FF0000';
        radius = 5;
        if (index === 12) { // Middle tip
          label = fingerStates?.middle ? 'O' : 'C';
          radius = 6;
        }
      }
      else if ([13, 14, 15, 16].includes(index)) { // Ring finger landmarks
        color = fingerStates?.ring ? '#00FF00' : '#FF0000';
        radius = 5;
        if (index === 16) { // Ring tip
          label = fingerStates?.ring ? 'O' : 'C';
          radius = 6;
        }
      }
      else if ([17, 18, 19, 20].includes(index)) { // Pinky finger landmarks
        color = fingerStates?.pinky ? '#00FF00' : '#FF0000';
        radius = 5;
        if (index === 20) { // Pinky tip
          label = fingerStates?.pinky ? 'O' : 'C';
          radius = 6;
        }
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add label (only C/O for finger tips, no numbers for other joints)
      if (label) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(label, x - 3, y + 4);
      }
    });
  }, []);

  // Detect individual finger states with improved accuracy
  const detectFingerStates = useCallback((landmarks: any[]): FingerGuide => {
    const fingerStates: FingerGuide = {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false
    };

    // Thumb detection - improved logic for better closed state detection
    const thumbTip = landmarks[4];
    const thumbMCP = landmarks[2];
    const thumbIP = landmarks[3];
    const wrist = landmarks[0];
    
    // Calculate thumb extension relative to wrist
    const thumbExtension = Math.abs(thumbTip.x - wrist.x) + Math.abs(thumbTip.y - wrist.y);
    const mcpExtension = Math.abs(thumbMCP.x - wrist.x) + Math.abs(thumbMCP.y - wrist.y);
    
    // Thumb is open if it's significantly extended beyond the MCP joint
    // Use a more lenient threshold for closed state detection
    fingerStates.thumb = thumbExtension > mcpExtension * 1.2;

    // Index finger detection - check if tip is above PIP joint
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const indexMCP = landmarks[5];
    // Index is open if tip is above PIP joint
    fingerStates.index = indexTip.y < indexPIP.y;

    // Middle finger detection - check if tip is above PIP joint
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const middleMCP = landmarks[9];
    // Middle is open if tip is above PIP joint
    fingerStates.middle = middleTip.y < middlePIP.y;

    // Ring finger detection - check if tip is above PIP joint
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const ringMCP = landmarks[13];
    // Ring is open if tip is above PIP joint
    fingerStates.ring = ringTip.y < ringPIP.y;

    // Pinky detection - check if tip is above PIP joint
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const pinkyMCP = landmarks[17];
    // Pinky is open if tip is above PIP joint
    fingerStates.pinky = pinkyTip.y < pinkyPIP.y;

    return fingerStates;
  }, []);

  // Check if current hand state is stable compared to previous
  const isHandStateStable = useCallback((current: HandState, previous: HandState | null): boolean => {
    if (!previous || !current.fingerStates || !previous.fingerStates) return false;
    
    // Check if all finger states are exactly the same
    const fingerStatesMatch = (
      current.fingerStates.thumb === previous.fingerStates.thumb &&
      current.fingerStates.index === previous.fingerStates.index &&
      current.fingerStates.middle === previous.fingerStates.middle &&
      current.fingerStates.ring === previous.fingerStates.ring &&
      current.fingerStates.pinky === previous.fingerStates.pinky
    );
    
    return (
      current.isInCircle === previous.isInCircle &&
      fingerStatesMatch &&
      Math.abs(current.confidence - previous.confidence) < 0.2
    );
  }, []);

  // Check if the detected gesture matches the target letter
  const isCorrectGesture = useCallback((fingerStates: FingerGuide | undefined): boolean => {
    if (!fingerStates) return false;
    
    const targetFingerGuide = gesturePatterns[targetLetter];
    if (!targetFingerGuide) return false;

    // Compare each finger state
    return (
      fingerStates.thumb === targetFingerGuide.thumb &&
      fingerStates.index === targetFingerGuide.index &&
      fingerStates.middle === targetFingerGuide.middle &&
      fingerStates.ring === targetFingerGuide.ring &&
      fingerStates.pinky === targetFingerGuide.pinky
    );
  }, [targetLetter]);

  // Stability and processing logic
  useEffect(() => {
    if (!handState.isInCircle || isProcessing) return;

    const now = Date.now();
    const isStable = isHandStateStable(handState, lastHandStateRef.current);
    
    if (isStable) {
      if (stableStartTimeRef.current === null) {
        stableStartTimeRef.current = now;
      }
      
      const stableDuration = now - stableStartTimeRef.current;
      setStableTime(stableDuration);
      
      // Check if stable long enough and gesture is correct
      if (stableDuration >= STABILITY_DURATION && isCorrectGesture(handState.fingerStates)) {
        console.log('✅ Correct gesture detected! Advancing to next letter...');
        setIsProcessing(true);
        onCorrectGesture();
        
        stableStartTimeRef.current = null;
        setStableTime(0);
        
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        processingTimeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
        }, PROCESSING_COOLDOWN);
      }
    } else {
      stableStartTimeRef.current = null;
      setStableTime(0);
    }
  }, [handState.isInCircle, handState.fingerStates, isProcessing]);

  // Initialize camera and MediaPipe
  useEffect(() => {
    if (!isActive) {
      setIsCameraActive(false);
      return;
    }

    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    setIsInitializing(true);

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
        
        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30 }
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
        
        setIsCameraActive(true);
        
        // Initialize MediaPipe after camera is ready
        await initializeMediaPipe();
        
      } catch (error) {
        console.warn('Camera initialization failed:', error);
        setError('Failed to initialize camera. Please check permissions and try again.');
        setIsCameraActive(false);
      } finally {
        isInitializingRef.current = false;
        setIsInitializing(false);
      }
    };

    initializeCamera();

    return () => {
      isInitializingRef.current = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      setIsCameraActive(false);
    };
  }, [isActive, initializeMediaPipe]);

  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Hand Gesture Recognition</h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">Camera is inactive</p>
        </div>
      </div>
    );
  }

  const targetFingerGuide = gesturePatterns[targetLetter];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'bg-white rounded-lg shadow-lg p-6'}`}>
      {!isFullScreen && <h3 className="text-xl font-semibold mb-4 text-gray-800">Hand Gesture Recognition</h3>}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg z-10 relative">
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
      
      <div className={`relative ${isFullScreen ? 'w-full h-full flex items-center justify-center' : ''}`} style={!isFullScreen ? { aspectRatio: '4/3' } : {}}>
        <video
          ref={videoRef}
          className={`${isFullScreen ? 'h-full w-auto object-contain' : 'w-full h-full object-contain'} rounded-lg border-2 border-gray-300`}
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
          className={`absolute ${isFullScreen ? 'h-full w-auto' : 'w-full h-full'} rounded-lg`}
          width={640}
          height={480}
          style={{
            top: isFullScreen ? '50%' : '0',
            left: isFullScreen ? '50%' : '0',
            transform: isFullScreen ? 'translate(-50%, -50%)' : 'none'
          }}
        />
        
        {/* Target Letter - Moved to bottom right */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Target</p>
            <p className="text-2xl font-bold text-blue-400">{targetLetter}</p>
          </div>
        </div>


        
        {/* Hand Status - Very compact top right */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-lg p-1 text-white">
          <div className="text-center">
            <p className="text-xs font-semibold">Status</p>
            <p className={`text-xs font-bold ${
              handState.isInCircle ? 'text-green-400' : 'text-red-400'
            }`}>
              {handState.isInCircle ? 'In Circle' : 'Not Detected'}
            </p>
            {handState.isInCircle && (
              <p className="text-xs text-gray-300">
                {handState.fingerCount} fingers
              </p>
            )}
          </div>
        </div>

        {/* Full Screen Button - Middle Right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={toggleFullScreen}
              className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-70 rounded-lg p-2 cursor-pointer"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
            <div className="bg-black bg-opacity-70 rounded-lg px-2 py-1 text-white text-xs font-semibold">
              {isFullScreen ? "Exit Full" : "Full Screen"}
            </div>
          </div>
        </div>

        {/* Simple Hand Tracking Legend - Only Green/Red */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded-lg p-2 text-white">
          <div className="text-xs">
            <p className="font-semibold mb-1">Finger States:</p>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Green + "O" = Open</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Red + "C" = Closed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hand Guide */}
        {!handState.isInCircle && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-40 h-40 border-2 border-dashed border-white rounded-full opacity-60 flex items-center justify-center bg-black bg-opacity-20">
                <span className="text-white text-sm font-bold text-center leading-tight">
                  Place hand<br />in circle
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Message */}
        {isInitializing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-black bg-opacity-70 rounded-lg p-4 text-white text-center max-w-sm">
                <p className="text-sm font-semibold mb-2">🔄 Initializing...</p>
                <p className="text-xs text-gray-300">
                  Setting up hand tracking...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-600 bg-opacity-90 rounded-lg p-4 text-white text-center max-w-sm">
                <p className="text-sm font-semibold mb-2">✅ Correct!</p>
                <p className="text-xs text-gray-100">
                  Moving to next letter...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Finger Guide - Moved to top-left, smaller to avoid blocking circle */}
        <div className="absolute top-2 left-2 w-40">
          <div className="bg-black bg-opacity-70 rounded-lg p-1 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">Guide: {targetLetter}</span>
              <span className="text-xs">
                {handState.isInCircle && handState.isStable 
                  ? `${Math.round(stableTime / 1000)}s / ${STABILITY_DURATION / 1000}s`
                  : '0s / 1s'
                }
              </span>
            </div>
            
            {/* Compact Finger Status Grid */}
            <div className="grid grid-cols-5 gap-1 mb-1">
              {Object.entries(targetFingerGuide).map(([finger, shouldBeOpen]) => (
                <div key={finger} className="text-center">
                  <div className={`text-xs font-medium ${
                    shouldBeOpen ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {finger.charAt(0).toUpperCase()}
                  </div>
                  <div className={`w-4 h-4 rounded-full mx-auto flex items-center justify-center text-xs ${
                    shouldBeOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {shouldBeOpen ? 'O' : 'C'}
                  </div>
                  {handState.fingerStates && (
                    <div className={`text-xs ${
                      handState.fingerStates[finger as keyof FingerGuide] === shouldBeOpen 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {handState.fingerStates[finger as keyof FingerGuide] ? 'O' : 'C'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Compact Stability Progress */}
            <div className="w-full bg-gray-600 rounded-full h-1 mb-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  isCorrectGesture(handState.fingerStates) ? 'bg-green-400' : 'bg-blue-400'
                }`}
                style={{ 
                  width: `${Math.min((stableTime / STABILITY_DURATION) * 100, 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="text-xs">
              {handState.isInCircle ? (
                <div className="space-y-0.5">
                  <p className={`font-medium ${
                    isCorrectGesture(handState.fingerStates) ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {isCorrectGesture(handState.fingerStates) 
                      ? `✅ Correct!` 
                      : `❌ Adjust`
                    }
                  </p>
                  <p className="text-gray-300">
                    {handState.isStable ? 'Keep steady!' : 'Hold position'}
                  </p>
                  {/* Compact Debug info */}
                  <p className="text-gray-400 text-xs">
                    Stable: {handState.isStable ? 'Yes' : 'No'} | 
                    {Math.round(stableTime / 100)}/10
                  </p>
                  {handState.fingerStates && (
                    <p className="text-gray-400 text-xs">
                      T:{handState.fingerStates.thumb ? 'O' : 'C'} 
                      I:{handState.fingerStates.index ? 'O' : 'C'} 
                      M:{handState.fingerStates.middle ? 'O' : 'C'} 
                      R:{handState.fingerStates.ring ? 'O' : 'C'} 
                      P:{handState.fingerStates.pinky ? 'O' : 'C'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">Place hand in circle</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-semibold text-blue-800 mb-2">💡 How it works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Place your hand in the center circle</li>
          <li>• Follow the finger guide below for letter "{targetLetter}"</li>
          <li>• Green circles = fingers should be OPEN</li>
          <li>• Red circles = fingers should be CLOSED</li>
          <li>• Keep it stable for {STABILITY_DURATION / 1000} seconds</li>
          <li>• System will automatically advance when correct</li>
        </ul>
      </div>

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