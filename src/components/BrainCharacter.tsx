interface BrainCharacterProps {
  greeting?: string;
  userName?: string;
}

const BrainCharacter = ({ greeting, userName }: BrainCharacterProps) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="brain-idle">
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body / brain shape */}
        <ellipse cx="48" cy="42" rx="28" ry="26" fill="hsl(var(--coral))" />
        {/* Brain folds */}
        <path d="M32 38c4-6 8-8 16-8s12 2 16 8" stroke="hsl(0 83% 72%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M36 46c3-4 6-5 12-5s9 1 12 5" stroke="hsl(0 83% 72%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M48 16v8" stroke="hsl(0 83% 72%)" strokeWidth="2" strokeLinecap="round" />
        {/* Face - closed eyes */}
        <path d="M39 38c1.5 1.5 3 1.5 4.5 0" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M52.5 38c1.5 1.5 3 1.5 4.5 0" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Slight smile */}
        <path d="M42 48c2 3 10 3 12 0" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <circle cx="36" cy="44" r="3" fill="hsl(0 83% 85%)" opacity="0.6" />
        <circle cx="60" cy="44" r="3" fill="hsl(0 83% 85%)" opacity="0.6" />
        {/* Arms */}
        <path d="M20 50c-4 2-6 6-4 8" stroke="hsl(var(--coral))" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M76 50c4 2 6 6 4 8" stroke="hsl(var(--coral))" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Legs */}
        <line x1="40" y1="68" x2="38" y2="80" stroke="hsl(var(--coral))" strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="68" x2="58" y2="80" stroke="hsl(var(--coral))" strokeWidth="3" strokeLinecap="round" />
        {/* Feet */}
        <ellipse cx="36" cy="82" rx="4" ry="2" fill="hsl(var(--coral))" />
        <ellipse cx="60" cy="82" rx="4" ry="2" fill="hsl(var(--coral))" />
      </svg>
    </div>
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-1">
        {greeting || `Hello${userName ? `, ${userName}` : ''}!`}
      </h2>
      <p className="text-muted-foreground">Tell me about your day, share photos, or use voice to chat.</p>
    </div>
  </div>
);

export default BrainCharacter;
