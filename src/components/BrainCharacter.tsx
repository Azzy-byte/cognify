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
      setTimeout(() => setBlinking(false), 150);
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
        <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">

          {/* === BRAIN SHAPE — bumpy cloud-like lobes === */}
          {/* Bottom center lobe */}
          <ellipse cx="100" cy="120" rx="38" ry="22" fill="hsl(12 60% 76%)" />
          {/* Left bottom lobe */}
          <ellipse cx="62" cy="110" rx="28" ry="24" fill="hsl(12 60% 76%)" />
          {/* Right bottom lobe */}
          <ellipse cx="138" cy="110" rx="28" ry="24" fill="hsl(12 60% 76%)" />
          {/* Left middle lobe */}
          <ellipse cx="48" cy="85" rx="26" ry="26" fill="hsl(12 58% 78%)" />
          {/* Right middle lobe */}
          <ellipse cx="152" cy="85" rx="26" ry="26" fill="hsl(12 58% 78%)" />
          {/* Left top lobe */}
          <ellipse cx="62" cy="58" rx="28" ry="24" fill="hsl(12 55% 80%)" />
          {/* Right top lobe */}
          <ellipse cx="138" cy="58" rx="28" ry="24" fill="hsl(12 55% 80%)" />
          {/* Top center lobe */}
          <ellipse cx="100" cy="46" rx="30" ry="22" fill="hsl(12 55% 80%)" />
          {/* Center fill */}
          <ellipse cx="100" cy="82" rx="44" ry="40" fill="hsl(12 58% 78%)" />

          {/* === BRAIN FOLDS (curved lines) === */}
          {/* Center vertical line */}
          <path d="M100 42 V78" stroke="hsl(12 45% 68%)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Left folds */}
          <path d="M58 52 C68 46, 82 48, 92 58" stroke="hsl(12 45% 68%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M44 76 C56 68, 72 68, 84 78" stroke="hsl(12 45% 68%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M50 100 C62 92, 74 92, 86 98" stroke="hsl(12 45% 68%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Right folds */}
          <path d="M142 52 C132 46, 118 48, 108 58" stroke="hsl(12 45% 68%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M156 76 C144 68, 128 68, 116 78" stroke="hsl(12 45% 68%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M150 100 C138 92, 126 92, 114 98" stroke="hsl(12 45% 68%)" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* === FACE === */}
          {/* Eyes */}
          <g style={{
            transform: `scaleY(${blinking ? 0.05 : 1})`,
            transformOrigin: '76px 88px',
            transition: 'transform 0.1s ease-in-out'
          }}>
            {/* Left eye white */}
            <ellipse cx="76" cy="88" rx="12" ry="13" fill="white" />
            {/* Left iris */}
            <circle cx="78" cy="90" r="7" fill="hsl(225 45% 28%)" />
            {/* Left pupil */}
            <circle cx="78" cy="90" r="4.5" fill="hsl(225 50% 18%)" />
            {/* Left eye shine */}
            <circle cx="82" cy="86" r="3" fill="white" />
            <circle cx="76" cy="93" r="1.5" fill="white" opacity="0.5" />
          </g>
          <g style={{
            transform: `scaleY(${blinking ? 0.05 : 1})`,
            transformOrigin: '124px 88px',
            transition: 'transform 0.1s ease-in-out'
          }}>
            {/* Right eye white */}
            <ellipse cx="124" cy="88" rx="12" ry="13" fill="white" />
            {/* Right iris */}
            <circle cx="126" cy="90" r="7" fill="hsl(225 45% 28%)" />
            {/* Right pupil */}
            <circle cx="126" cy="90" r="4.5" fill="hsl(225 50% 18%)" />
            {/* Right eye shine */}
            <circle cx="130" cy="86" r="3" fill="white" />
            <circle cx="124" cy="93" r="1.5" fill="white" opacity="0.5" />
          </g>

          {/* Eyebrows — gentle arcs */}
          <path d="M64 74 C70 68, 82 68, 88 74" stroke="hsl(225 35% 30%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M112 74 C118 68, 130 68, 136 74" stroke="hsl(225 35% 30%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Rosy cheek dots */}
          <ellipse cx="58" cy="104" rx="8" ry="5" fill="hsl(0 70% 72%)" opacity="0.45" />
          <ellipse cx="142" cy="104" rx="8" ry="5" fill="hsl(0 70% 72%)" opacity="0.45" />

          {/* Cute smile */}
          <path d="M88 108 C94 116, 106 116, 112 108" stroke="hsl(12 40% 45%)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* === LEGS === */}
          {/* Left leg */}
          <rect x="78" y="132" width="8" height="22" rx="4" fill="hsl(12 50% 62%)" />
          {/* Right leg */}
          <rect x="114" y="132" width="8" height="22" rx="4" fill="hsl(12 50% 62%)" />
          {/* Left foot */}
          <ellipse cx="80" cy="155" rx="8" ry="5" fill="hsl(12 50% 58%)" />
          {/* Right foot */}
          <ellipse cx="120" cy="155" rx="8" ry="5" fill="hsl(12 50% 58%)" />

          {/* === RIGHT ARM raised with lightbulb === */}
          {/* Arm */}
          <path d="M156 95 C162 88, 166 74, 160 60" stroke="hsl(12 50% 62%)" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Hand / pointer finger */}
          <circle cx="160" cy="58" r="4" fill="hsl(12 50% 62%)" />

          {/* Lightbulb */}
          <g>
            {/* Bulb glow */}
            <circle cx="164" cy="38" r="18" fill="hsl(45 90% 70%)" opacity="0.2" />
            {/* Bulb */}
            <circle cx="164" cy="38" r="12" fill="hsl(45 90% 65%)" />
            {/* Bulb highlight */}
            <circle cx="160" cy="34" r="4" fill="hsl(45 95% 80%)" opacity="0.6" />
            {/* Bulb base */}
            <rect x="159" y="48" width="10" height="6" rx="2" fill="hsl(230 10% 60%)" />
            {/* Filament */}
            <path d="M162 36 C163 32, 165 32, 166 36" stroke="hsl(230 10% 50%)" strokeWidth="1.2" fill="none" />
            {/* Rays */}
            <line x1="164" y1="20" x2="164" y2="16" stroke="hsl(45 85% 60%)" strokeWidth="2" strokeLinecap="round" />
            <line x1="176" y1="26" x2="180" y2="22" stroke="hsl(45 85% 60%)" strokeWidth="2" strokeLinecap="round" />
            <line x1="152" y1="26" x2="148" y2="22" stroke="hsl(45 85% 60%)" strokeWidth="2" strokeLinecap="round" />
            <line x1="180" y1="38" x2="184" y2="38" stroke="hsl(45 85% 60%)" strokeWidth="2" strokeLinecap="round" />
            <line x1="148" y1="38" x2="144" y2="38" stroke="hsl(45 85% 60%)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* === LEFT ARM (resting) === */}
          <path d="M44 100 C36 108, 34 118, 38 124" stroke="hsl(12 50% 62%)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="126" r="4" fill="hsl(12 50% 62%)" />

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
