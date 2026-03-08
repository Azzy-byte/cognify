interface BrainCharacterProps {
  greeting?: string;
  userName?: string;
}

const BrainCharacter = ({ greeting, userName }: BrainCharacterProps) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="brain-idle">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Brain body */}
        <ellipse cx="60" cy="50" rx="32" ry="30" fill="hsl(var(--soft-pink))" />
        {/* Brain texture folds */}
        <path d="M38 42c5-8 10-10 22-10s17 2 22 10" stroke="hsl(350 80% 75%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M42 52c4-5 8-7 18-7s14 2 18 7" stroke="hsl(350 80% 75%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M60 22v8" stroke="hsl(350 80% 75%)" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 24c2-3 6-5 10-5s8 2 10 5" stroke="hsl(350 80% 75%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Closed happy eyes */}
        <path d="M48 44c2 2 4 2 6 0" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M66 44c2 2 4 2 6 0" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Gentle smile */}
        <path d="M52 56c3 4 13 4 16 0" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Rosy cheeks */}
        <circle cx="44" cy="52" r="4" fill="hsl(350 80% 85%)" opacity="0.5" />
        <circle cx="76" cy="52" r="4" fill="hsl(350 80% 85%)" opacity="0.5" />
        {/* Left arm */}
        <path d="M28 58c-5 3-8 8-5 11" stroke="hsl(var(--soft-pink))" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="23" cy="69" r="3" fill="hsl(var(--soft-pink))" />
        {/* Right arm */}
        <path d="M92 58c5 3 8 8 5 11" stroke="hsl(var(--soft-pink))" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="97" cy="69" r="3" fill="hsl(var(--soft-pink))" />
        {/* Left leg */}
        <line x1="48" y1="78" x2="46" y2="94" stroke="hsl(var(--soft-pink))" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="44" cy="96" rx="5" ry="3" fill="hsl(var(--soft-pink))" />
        {/* Right leg */}
        <line x1="72" y1="78" x2="74" y2="94" stroke="hsl(var(--soft-pink))" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="76" cy="96" rx="5" ry="3" fill="hsl(var(--soft-pink))" />
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
