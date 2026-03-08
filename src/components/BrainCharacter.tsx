import { useState, useEffect } from 'react';

interface BrainCharacterProps {
  greeting?: string;
  userName?: string;
}

const BrainCharacter = ({ greeting, userName }: BrainCharacterProps) => {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
    };
    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.6) setTimeout(blink, 250);
    }, 3000 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="brain-sway" aria-hidden="true">
        <svg width="160" height="150" viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg">

          {/* === BRAIN SHAPE === */}
          {/* Main brain blob — two hemispheres merged */}
          {/* Left hemisphere */}
          <path
            d="M80 30 C60 12, 24 18, 18 42 C12 62, 18 78, 28 90 C22 100, 24 114, 36 122 C44 130, 58 132, 72 128 L80 126"
            fill="hsl(340 65% 82%)"
          />
          {/* Right hemisphere */}
          <path
            d="M80 30 C100 12, 136 18, 142 42 C148 62, 142 78, 132 90 C138 100, 136 114, 124 122 C116 130, 102 132, 88 128 L80 126"
            fill="hsl(340 62% 80%)"
          />
          {/* Center overlap blend */}
          <ellipse cx="80" cy="80" rx="16" ry="48" fill="hsl(340 64% 81%)" />

          {/* Brain folds — left side */}
          <path d="M34 48 C44 40, 58 42, 66 52" stroke="hsl(340 48% 72%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M26 66 C36 58, 52 56, 62 66" stroke="hsl(340 48% 72%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M28 86 C38 78, 50 78, 58 84" stroke="hsl(340 48% 72%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M36 104 C44 96, 56 96, 64 102" stroke="hsl(340 48% 72%)" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Brain folds — right side */}
          <path d="M126 48 C116 40, 102 42, 94 52" stroke="hsl(340 48% 72%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M134 66 C124 58, 108 56, 98 66" stroke="hsl(340 48% 72%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M132 86 C122 78, 110 78, 102 84" stroke="hsl(340 48% 72%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M124 104 C116 96, 104 96, 96 102" stroke="hsl(340 48% 72%)" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Center dividing line */}
          <path d="M80 24 V68" stroke="hsl(340 48% 72%)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Top highlight / shine */}
          <ellipse cx="60" cy="36" rx="18" ry="10" fill="hsl(340 72% 90%)" opacity="0.5" />
          <ellipse cx="56" cy="33" rx="8" ry="4" fill="white" opacity="0.2" />

          {/* === FACE === */}
          {/* Eyes */}
          <g style={{
            transform: `scaleY(${blinking ? 0.05 : 1})`,
            transformOrigin: '58px 82px',
            transition: 'transform 0.1s ease-in-out'
          }}>
            <ellipse cx="58" cy="82" rx="9" ry="10" fill="white" />
            <circle cx="60" cy="84" r="5.5" fill="hsl(232 50% 32%)" />
            <circle cx="62" cy="81" r="2.5" fill="white" />
            <circle cx="58" cy="87" r="1.2" fill="white" opacity="0.6" />
          </g>
          <g style={{
            transform: `scaleY(${blinking ? 0.05 : 1})`,
            transformOrigin: '102px 82px',
            transition: 'transform 0.1s ease-in-out'
          }}>
            <ellipse cx="102" cy="82" rx="9" ry="10" fill="white" />
            <circle cx="104" cy="84" r="5.5" fill="hsl(232 50% 32%)" />
            <circle cx="106" cy="81" r="2.5" fill="white" />
            <circle cx="102" cy="87" r="1.2" fill="white" opacity="0.6" />
          </g>

          {/* Rosy cheeks */}
          <ellipse cx="42" cy="96" rx="8" ry="5" fill="hsl(350 85% 78%)" opacity="0.35" />
          <ellipse cx="118" cy="96" rx="8" ry="5" fill="hsl(350 85% 78%)" opacity="0.35" />

          {/* Tiny nose */}
          <ellipse cx="80" cy="94" rx="2.5" ry="2" fill="hsl(350 65% 72%)" />

          {/* Happy smile — w shape (cat mouth) */}
          <path d="M70 102 C74 108, 78 109, 80 104" stroke="hsl(340 40% 50%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M90 102 C86 108, 82 109, 80 104" stroke="hsl(340 40% 50%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Sparkles */}
          <g opacity="0.6">
            <path d="M142 28L144 22L146 28L152 30L146 32L144 38L142 32L136 30Z" fill="hsl(45 90% 68%)" />
            <path d="M14 44L16 40L18 44L22 46L18 48L16 52L14 48L10 46Z" fill="hsl(45 90% 68%)" />
            <circle cx="148" cy="50" r="1.5" fill="hsl(45 85% 70%)" opacity="0.5" />
          </g>
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1 text-foreground">
          {greeting || `Hello${userName ? `, ${userName}` : ''} 👋`}
        </h2>
        <p className="text-muted-foreground">I'm Cognify, your AI companion. Ask me anything!</p>
      </div>
    </div>
  );
};

export default BrainCharacter;
