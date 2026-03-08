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
      if (Math.random() > 0.6) {
        setTimeout(blink, 300);
      }
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const eyeScaleY = blinking ? 0.1 : 1;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="brain-sway">
        <svg width="200" height="210" viewBox="0 0 200 210" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Brain body - two hemispheres */}
          <ellipse cx="100" cy="72" rx="70" ry="62" fill="hsl(350 100% 88%)" />
          {/* Left hemisphere bump */}
          <ellipse cx="72" cy="52" rx="42" ry="44" fill="hsl(350 100% 86%)" />
          {/* Right hemisphere bump */}
          <ellipse cx="128" cy="52" rx="42" ry="44" fill="hsl(350 100% 86%)" />
          {/* Top bumps */}
          <ellipse cx="60" cy="36" rx="22" ry="20" fill="hsl(350 100% 88%)" />
          <ellipse cx="100" cy="28" rx="18" ry="16" fill="hsl(350 100% 87%)" />
          <ellipse cx="140" cy="36" rx="22" ry="20" fill="hsl(350 100% 88%)" />
          {/* Side bumps */}
          <ellipse cx="38" cy="62" rx="16" ry="18" fill="hsl(350 100% 87%)" />
          <ellipse cx="162" cy="62" rx="16" ry="18" fill="hsl(350 100% 87%)" />

          {/* Central brain fold line */}
          <path d="M100 18 C100 30 98 50 100 80" stroke="hsl(350 60% 75%)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
          
          {/* Brain wrinkle lines - left */}
          <path d="M52 38 C62 32 75 32 85 38" stroke="hsl(350 60% 78%)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M40 56 C52 48 65 48 78 54" stroke="hsl(350 60% 78%)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.35" />
          <path d="M45 72 C55 66 68 66 80 70" stroke="hsl(350 60% 78%)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
          
          {/* Brain wrinkle lines - right */}
          <path d="M115 38 C125 32 138 32 148 38" stroke="hsl(350 60% 78%)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M122 54 C135 48 148 48 160 56" stroke="hsl(350 60% 78%)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.35" />
          <path d="M120 70 C132 66 145 66 155 72" stroke="hsl(350 60% 78%)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

          {/* Eyebrows */}
          <path d="M62 74 C66 68 76 67 82 72" stroke="hsl(215 28% 30%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M118 72 C124 67 134 68 138 74" stroke="hsl(215 28% 30%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Eyes with blink - Left eye */}
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '75px 86px', transition: 'transform 0.08s ease-in-out' }}>
            <ellipse cx="75" cy="86" rx="11" ry="13" fill="hsl(230 50% 22%)" />
            <circle cx="71" cy="82" r="4.5" fill="white" />
            <circle cx="78" cy="90" r="2" fill="white" opacity="0.6" />
          </g>
          {/* Right eye */}
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '125px 86px', transition: 'transform 0.08s ease-in-out' }}>
            <ellipse cx="125" cy="86" rx="11" ry="13" fill="hsl(230 50% 22%)" />
            <circle cx="121" cy="82" r="4.5" fill="white" />
            <circle cx="128" cy="90" r="2" fill="white" opacity="0.6" />
          </g>

          {/* Smile */}
          <path d="M88 104 C93 110 107 110 112 104" stroke="hsl(215 28% 30%)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Rosy cheeks */}
          <circle cx="52" cy="96" r="9" fill="hsl(350 80% 80%)" opacity="0.45" />
          <circle cx="148" cy="96" r="9" fill="hsl(350 80% 80%)" opacity="0.45" />
          {/* Cheek freckles */}
          <circle cx="47" cy="93" r="1.8" fill="hsl(350 70% 75%)" opacity="0.4" />
          <circle cx="50" cy="99" r="1.8" fill="hsl(350 70% 75%)" opacity="0.4" />
          <circle cx="55" cy="91" r="1.8" fill="hsl(350 70% 75%)" opacity="0.4" />
          <circle cx="145" cy="93" r="1.8" fill="hsl(350 70% 75%)" opacity="0.4" />
          <circle cx="150" cy="99" r="1.8" fill="hsl(350 70% 75%)" opacity="0.4" />
          <circle cx="153" cy="93" r="1.8" fill="hsl(350 70% 75%)" opacity="0.4" />

          {/* Left arm */}
          <path d="M42 108 C32 114 26 124 28 132" stroke="hsl(350 100% 86%)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="132" r="6" fill="hsl(350 100% 86%)" />
          
          {/* Notepad */}
          <rect x="48" y="112" width="48" height="58" rx="4" fill="hsl(50 85% 90%)" stroke="hsl(50 50% 78%)" strokeWidth="1.5" />
          <line x1="56" y1="124" x2="88" y2="124" stroke="hsl(50 40% 75%)" strokeWidth="1" opacity="0.6" />
          <line x1="56" y1="132" x2="86" y2="132" stroke="hsl(50 40% 75%)" strokeWidth="1" opacity="0.6" />
          <line x1="56" y1="140" x2="82" y2="140" stroke="hsl(50 40% 75%)" strokeWidth="1" opacity="0.6" />
          <line x1="56" y1="148" x2="78" y2="148" stroke="hsl(50 40% 75%)" strokeWidth="1" opacity="0.6" />
          <line x1="56" y1="156" x2="84" y2="156" stroke="hsl(50 40% 75%)" strokeWidth="1" opacity="0.6" />

          {/* Right arm */}
          <path d="M158 108 C168 114 174 124 172 132" stroke="hsl(350 100% 86%)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="172" cy="132" r="6" fill="hsl(350 100% 86%)" />
          
          {/* Pencil */}
          <rect x="164" y="108" width="5" height="28" rx="1.5" fill="hsl(275 52% 81%)" transform="rotate(-12 166 122)" />
          <polygon points="163,136 169,136 166,144" fill="hsl(50 80% 80%)" transform="rotate(-12 166 140)" />
          <rect x="164" y="106" width="5" height="6" rx="1" fill="hsl(350 80% 75%)" transform="rotate(-12 166 109)" />

          {/* Legs */}
          <line x1="80" y1="130" x2="76" y2="162" stroke="hsl(350 100% 86%)" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="73" cy="166" rx="10" ry="5" fill="hsl(350 100% 86%)" />
          <line x1="120" y1="130" x2="124" y2="162" stroke="hsl(350 100% 86%)" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="127" cy="166" rx="10" ry="5" fill="hsl(350 100% 86%)" />
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
