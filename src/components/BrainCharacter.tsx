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
      setTimeout(() => setBlinking(false), 120);
    };

    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.7) {
        setTimeout(blink, 200);
      }
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  const eyeScaleY = blinking ? 0.12 : 1;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="brain-sway" aria-hidden="true">
        <svg width="200" height="220" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="100" cy="210" rx="40" ry="6" fill="hsl(340 20% 70%)" opacity="0.2" />

          {/* Left leg */}
          <rect x="72" y="172" width="16" height="28" rx="8" fill="hsl(350 80% 82%)" />
          {/* Right leg */}
          <rect x="112" y="172" width="16" height="28" rx="8" fill="hsl(350 80% 82%)" />
          {/* Left shoe */}
          <ellipse cx="78" cy="200" rx="14" ry="8" fill="hsl(350 70% 76%)" />
          {/* Right shoe */}
          <ellipse cx="122" cy="200" rx="14" ry="8" fill="hsl(350 70% 76%)" />

          {/* Body / lower brain */}
          <ellipse cx="100" cy="150" rx="42" ry="32" fill="hsl(340 65% 82%)" />

          {/* Left arm */}
          <path d="M58 140 C48 145, 38 155, 42 168 C44 174, 50 175, 52 170 C54 164, 52 158, 58 148" fill="hsl(350 80% 82%)" stroke="hsl(340 60% 72%)" strokeWidth="1.5" />
          {/* Left hand (open palm) */}
          <circle cx="47" cy="168" r="7" fill="hsl(350 80% 84%)" />
          <circle cx="42" cy="164" r="3" fill="hsl(350 80% 86%)" />
          <circle cx="44" cy="160" r="2.5" fill="hsl(350 80% 86%)" />

          {/* Right arm */}
          <path d="M142 140 C152 145, 162 155, 158 168 C156 174, 150 175, 148 170 C146 164, 148 158, 142 148" fill="hsl(350 80% 82%)" stroke="hsl(340 60% 72%)" strokeWidth="1.5" />
          {/* Right hand waving */}
          <circle cx="153" cy="168" r="7" fill="hsl(350 80% 84%)" />
          <circle cx="158" cy="164" r="3" fill="hsl(350 80% 86%)" />
          <circle cx="156" cy="160" r="2.5" fill="hsl(350 80% 86%)" />

          {/* Brain blob (head) */}
          <path
            d="M100 22C122 10 148 16 160 34C176 36 188 50 186 66C186 72 184 78 180 82C188 94 186 110 176 120C174 136 162 148 146 150H54C38 148 26 136 24 120C14 110 12 94 20 82C16 78 14 72 14 66C14 50 24 36 40 34C52 16 78 10 100 22Z"
            fill="hsl(340 68% 84%)"
          />

          {/* Brain highlight (shiny top) */}
          <ellipse cx="85" cy="45" rx="22" ry="12" fill="hsl(340 70% 90%)" opacity="0.5" />

          {/* Brain folds */}
          <path d="M100 30V75" stroke="hsl(340 55% 72%)" strokeWidth="4" strokeLinecap="round" />
          <path d="M75 38C85 28 95 28 100 40" stroke="hsl(340 55% 72%)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M125 38C115 28 105 28 100 40" stroke="hsl(340 55% 72%)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M65 55C75 48 88 52 92 60" stroke="hsl(340 55% 72%)" strokeWidth="3" strokeLinecap="round" />
          <path d="M135 55C125 48 112 52 108 60" stroke="hsl(340 55% 72%)" strokeWidth="3" strokeLinecap="round" />

          {/* Cute ears */}
          <path d="M30 90C22 96 22 108 30 114" stroke="hsl(340 60% 72%)" strokeWidth="5" strokeLinecap="round" />
          <path d="M170 90C178 96 178 108 170 114" stroke="hsl(340 60% 72%)" strokeWidth="5" strokeLinecap="round" />

          {/* Eyes */}
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '78px 100px', transition: 'transform 0.1s ease-in-out' }}>
            <ellipse cx="78" cy="100" rx="14" ry="15" fill="white" />
            <circle cx="82" cy="102" r="8" fill="hsl(232 47% 38%)" />
            <circle cx="85" cy="99" r="3" fill="white" />
            <circle cx="80" cy="105" r="1.5" fill="white" opacity="0.6" />
          </g>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '122px 100px', transition: 'transform 0.1s ease-in-out' }}>
            <ellipse cx="122" cy="100" rx="14" ry="15" fill="white" />
            <circle cx="126" cy="102" r="8" fill="hsl(232 47% 38%)" />
            <circle cx="129" cy="99" r="3" fill="white" />
            <circle cx="124" cy="105" r="1.5" fill="white" opacity="0.6" />
          </g>

          {/* Eyebrows (friendly arched) */}
          <path d="M66 84C72 78 84 78 90 84" stroke="hsl(230 35% 40%)" strokeWidth="3" strokeLinecap="round" />
          <path d="M110 84C116 78 128 78 134 84" stroke="hsl(230 35% 40%)" strokeWidth="3" strokeLinecap="round" />

          {/* Cute button nose */}
          <ellipse cx="100" cy="118" rx="5" ry="4" fill="hsl(350 75% 72%)" />
          <circle cx="97" cy="117" r="1.5" fill="hsl(350 80% 78%)" />

          {/* Happy smile */}
          <path d="M88 128C94 137 106 137 112 128" stroke="hsl(230 35% 35%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Blush cheeks */}
          <ellipse cx="60" cy="118" rx="10" ry="7" fill="hsl(350 90% 78%)" opacity="0.4" />
          <ellipse cx="140" cy="118" rx="10" ry="7" fill="hsl(350 90% 78%)" opacity="0.4" />

          {/* Sparkle decorations */}
          <g opacity="0.6">
            <path d="M168 50L170 44L172 50L178 52L172 54L170 60L168 54L162 52Z" fill="hsl(45 90% 65%)" />
            <path d="M28 60L30 56L32 60L36 62L32 64L30 68L28 64L24 62Z" fill="hsl(45 90% 65%)" />
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
