'use client';

interface AlphabetGuideProps {
  currentLetter: string;
}

interface SignLanguageLetter {
  description: string;
  image: string;
  tips: string;
}

const signLanguageAlphabet: Record<string, SignLanguageLetter> = {
  A: {
    description: "Make a fist with your thumb on the side",
    image: "/signs/A.svg",
    tips: "Keep your fingers closed and thumb extended"
  },
  B: {
    description: "Hold your hand flat with fingers together",
    image: "/signs/B.svg",
    tips: "Palm facing forward, fingers straight"
  },
  C: {
    description: "Curve your fingers like a 'C' shape",
    image: "/signs/C.svg",
    tips: "Thumb and fingers form a curved shape"
  },
  D: {
    description: "Point your index finger up",
    image: "/signs/D.svg",
    tips: "Other fingers closed, thumb on side"
  },
  E: {
    description: "Make a fist with fingers curled",
    image: "/signs/E.svg",
    tips: "All fingers bent, thumb across palm"
  },
  F: {
    description: "Touch thumb to index and middle fingers",
    image: "/signs/F.svg",
    tips: "Ring and pinky fingers extended"
  },
  G: {
    description: "Point index finger to the side",
    image: "/signs/G.svg",
    tips: "Thumb and other fingers closed"
  },
  H: {
    description: "Point index and middle fingers to the side",
    image: "/signs/H.svg",
    tips: "Thumb and other fingers closed"
  },
  I: {
    description: "Point pinky finger up",
    image: "/signs/I.svg",
    tips: "Other fingers closed, thumb on side"
  },
  J: {
    description: "Point pinky finger and trace a 'J'",
    image: "/signs/J.svg",
    tips: "Move hand in a 'J' motion"
  },
  K: {
    description: "Point index and middle fingers up",
    image: "/signs/K.svg",
    tips: "Thumb between index and middle fingers"
  },
  L: {
    description: "Point index finger and thumb up",
    image: "/signs/L.svg",
    tips: "Other fingers closed"
  },
  M: {
    description: "Three fingers down on thumb",
    image: "/signs/M.svg",
    tips: "Index, middle, and ring fingers on thumb"
  },
  N: {
    description: "Two fingers down on thumb",
    image: "/signs/N.svg",
    tips: "Index and middle fingers on thumb"
  },
  O: {
    description: "Make a circle with all fingers",
    image: "/signs/O.svg",
    tips: "Fingers curved to form an 'O'"
  },
  P: {
    description: "Index finger pointing down",
    image: "/signs/P.svg",
    tips: "Middle finger extended down, others closed"
  },
  Q: {
    description: "Index finger pointing down and to the side",
    image: "/signs/Q.svg",
    tips: "Thumb and other fingers closed"
  },
  R: {
    description: "Cross index and middle fingers",
    image: "/signs/R.svg",
    tips: "Other fingers closed, thumb on side"
  },
  S: {
    description: "Make a fist with thumb over fingers",
    image: "/signs/S.svg",
    tips: "Thumb covering the top of your fist"
  },
  T: {
    description: "Make a fist with thumb between index and middle",
    image: "/signs/T.svg",
    tips: "Thumb sticking out between fingers"
  },
  U: {
    description: "Point index and middle fingers up together",
    image: "/signs/U.svg",
    tips: "Fingers together, other fingers closed"
  },
  V: {
    description: "Point index and middle fingers up in a 'V'",
    image: "/signs/V.svg",
    tips: "Fingers spread apart, other fingers closed"
  },
  W: {
    description: "Point index, middle, and ring fingers up",
    image: "/signs/W.svg",
    tips: "Three fingers spread, pinky and thumb closed"
  },
  X: {
    description: "Bend index finger",
    image: "/signs/X.svg",
    tips: "Other fingers closed, thumb on side"
  },
  Y: {
    description: "Point index and pinky fingers up",
    image: "/signs/Y.svg",
    tips: "Middle and ring fingers closed, thumb on side"
  },
  Z: {
    description: "Point index finger and trace a 'Z'",
    image: "/signs/Z.svg",
    tips: "Move hand in a 'Z' motion"
  }
};

export default function AlphabetGuide({ currentLetter }: AlphabetGuideProps) {
  const currentSign = signLanguageAlphabet[currentLetter];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Sign Language Alphabet
      </h2>
      
      {currentSign && (
        <CurrentLetterCard letter={currentLetter} sign={currentSign} />
      )}

      <AlphabetGrid currentLetter={currentLetter} />
    </div>
  );
}

interface CurrentLetterCardProps {
  letter: string;
  sign: SignLanguageLetter;
}

function CurrentLetterCard({ letter, sign }: CurrentLetterCardProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-blue-800 mb-3">
        Current Letter: {letter}
      </h3>
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center">
          <img 
            src={sign.image} 
            alt={`Sign language for letter ${letter}`}
            className="w-20 h-20 object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="text-gray-700 mb-2">
            <strong>How to sign:</strong> {sign.description}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> {sign.tips}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AlphabetGridProps {
  currentLetter: string;
}

function AlphabetGrid({ currentLetter }: AlphabetGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(signLanguageAlphabet).map(([letter, sign]) => (
        <div
          key={letter}
          className={`p-3 rounded-lg border-2 text-center transition-colors ${
            letter === currentLetter
              ? 'border-blue-500 bg-blue-100'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <div className="text-lg font-bold text-gray-800 mb-1">
            {letter}
          </div>
          <div className="w-12 h-12 mx-auto bg-white rounded border flex items-center justify-center">
            <img 
              src={sign.image} 
              alt={`Sign language for letter ${letter}`}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {sign.description.split(' ').slice(0, 3).join(' ')}...
          </div>
        </div>
      ))}
    </div>
  );
}

 