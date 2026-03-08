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
      if (Math.random() > 0.78) setTimeout(blink, 170);
    }, 3600 + Math.random() * 1800);

    return () => clearInterval(interval);
  }, []);

  const eyeScaleY = blinking ? 0.08 : 1;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="brain-sway" aria-hidden="true">
        <svg width="210" height="230" viewBox="0 0 210 230" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="105" cy="214" rx="36" ry="7" fill="hsl(var(--foreground) / 0.12)" />

          {/* Legs */}
          <rect x="80" y="176" width="15" height="26" rx="8" fill="hsl(var(--primary) / 0.28)" />
          <rect x="115" y="176" width="15" height="26" rx="8" fill="hsl(var(--primary) / 0.28)" />
          <ellipse cx="86" cy="204" rx="13" ry="7" fill="hsl(var(--primary) / 0.4)" />
          <ellipse cx="123" cy="204" rx="13" ry="7" fill="hsl(var(--primary) / 0.4)" />

          {/* Body */}
          <ellipse cx="105" cy="150" rx="45" ry="34" fill="hsl(var(--secondary))" />

          {/* Arms */}
          <path d="M62 146C53 152 47 163 50 171C52 176 58 176 61 172C64 166 62 160 67 154" fill="hsl(var(--primary) / 0.28)" />
          <path d="M148 146C157 152 163 163 160 171C158 176 152 176 149 172C146 166 148 160 143 154" fill="hsl(var(--primary) / 0.28)" />
          <circle cx="57" cy="171" r="7" fill="hsl(var(--primary) / 0.35)" />
          <circle cx="153" cy="171" r="7" fill="hsl(var(--primary) / 0.35)" />

          {/* Brain */}
          <path
            d="M105 24C126 12 151 18 165 35C180 36 192 49 192 64C192 71 189 77 185 82C193 92 192 108 181 118C179 133 167 146 151 149H59C43 146 31 133 29 118C18 108 17 92 25 82C21 77 18 71 18 64C18 49 30 36 45 35C59 18 84 12 105 24Z"
            fill="hsl(var(--accent))"
          />

          {/* Folds */}
          <path d="M105 34V78" stroke="hsl(var(--foreground) / 0.2)" strokeWidth="4" strokeLinecap="round" />
          <path d="M81 42C89 33 99 33 105 43" stroke="hsl(var(--foreground) / 0.2)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M129 42C121 33 111 33 105 43" stroke="hsl(var(--foreground) / 0.2)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M68 58C79 49 91 52 96 61" stroke="hsl(var(--foreground) / 0.18)" strokeWidth="3" strokeLinecap="round" />
          <path d="M142 58C131 49 119 52 114 61" stroke="hsl(var(--foreground) / 0.18)" strokeWidth="3" strokeLinecap="round" />

          {/* Eyes */}
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '82px 102px', transition: 'transform 0.1s ease-in-out' }}>
            <ellipse cx="82" cy="102" rx="12" ry="13" fill="hsl(var(--background))" />
            <circle cx="84" cy="104" r="5" fill="hsl(var(--foreground) / 0.75)" />
            <circle cx="86" cy="102" r="1.7" fill="hsl(var(--background))" />
          </g>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '128px 102px', transition: 'transform 0.1s ease-in-out' }}>
            <ellipse cx="128" cy="102" rx="12" ry="13" fill="hsl(var(--background))" />
            <circle cx="130" cy="104" r="5" fill="hsl(var(--foreground) / 0.75)" />
            <circle cx="132" cy="102" r="1.7" fill="hsl(var(--background))" />
          </g>

          {/* Brows */}
          <path d="M72 86C77 82 87 82 92 86" stroke="hsl(var(--foreground) / 0.55)" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M118 86C123 82 133 82 138 86" stroke="hsl(var(--foreground) / 0.55)" strokeWidth="2.8" strokeLinecap="round" />

          {/* Face */}
          <ellipse cx="105" cy="118" rx="4.2" ry="3.2" fill="hsl(var(--primary) / 0.5)" />
          <path d="M95 130C100 136 110 136 115 130" stroke="hsl(var(--foreground) / 0.72)" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="64" cy="121" rx="8" ry="6" fill="hsl(var(--primary) / 0.26)" />
          <ellipse cx="146" cy="121" rx="8" ry="6" fill="hsl(var(--primary) / 0.26)" />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1 text-foreground">
          {greeting || `Hello${userName ? `, ${userName}` : ''}`}
        </h2>
        <p className="text-muted-foreground">I’m here with you — we can chat anytime.</p>
      </div>
    </div>
  );
};

export default BrainCharacter;

