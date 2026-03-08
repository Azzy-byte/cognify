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
      setTimeout(() => setBlinking(false), 100);
    };

    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.8) setTimeout(blink, 160);
    }, 3800 + Math.random() * 1800);

    return () => clearInterval(interval);
  }, []);

  const eyeScaleY = blinking ? 0.07 : 1;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="brain-sway" aria-hidden="true">
        <svg width="220" height="230" viewBox="0 0 220 230" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ground shadow */}
          <ellipse cx="110" cy="214" rx="36" ry="7" fill="hsl(var(--foreground) / 0.12)" />

          {/* legs */}
          <rect x="92" y="176" width="14" height="24" rx="6" fill="hsl(var(--primary) / 0.34)" />
          <rect x="114" y="176" width="14" height="24" rx="6" fill="hsl(var(--primary) / 0.34)" />

          {/* brain head (rounded cloud style) */}
          <path
            d="M110 28C122 18 138 18 149 27C163 25 176 35 178 49C189 54 194 65 192 77C196 90 188 103 176 108C169 120 156 126 143 124H77C64 126 51 120 44 108C32 103 24 90 28 77C26 65 31 54 42 49C44 35 57 25 71 27C82 18 98 18 110 28Z"
            fill="hsl(var(--accent))"
          />

          {/* center fold */}
          <path d="M110 31V79" stroke="hsl(var(--primary) / 0.42)" strokeWidth="4" strokeLinecap="round" />
          <path d="M90 40C98 32 106 32 110 40" stroke="hsl(var(--primary) / 0.42)" strokeWidth="4" strokeLinecap="round" />
          <path d="M130 40C122 32 114 32 110 40" stroke="hsl(var(--primary) / 0.42)" strokeWidth="4" strokeLinecap="round" />

          {/* ears */}
          <path d="M46 80C40 86 40 95 46 101" stroke="hsl(var(--primary) / 0.4)" strokeWidth="5" strokeLinecap="round" />
          <path d="M174 80C180 86 180 95 174 101" stroke="hsl(var(--primary) / 0.4)" strokeWidth="5" strokeLinecap="round" />

          {/* eyebrows */}
          <path d="M83 88C88 84 96 84 101 88" stroke="hsl(var(--foreground) / 0.6)" strokeWidth="5" strokeLinecap="round" />
          <path d="M119 88C124 84 132 84 137 88" stroke="hsl(var(--foreground) / 0.6)" strokeWidth="5" strokeLinecap="round" />

          {/* eyes */}
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '92px 104px', transition: 'transform 0.09s ease-in-out' }}>
            <circle cx="92" cy="104" r="16" fill="hsl(var(--background))" />
            <circle cx="96" cy="107" r="8.5" fill="hsl(var(--foreground) / 0.75)" />
            <circle cx="99" cy="104" r="3" fill="hsl(var(--background))" />
          </g>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '128px 104px', transition: 'transform 0.09s ease-in-out' }}>
            <circle cx="128" cy="104" r="16" fill="hsl(var(--background))" />
            <circle cx="132" cy="107" r="8.5" fill="hsl(var(--foreground) / 0.75)" />
            <circle cx="135" cy="104" r="3" fill="hsl(var(--background))" />
          </g>

          {/* nose and blush */}
          <rect x="106" y="116" width="8" height="4" rx="2" fill="hsl(var(--primary) / 0.5)" />
          <circle cx="72" cy="122" r="3" fill="hsl(var(--primary) / 0.4)" />
          <circle cx="78" cy="126" r="3" fill="hsl(var(--primary) / 0.4)" />
          <circle cx="148" cy="122" r="3" fill="hsl(var(--primary) / 0.4)" />
          <circle cx="142" cy="126" r="3" fill="hsl(var(--primary) / 0.4)" />

          {/* notepad */}
          <rect x="92" y="122" width="36" height="54" rx="8" fill="hsl(var(--secondary))" />
          <rect x="92" y="122" width="36" height="9" rx="5" fill="hsl(var(--primary) / 0.6)" />

          {/* hands */}
          <ellipse cx="86" cy="146" rx="8" ry="10" fill="hsl(var(--primary) / 0.34)" />
          <ellipse cx="134" cy="146" rx="8" ry="10" fill="hsl(var(--primary) / 0.34)" />

          {/* pencil */}
          <rect x="138" y="138" width="7" height="20" rx="2" transform="rotate(-32 138 138)" fill="hsl(var(--accent-foreground) / 0.7)" />
          <polygon points="151,151 156,153 151,158" fill="hsl(var(--secondary-foreground) / 0.45)" />
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


