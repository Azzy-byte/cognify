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
      setTimeout(() => setBlinking(false), 110);
    };

    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.72) {
        setTimeout(blink, 180);
      }
    }, 3400 + Math.random() * 2200);

    return () => clearInterval(interval);
  }, []);

  const eyeScaleY = blinking ? 0.16 : 1;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="brain-sway" aria-hidden="true">
        <svg width="220" height="230" viewBox="0 0 220 230" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Legs */}
          <rect x="87" y="168" width="14" height="38" rx="7" fill="hsl(350 100% 84%)" />
          <rect x="119" y="168" width="14" height="38" rx="7" fill="hsl(350 100% 84%)" />
          <rect x="82" y="202" width="22" height="12" rx="6" fill="hsl(350 100% 80%)" />
          <rect x="117" y="202" width="22" height="12" rx="6" fill="hsl(350 100% 80%)" />

          {/* Brain blob */}
          <path
            d="M110 26C130 14 154 20 167 36C182 36 194 48 194 63C194 69 192 74 188 79C197 90 196 106 185 115C185 130 174 143 158 146H62C46 143 35 130 35 115C24 106 23 90 32 79C28 74 26 69 26 63C26 48 38 36 53 36C66 20 90 14 110 26Z"
            fill="hsl(340 70% 84%)"
          />

          {/* Side ears */}
          <path d="M44 92C37 97 37 108 44 114" stroke="hsl(340 74% 73%)" strokeWidth="6" strokeLinecap="round" />
          <path d="M176 92C183 97 183 108 176 114" stroke="hsl(340 74% 73%)" strokeWidth="6" strokeLinecap="round" />

          {/* Brain folds */}
          <path d="M110 35V80" stroke="hsl(340 70% 72%)" strokeWidth="5" strokeLinecap="round" />
          <path d="M83 44C92 32 106 32 110 45" stroke="hsl(340 70% 72%)" strokeWidth="5" strokeLinecap="round" />
          <path d="M137 44C128 32 114 32 110 45" stroke="hsl(340 70% 72%)" strokeWidth="5" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d="M75 88C80 84 90 84 95 88" stroke="hsl(230 47% 43%)" strokeWidth="5" strokeLinecap="round" />
          <path d="M125 88C130 84 140 84 145 88" stroke="hsl(230 47% 43%)" strokeWidth="5" strokeLinecap="round" />

          {/* Eyes */}
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '85px 105px', transition: 'transform 0.09s ease-in-out' }}>
            <circle cx="85" cy="105" r="16" fill="white" />
            <circle cx="90" cy="107" r="9" fill="hsl(232 47% 44%)" />
            <circle cx="93" cy="104" r="3" fill="white" />
          </g>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '135px 105px', transition: 'transform 0.09s ease-in-out' }}>
            <circle cx="135" cy="105" r="16" fill="white" />
            <circle cx="140" cy="107" r="9" fill="hsl(232 47% 44%)" />
            <circle cx="143" cy="104" r="3" fill="white" />
          </g>

          {/* Nose + smile */}
          <path d="M110 120L106 127H114" fill="hsl(350 88% 70%)" />
          <path d="M95 136C102 144 118 144 125 136" stroke="hsl(230 40% 35%)" strokeWidth="3" strokeLinecap="round" />

          {/* Cheeks */}
          <circle cx="68" cy="126" r="9" fill="hsl(350 92% 76%)" opacity="0.55" />
          <circle cx="152" cy="126" r="9" fill="hsl(350 92% 76%)" opacity="0.55" />
          <circle cx="62" cy="126" r="3" fill="hsl(350 92% 70%)" opacity="0.5" />
          <circle cx="158" cy="126" r="3" fill="hsl(350 92% 70%)" opacity="0.5" />

          {/* Arms */}
          <ellipse cx="70" cy="155" rx="12" ry="15" fill="hsl(350 100% 84%)" />
          <ellipse cx="150" cy="155" rx="12" ry="15" fill="hsl(350 100% 84%)" />

          {/* Notepad */}
          <rect x="89" y="134" width="42" height="58" rx="8" fill="hsl(50 70% 80%)" />
          <rect x="89" y="134" width="42" height="10" rx="6" fill="hsl(30 90% 66%)" />
          <line x1="96" y1="152" x2="124" y2="152" stroke="hsl(44 42% 64%)" strokeWidth="2" />
          <line x1="96" y1="160" x2="124" y2="160" stroke="hsl(44 42% 64%)" strokeWidth="2" />
          <line x1="96" y1="168" x2="120" y2="168" stroke="hsl(44 42% 64%)" strokeWidth="2" />

          {/* Pencil */}
          <rect x="144" y="144" width="7" height="24" rx="2" transform="rotate(-32 144 144)" fill="hsl(260 54% 66%)" />
          <polygon points="159,157 165,160 158,165" fill="hsl(42 66% 75%)" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1 text-foreground">
          {greeting || `Hello${userName ? `, ${userName}` : ''}`}
        </h2>
        <p className="text-muted-foreground">Tell me about your day, share photos, or use voice to chat.</p>
      </div>
    </div>
  );
};

export default BrainCharacter;
