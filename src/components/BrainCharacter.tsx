import { useState, useEffect } from 'react';

interface BrainCharacterProps {
  greeting?: string;
  userName?: string;
}

const BrainCharacter = ({ greeting, userName }: BrainCharacterProps) => {
  const [blinking, setBlinking] = useState(false);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };

    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.6) {
        setTimeout(blink, 250);
      }
    }, 2800 + Math.random() * 1500);

    return () => clearInterval(interval);
  }, []);

  // Periodic wave
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaving(true);
      setTimeout(() => setWaving(false), 800);
    }, 6000);
    return () => clearInterval(waveInterval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="brain-sway" aria-hidden="true">
        <svg width="180" height="200" viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          
          {/* Ground shadow */}
          <ellipse cx="90" cy="192" rx="35" ry="5" fill="hsl(340 20% 60%)" opacity="0.15" />

          {/* --- LEGS --- */}
          {/* Left leg */}
          <rect x="62" y="155" width="18" height="24" rx="9" fill="hsl(345 72% 80%)" />
          {/* Right leg */}
          <rect x="100" y="155" width="18" height="24" rx="9" fill="hsl(345 72% 80%)" />
          
          {/* Left foot - rounded cute shoe */}
          <ellipse cx="71" cy="180" rx="13" ry="9" fill="hsl(345 60% 74%)" />
          <ellipse cx="68" cy="178" rx="4" ry="3" fill="hsl(345 65% 80%)" opacity="0.5" />
          {/* Right foot */}
          <ellipse cx="109" cy="180" rx="13" ry="9" fill="hsl(345 60% 74%)" />
          <ellipse cx="106" cy="178" rx="4" ry="3" fill="hsl(345 65% 80%)" opacity="0.5" />

          {/* --- BODY (round tummy) --- */}
          <ellipse cx="90" cy="140" rx="38" ry="28" fill="hsl(340 68% 84%)" />
          {/* Tummy highlight */}
          <ellipse cx="86" cy="134" rx="18" ry="12" fill="hsl(340 70% 89%)" opacity="0.5" />

          {/* --- LEFT ARM --- */}
          <g>
            <path 
              d="M52 130 C42 132, 32 140, 34 150 C35 154, 40 156, 42 152 L52 138" 
              fill="hsl(345 72% 82%)" 
              stroke="hsl(340 55% 75%)" 
              strokeWidth="1" 
            />
            {/* Left hand - round mitten */}
            <circle cx="37" cy="151" r="8" fill="hsl(345 72% 84%)" />
            {/* Thumb */}
            <circle cx="31" cy="147" r="4" fill="hsl(345 72% 86%)" />
            {/* Hand shine */}
            <circle cx="35" cy="148" r="2" fill="hsl(345 75% 90%)" opacity="0.5" />
          </g>

          {/* --- RIGHT ARM (waving) --- */}
          <g style={{ 
            transform: waving ? 'rotate(-15deg)' : 'rotate(0deg)', 
            transformOrigin: '128px 130px',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          }}>
            <path 
              d="M128 130 C138 128, 150 122, 152 132 C153 136, 148 140, 144 138 L128 138" 
              fill="hsl(345 72% 82%)" 
              stroke="hsl(340 55% 75%)" 
              strokeWidth="1" 
            />
            {/* Right hand - round mitten */}
            <circle cx="150" cy="128" r="8" fill="hsl(345 72% 84%)" />
            {/* Thumb */}
            <circle cx="156" cy="124" r="4" fill="hsl(345 72% 86%)" />
            {/* Hand shine */}
            <circle cx="148" cy="125" r="2" fill="hsl(345 75% 90%)" opacity="0.5" />
          </g>

          {/* --- BRAIN HEAD (main shape - rounder, cuter) --- */}
          <path
            d="M90 18 C112 8 140 14 152 30 C166 32 176 44 174 58 C174 64 172 68 168 72 C174 82 172 96 164 104 C162 118 152 128 138 130 L42 130 C28 128 18 118 16 104 C8 96 6 82 12 72 C8 68 6 64 6 58 C6 44 14 32 28 30 C40 14 68 8 90 18Z"
            fill="hsl(340 68% 85%)"
          />

          {/* Brain top highlight (glossy) */}
          <ellipse cx="78" cy="38" rx="28" ry="14" fill="hsl(340 72% 92%)" opacity="0.6" />
          <ellipse cx="72" cy="34" rx="12" ry="6" fill="white" opacity="0.2" />

          {/* Brain folds - softer, fewer */}
          <path d="M90 26V62" stroke="hsl(340 50% 76%)" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 34C78 26 88 26 90 36" stroke="hsl(340 50% 76%)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M112 34C102 26 92 26 90 36" stroke="hsl(340 50% 76%)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M56 50C66 44 78 47 82 54" stroke="hsl(340 50% 76%)" strokeWidth="2" strokeLinecap="round" />
          <path d="M124 50C114 44 102 47 98 54" stroke="hsl(340 50% 76%)" strokeWidth="2" strokeLinecap="round" />

          {/* --- EYES --- */}
          {/* Left eye */}
          <g style={{ 
            transform: `scaleY(${blinking ? 0.08 : 1})`, 
            transformOrigin: '68px 88px', 
            transition: 'transform 0.08s ease-in-out' 
          }}>
            <ellipse cx="68" cy="88" rx="13" ry="14" fill="white" />
            <ellipse cx="68" cy="88" rx="11" ry="12" fill="white" stroke="hsl(340 30% 85%)" strokeWidth="0.5" />
            <circle cx="71" cy="90" r="7.5" fill="hsl(232 50% 35%)" />
            <circle cx="71" cy="90" r="5" fill="hsl(232 55% 25%)" />
            {/* Eye sparkle */}
            <circle cx="74" cy="86" r="3" fill="white" />
            <circle cx="69" cy="93" r="1.5" fill="white" opacity="0.7" />
          </g>
          {/* Right eye */}
          <g style={{ 
            transform: `scaleY(${blinking ? 0.08 : 1})`, 
            transformOrigin: '112px 88px', 
            transition: 'transform 0.08s ease-in-out' 
          }}>
            <ellipse cx="112" cy="88" rx="13" ry="14" fill="white" />
            <ellipse cx="112" cy="88" rx="11" ry="12" fill="white" stroke="hsl(340 30% 85%)" strokeWidth="0.5" />
            <circle cx="115" cy="90" r="7.5" fill="hsl(232 50% 35%)" />
            <circle cx="115" cy="90" r="5" fill="hsl(232 55% 25%)" />
            {/* Eye sparkle */}
            <circle cx="118" cy="86" r="3" fill="white" />
            <circle cx="113" cy="93" r="1.5" fill="white" opacity="0.7" />
          </g>

          {/* Tiny eyebrows - soft arcs */}
          <path d="M56 74C62 70 74 70 80 74" stroke="hsl(340 40% 65%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M100 74C106 70 118 70 124 74" stroke="hsl(340 40% 65%)" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* --- NOSE (tiny dot) --- */}
          <ellipse cx="90" cy="103" rx="3.5" ry="3" fill="hsl(350 70% 74%)" />
          <circle cx="88.5" cy="102" r="1.2" fill="hsl(350 75% 80%)" opacity="0.6" />

          {/* --- MOUTH (happy cat smile) --- */}
          <path d="M80 110 C85 116, 90 118, 90 112" stroke="hsl(340 45% 55%)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M100 110 C95 116, 90 118, 90 112" stroke="hsl(340 45% 55%)" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* --- BLUSH CHEEKS --- */}
          <ellipse cx="50" cy="104" rx="10" ry="6" fill="hsl(350 85% 80%)" opacity="0.35" />
          <ellipse cx="130" cy="104" rx="10" ry="6" fill="hsl(350 85% 80%)" opacity="0.35" />

          {/* --- SPARKLES --- */}
          <g opacity="0.7">
            <path d="M158 40L160 34L162 40L168 42L162 44L160 50L158 44L152 42Z" fill="hsl(45 90% 70%)" />
            <path d="M18 52L20 48L22 52L26 54L22 56L20 60L18 56L14 54Z" fill="hsl(45 90% 70%)" />
            <circle cx="155" cy="65" r="2" fill="hsl(45 85% 72%)" opacity="0.5" />
            <circle cx="22" cy="40" r="1.5" fill="hsl(45 85% 72%)" opacity="0.5" />
          </g>

          {/* Tiny heart on cheek */}
          <path d="M138 96 C138 94, 140 93, 141 94.5 C142 93, 144 94, 144 96 C144 98, 141 100, 141 100 C141 100, 138 98, 138 96Z" fill="hsl(350 80% 75%)" opacity="0.5" />
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
