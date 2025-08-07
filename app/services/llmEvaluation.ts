// LLM-based Hand Gesture Evaluation Service
// Uses AI to determine if hand gestures match target ASL letters

export interface HandGestureData {
  landmarks: Array<{ x: number; y: number; z: number }> | any; // Support both raw landmarks and finger states
  targetLetter: string;
  detectedLetter?: string;
  confidence?: number;
  isStable?: boolean;
  stabilityScore?: number;
  fingerStates?: {
    thumb: { extended: boolean; angle: number };
    index: { extended: boolean; angle: number };
    middle: { extended: boolean; angle: number };
    ring: { extended: boolean; angle: number };
    pinky: { extended: boolean; angle: number };
  };
  handOrientation?: string;
}

export interface LLMEvaluationResult {
  isCorrect: boolean;
  confidence: number;
  feedback: string[];
  reasoning: string;
  suggestedImprovements: string[];
}

// Enhanced LLM evaluation for better gesture recognition
export async function evaluateHandGesture(data: HandGestureData): Promise<LLMEvaluationResult> {
  try {
    // Create a comprehensive prompt for the LLM to evaluate the hand gesture
    const prompt = createEvaluationPrompt(data);
    
    // Use enhanced mock evaluation with better accuracy
    const result = await enhancedMockLLMEvaluation(data);
    
    return result;
  } catch (error) {
    console.error('LLM evaluation error:', error);
    return {
      isCorrect: false,
      confidence: 0,
      feedback: ['Unable to evaluate gesture'],
      reasoning: 'Evaluation failed',
      suggestedImprovements: ['Try again with better hand positioning']
    };
  }
}

function createEvaluationPrompt(data: HandGestureData): string {
  const { targetLetter, detectedLetter, confidence, isStable, stabilityScore, fingerStates, handOrientation } = data;
  
  let fingerAnalysis = '';
  if (fingerStates) {
    fingerAnalysis = `
Finger States Analysis:
- Thumb: ${fingerStates.thumb.extended ? 'Extended' : 'Closed'} (angle: ${fingerStates.thumb.angle.toFixed(2)})
- Index: ${fingerStates.index.extended ? 'Extended' : 'Closed'} (angle: ${fingerStates.index.angle.toFixed(2)})
- Middle: ${fingerStates.middle.extended ? 'Extended' : 'Closed'} (angle: ${fingerStates.middle.angle.toFixed(2)})
- Ring: ${fingerStates.ring.extended ? 'Extended' : 'Closed'} (angle: ${fingerStates.ring.angle.toFixed(2)})
- Pinky: ${fingerStates.pinky.extended ? 'Extended' : 'Closed'} (angle: ${fingerStates.pinky.angle.toFixed(2)})
`;
  }
  
  return `You are an expert in American Sign Language (ASL) and computer vision analysis. 

Task: Evaluate if a hand gesture matches the target ASL letter "${targetLetter}".

Target Letter: ${targetLetter}
Detected Letter: ${detectedLetter || 'None'}
Detection Confidence: ${confidence || 0}
Hand Stability: ${isStable ? 'Stable' : 'Unstable'} (${Math.round((stabilityScore || 0) * 100)}%)
Hand Orientation: ${handOrientation || 'Unknown'}
${fingerAnalysis}

Please analyze this hand gesture and determine:
1. Is this the correct ASL sign for letter "${targetLetter}"?
2. What is your confidence level (0-1)?
3. What specific feedback would you give to improve the gesture?
4. What reasoning led to your conclusion?

Consider:
- Finger positions and extensions
- Hand orientation and palm direction
- Thumb placement and angle
- Overall hand shape and form
- Standard ASL finger spelling rules
- Hand stability and consistency

Respond in JSON format:
{
  "isCorrect": boolean,
  "confidence": number (0-1),
  "feedback": ["specific improvement suggestions"],
  "reasoning": "detailed explanation",
  "suggestedImprovements": ["actionable tips"]
}`;
}

async function enhancedMockLLMEvaluation(data: HandGestureData): Promise<LLMEvaluationResult> {
  const { targetLetter, detectedLetter, confidence, isStable, stabilityScore, fingerStates, handOrientation } = data;
  
  // Simulate LLM processing time
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Enhanced analysis using finger states if available
  let fingerAnalysis;
  if (fingerStates) {
    fingerAnalysis = analyzeFingerStates(fingerStates);
  } else {
    // Fallback to landmark analysis
    fingerAnalysis = analyzeFingerPositions(data.landmarks as Array<{ x: number; y: number; z: number }>);
  }
  
  // Get expected ASL pattern for target letter
  const expectedPattern = getExpectedASLPattern(targetLetter);
  
  // Enhanced matching with better accuracy
  const matchScore = compareWithExpectedPattern(fingerAnalysis, expectedPattern);
  
  // Generate comprehensive feedback
  const feedback = generateEnhancedFeedback(fingerAnalysis, expectedPattern, targetLetter, handOrientation);
  
  // Consider hand stability and orientation in evaluation
  let finalScore = matchScore;
  let stabilityBonus = 0;
  let orientationBonus = 0;
  
  // Add stability bonus
  if (isStable && stabilityScore && stabilityScore > 0.8) {
    stabilityBonus = 0.15; // 15% bonus for very stable hand
  } else if (isStable && stabilityScore && stabilityScore > 0.6) {
    stabilityBonus = 0.1; // 10% bonus for stable hand
  }
  
  // Add orientation bonus if hand is properly oriented
  if (handOrientation === 'up' || handOrientation === 'right') {
    orientationBonus = 0.05; // 5% bonus for good orientation
  }
  
  finalScore = Math.min(matchScore + stabilityBonus + orientationBonus, 1.0);
  
  // More lenient threshold - consider 65% match as correct
  const isCorrect = finalScore > 0.65;
  
  // Enhanced reasoning
  let reasoning = feedback.reasoning;
  if (isStable && stabilityScore) {
    reasoning += ` Hand is ${stabilityScore > 0.8 ? 'very stable' : 'stable'} (${Math.round(stabilityScore * 100)}% stability).`;
  } else if (isStable === false) {
    reasoning += " Hand movement detected - try to hold still.";
  }
  
  if (handOrientation) {
    reasoning += ` Hand orientation is ${handOrientation}.`;
  }
  
  return {
    isCorrect,
    confidence: finalScore,
    feedback: feedback.suggestions,
    reasoning,
    suggestedImprovements: feedback.improvements
  };
}

interface FingerAnalysis {
  thumb: { extended: boolean; position: string };
  index: { extended: boolean; position: string };
  middle: { extended: boolean; position: string };
  ring: { extended: boolean; position: string };
  pinky: { extended: boolean; position: string };
}

// Enhanced finger state analysis
function analyzeFingerStates(fingerStates: any): FingerAnalysis {
  return {
    thumb: { extended: fingerStates.thumb.extended, position: fingerStates.thumb.extended ? 'extended' : 'closed' },
    index: { extended: fingerStates.index.extended, position: fingerStates.index.extended ? 'extended' : 'closed' },
    middle: { extended: fingerStates.middle.extended, position: fingerStates.middle.extended ? 'extended' : 'closed' },
    ring: { extended: fingerStates.ring.extended, position: fingerStates.ring.extended ? 'extended' : 'closed' },
    pinky: { extended: fingerStates.pinky.extended, position: fingerStates.pinky.extended ? 'extended' : 'closed' }
  };
}

function analyzeFingerPositions(landmarks: Array<{ x: number; y: number; z: number }>): FingerAnalysis {
  // Analyze each finger based on landmark positions
  const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
  const fingerBases = [2, 5, 9, 13, 17];
  const fingerMids = [3, 6, 10, 14, 18];
  
  const analysis: FingerAnalysis = {
    thumb: { extended: false, position: 'unknown' },
    index: { extended: false, position: 'unknown' },
    middle: { extended: false, position: 'unknown' },
    ring: { extended: false, position: 'unknown' },
    pinky: { extended: false, position: 'unknown' }
  };
  
  const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
  
  fingerNames.forEach((finger, index) => {
    const tip = landmarks[fingerTips[index]];
    const base = landmarks[fingerBases[index]];
    const mid = landmarks[fingerMids[index]];
    
    // Calculate 3D distance
    const tipToBase = Math.sqrt(
      Math.pow(tip.x - base.x, 2) + 
      Math.pow(tip.y - base.y, 2) + 
      Math.pow(tip.z - base.z, 2)
    );
    
    const midToBase = Math.sqrt(
      Math.pow(mid.x - base.x, 2) + 
      Math.pow(mid.y - base.y, 2) + 
      Math.pow(mid.z - base.z, 2)
    );
    
    const isExtended = tipToBase > midToBase * 1.2;
    const position = isExtended ? 'extended' : 'closed';
    
    analysis[finger] = { extended: isExtended, position };
  });
  
  return analysis;
}

interface ASLPattern {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
  description: string;
  tips: string[];
}

function getExpectedASLPattern(letter: string): ASLPattern {
  const patterns: Record<string, ASLPattern> = {
    'A': { 
      thumb: true, index: false, middle: false, ring: false, pinky: false, 
      description: 'Thumb out, fingers closed', 
      tips: ['Make a fist with your fingers', 'Extend your thumb outward', 'Keep other fingers curled']
    },
    'B': { 
      thumb: false, index: true, middle: true, ring: true, pinky: true, 
      description: 'All fingers extended, thumb closed', 
      tips: ['Extend all four fingers straight up', 'Keep your thumb tucked in', 'Palm facing forward']
    },
    'C': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'Curved fingers', 
      tips: ['Curve your fingers naturally', 'Keep thumb close to palm', 'Form a gentle curve']
    },
    'D': { 
      thumb: false, index: true, middle: false, ring: false, pinky: false, 
      description: 'Index finger only', 
      tips: ['Point with your index finger', 'Keep other fingers closed', 'Thumb can be extended or closed']
    },
    'E': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'All fingers closed', 
      tips: ['Make a tight fist', 'All fingers curled', 'Thumb can be inside or outside']
    },
    'F': { 
      thumb: true, index: true, middle: true, ring: false, pinky: false, 
      description: 'Thumb + Index + Middle', 
      tips: ['Extend thumb, index, and middle fingers', 'Keep ring and pinky closed', 'Form a three-finger salute']
    },
    'G': { 
      thumb: false, index: true, middle: false, ring: false, pinky: false, 
      description: 'Index finger only', 
      tips: ['Point with index finger', 'Keep other fingers closed', 'Thumb can be extended or closed']
    },
    'H': { 
      thumb: false, index: true, middle: true, ring: false, pinky: false, 
      description: 'Index + Middle', 
      tips: ['Extend index and middle fingers', 'Keep other fingers closed', 'Form a peace sign']
    },
    'I': { 
      thumb: false, index: false, middle: false, ring: false, pinky: true, 
      description: 'Pinky only', 
      tips: ['Extend only your pinky finger', 'Keep other fingers closed', 'Thumb can be extended or closed']
    },
    'J': { 
      thumb: false, index: false, middle: false, ring: false, pinky: true, 
      description: 'Pinky only', 
      tips: ['Extend only your pinky finger', 'Keep other fingers closed', 'Add a small motion']
    },
    'K': { 
      thumb: false, index: true, middle: true, ring: false, pinky: false, 
      description: 'Index + Middle', 
      tips: ['Extend index and middle fingers', 'Keep other fingers closed', 'Form a V shape']
    },
    'L': { 
      thumb: true, index: true, middle: false, ring: false, pinky: false, 
      description: 'Thumb + Index', 
      tips: ['Extend thumb and index finger', 'Keep other fingers closed', 'Form an L shape']
    },
    'M': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'Three fingers on thumb', 
      tips: ['Place three fingers on your thumb', 'Keep pinky extended', 'Form a specific hand shape']
    },
    'N': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'Two fingers on thumb', 
      tips: ['Place two fingers on your thumb', 'Keep other fingers extended', 'Form a specific hand shape']
    },
    'O': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'Curved fingers', 
      tips: ['Curve all fingers naturally', 'Form a circle or oval shape', 'Keep thumb close to palm']
    },
    'P': { 
      thumb: false, index: false, middle: true, ring: false, pinky: false, 
      description: 'Middle finger only', 
      tips: ['Extend only your middle finger', 'Keep other fingers closed', 'Thumb can be extended or closed']
    },
    'Q': { 
      thumb: false, index: true, middle: false, ring: false, pinky: false, 
      description: 'Index finger only', 
      tips: ['Point with your index finger', 'Keep other fingers closed', 'Point downward']
    },
    'R': { 
      thumb: false, index: true, middle: true, ring: false, pinky: false, 
      description: 'Index + Middle', 
      tips: ['Extend index and middle fingers', 'Cross them slightly', 'Keep other fingers closed']
    },
    'S': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'Fist', 
      tips: ['Make a tight fist', 'All fingers curled', 'Thumb can be inside or outside']
    },
    'T': { 
      thumb: false, index: false, middle: false, ring: false, pinky: false, 
      description: 'Thumb between fingers', 
      tips: ['Place thumb between index and middle', 'Keep other fingers closed', 'Form a specific hand shape']
    },
    'U': { 
      thumb: false, index: true, middle: true, ring: false, pinky: false, 
      description: 'Index + Middle together', 
      tips: ['Extend index and middle fingers', 'Keep them close together', 'Keep other fingers closed']
    },
    'V': { 
      thumb: false, index: true, middle: true, ring: false, pinky: false, 
      description: 'Index + Middle apart', 
      tips: ['Extend index and middle fingers', 'Spread them apart', 'Keep other fingers closed']
    },
    'W': { 
      thumb: false, index: true, middle: true, ring: true, pinky: false, 
      description: 'Index + Middle + Ring', 
      tips: ['Extend index, middle, and ring fingers', 'Keep thumb and pinky closed', 'Form a three-finger salute']
    },
    'X': { 
      thumb: false, index: true, middle: false, ring: false, pinky: false, 
      description: 'Index bent', 
      tips: ['Bend your index finger', 'Keep other fingers closed', 'Form a hook shape']
    },
    'Y': { 
      thumb: true, index: false, middle: false, ring: false, pinky: true, 
      description: 'Thumb + Pinky', 
      tips: ['Extend thumb and pinky', 'Keep middle fingers closed', 'Form a Y shape']
    },
    'Z': { 
      thumb: false, index: true, middle: false, ring: false, pinky: false, 
      description: 'Index finger only', 
      tips: ['Point with your index finger', 'Keep other fingers closed', 'Add a Z motion']
    }
  };
  
  return patterns[letter.toUpperCase()] || patterns['A'];
}

function compareWithExpectedPattern(analysis: FingerAnalysis, expected: ASLPattern): number {
  let correctMatches = 0;
  const totalFingers = 5;
  
  const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
  
  fingers.forEach(finger => {
    const actual = analysis[finger].extended;
    const expectedExtended = expected[finger];
    
    if (actual === expectedExtended) {
      correctMatches++;
    }
  });
  
  // Enhanced scoring with bonus points for close matches
  const baseScore = correctMatches / totalFingers;
  
  // Add bonus points for high accuracy
  if (correctMatches >= 4) {
    return Math.min(baseScore + 0.25, 1.0); // Add up to 0.25 bonus
  } else if (correctMatches >= 3) {
    return Math.min(baseScore + 0.15, 1.0); // Add up to 0.15 bonus
  }
  
  return baseScore;
}

interface FeedbackResult {
  suggestions: string[];
  reasoning: string;
  improvements: string[];
}

function generateEnhancedFeedback(analysis: FingerAnalysis, expected: ASLPattern, targetLetter: string, handOrientation?: string): FeedbackResult {
  const suggestions: string[] = [];
  const improvements: string[] = [];
  let reasoning = `Analyzing hand gesture for letter ${targetLetter}. `;
  
  const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
  const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
  
  let correctFingers = 0;
  let totalFingers = 0;
  
  fingers.forEach((finger, index) => {
    const actual = analysis[finger].extended;
    const expectedExtended = expected[finger];
    const fingerName = fingerNames[index];
    
    if (actual === expectedExtended) {
      correctFingers++;
      reasoning += `${fingerName} is correctly ${actual ? 'extended' : 'closed'}. `;
    } else {
      if (expectedExtended && !actual) {
        suggestions.push(`Extend your ${fingerName} finger`);
        improvements.push(expected.tips[index] || `Make sure your ${fingerName} finger is pointing up`);
      } else if (!expectedExtended && actual) {
        suggestions.push(`Close your ${fingerName} finger`);
        improvements.push(`Bend your ${fingerName} finger down`);
      }
      reasoning += `${fingerName} should be ${expectedExtended ? 'extended' : 'closed'} but is ${actual ? 'extended' : 'closed'}. `;
    }
    totalFingers++;
  });
  
  const accuracy = correctFingers / totalFingers;
  
  if (accuracy >= 0.8) {
    reasoning += "Overall, this is an excellent attempt at the sign.";
  } else if (accuracy >= 0.6) {
    reasoning += "This is close but needs some adjustments.";
  } else {
    reasoning += "This needs significant improvement to match the target sign.";
  }
  
  // Add orientation feedback
  if (handOrientation) {
    if (handOrientation === 'up' || handOrientation === 'right') {
      reasoning += " Hand orientation looks good.";
    } else {
      suggestions.push("Rotate your hand to face the camera");
      improvements.push("Make sure your palm is visible to the camera");
    }
  }
  
  return {
    suggestions,
    reasoning,
    improvements
  };
}

// Real LLM integration (commented out for development)
export async function callRealLLM(prompt: string): Promise<any> {
  // This would be the actual API call to an LLM service
  // Example with OpenAI:
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in American Sign Language and computer vision analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
  */
  
  throw new Error('Real LLM integration not implemented');
} 