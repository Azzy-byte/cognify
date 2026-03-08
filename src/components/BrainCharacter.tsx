interface BrainCharacterProps {
  greeting?: string;
  userName?: string;
}

const BrainCharacter = ({ greeting, userName }: BrainCharacterProps) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="brain-idle">
      <svg width="160" height="170" viewBox="0 0 160 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Brain body - big, round, cute pink */}
        <ellipse cx="80" cy="65" rx="52" ry="48" fill="hsl(var(--soft-pink))" />

        {/* Brain left hemisphere highlight */}
        <ellipse cx="62" cy="50" rx="28" ry="30" fill="hsl(350 100% 88%)" opacity="0.5" />

        {/* Brain folds - center line */}
        <path d="M80 22v30" stroke="hsl(350 60% 75%)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        
        {/* Brain fold curves */}
        <path d="M55 38c8-6 18-8 25-6" stroke="hsl(350 60% 75%)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M80 38c7-4 17-6 25-4" stroke="hsl(350 60% 75%)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M48 52c10-4 18-5 25-2" stroke="hsl(350 60% 75%)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M87 50c8-3 16-4 22-1" stroke="hsl(350 60% 75%)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
        
        {/* Eyebrows - expressive arched */}
        <path d="M54 58c3-5 10-6 14-3" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M92 58c3-5 10-6 14-3" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Big round eyes - dark navy blue like reference */}
        <ellipse cx="65" cy="72" rx="8" ry="9" fill="hsl(230 50% 25%)" />
        <ellipse cx="97" cy="72" rx="8" ry="9" fill="hsl(230 50% 25%)" />
        
        {/* Eye white highlights - big */}
        <circle cx="62" cy="69" r="3.5" fill="white" />
        <circle cx="94" cy="69" r="3.5" fill="white" />
        {/* Small secondary highlights */}
        <circle cx="67" cy="75" r="1.5" fill="white" opacity="0.7" />
        <circle cx="99" cy="75" r="1.5" fill="white" opacity="0.7" />

        {/* Cute tiny smile */}
        <path d="M72 86c3 4 13 4 16 0" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
        
        {/* Rosy cheeks - pink dots like reference */}
        <circle cx="48" cy="80" r="6" fill="hsl(350 80% 80%)" opacity="0.5" />
        <circle cx="112" cy="80" r="6" fill="hsl(350 80% 80%)" opacity="0.5" />
        {/* Extra cheek dots pattern */}
        <circle cx="44" cy="78" r="1.5" fill="hsl(350 70% 75%)" opacity="0.4" />
        <circle cx="46" cy="83" r="1.5" fill="hsl(350 70% 75%)" opacity="0.4" />
        <circle cx="50" cy="76" r="1.5" fill="hsl(350 70% 75%)" opacity="0.4" />
        <circle cx="110" cy="78" r="1.5" fill="hsl(350 70% 75%)" opacity="0.4" />
        <circle cx="114" cy="83" r="1.5" fill="hsl(350 70% 75%)" opacity="0.4" />
        <circle cx="116" cy="78" r="1.5" fill="hsl(350 70% 75%)" opacity="0.4" />

        {/* Left arm holding a notepad */}
        <path d="M30 85c-8 2-14 10-12 18" stroke="hsl(var(--soft-pink))" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="18" cy="103" r="5" fill="hsl(var(--soft-pink))" />
        
        {/* Notepad the brain is holding */}
        <rect x="8" y="88" width="28" height="34" rx="3" fill="hsl(45 80% 90%)" stroke="hsl(45 60% 80%)" strokeWidth="1" />
        <line x1="14" y1="96" x2="30" y2="96" stroke="hsl(45 40% 75%)" strokeWidth="1" opacity="0.5" />
        <line x1="14" y1="102" x2="28" y2="102" stroke="hsl(45 40% 75%)" strokeWidth="1" opacity="0.5" />
        <line x1="14" y1="108" x2="26" y2="108" stroke="hsl(45 40% 75%)" strokeWidth="1" opacity="0.5" />

        {/* Right arm with pencil */}
        <path d="M130 85c8 2 14 10 12 18" stroke="hsl(var(--soft-pink))" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="142" cy="103" r="5" fill="hsl(var(--soft-pink))" />
        
        {/* Pencil */}
        <rect x="138" y="86" width="4" height="22" rx="1" fill="hsl(var(--lavender))" transform="rotate(-15 140 97)" />
        <polygon points="137,108 143,108 140,114" fill="hsl(45 80% 80%)" transform="rotate(-15 140 111)" />

        {/* Stubby legs */}
        <line x1="65" y1="110" x2="62" y2="130" stroke="hsl(var(--soft-pink))" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="60" cy="133" rx="8" ry="4" fill="hsl(var(--soft-pink))" />
        <line x1="95" y1="110" x2="98" y2="130" stroke="hsl(var(--soft-pink))" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="100" cy="133" rx="8" ry="4" fill="hsl(var(--soft-pink))" />
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

export default BrainCharacter;
