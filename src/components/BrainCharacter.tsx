interface BrainCharacterProps {
  greeting?: string;
  userName?: string;
}

const BrainCharacter = ({ greeting, userName }: BrainCharacterProps) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="brain-idle">
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Brain body - rounder, softer */}
        <ellipse cx="70" cy="62" rx="36" ry="34" fill="hsl(var(--soft-pink))" />
        
        {/* Soft brain folds */}
        <path d="M46 50c6-6 12-8 24-8s18 2 24 8" stroke="hsl(350 80% 80%)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M50 58c5-4 10-6 20-6s15 2 20 6" stroke="hsl(350 80% 80%)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        
        {/* Top bump */}
        <path d="M58 30c3-4 8-6 12-6s9 2 12 6" stroke="hsl(350 80% 80%)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M70 26v6" stroke="hsl(350 80% 80%)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        
        {/* Big sparkly eyes */}
        <ellipse cx="58" cy="56" rx="5" ry="5.5" fill="hsl(var(--foreground))" />
        <ellipse cx="82" cy="56" rx="5" ry="5.5" fill="hsl(var(--foreground))" />
        {/* Eye highlights */}
        <circle cx="56" cy="54" r="2" fill="white" />
        <circle cx="80" cy="54" r="2" fill="white" />
        <circle cx="60" cy="58" r="1" fill="white" opacity="0.6" />
        <circle cx="84" cy="58" r="1" fill="white" opacity="0.6" />
        
        {/* Cute tiny nose */}
        <ellipse cx="70" cy="64" rx="2" ry="1.5" fill="hsl(350 70% 75%)" opacity="0.5" />
        
        {/* Happy smile */}
        <path d="M60 70c4 5 16 5 20 0" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
        
        {/* Rosy cheeks */}
        <circle cx="50" cy="66" r="5" fill="hsl(350 80% 85%)" opacity="0.45" />
        <circle cx="90" cy="66" r="5" fill="hsl(350 80% 85%)" opacity="0.45" />
        
        {/* Little arms waving */}
        <path d="M34 68c-6 0-10 5-8 10" stroke="hsl(var(--soft-pink))" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="26" cy="78" r="3.5" fill="hsl(var(--soft-pink))" />
        <path d="M106 68c6 0 10 5 8 10" stroke="hsl(var(--soft-pink))" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="114" cy="78" r="3.5" fill="hsl(var(--soft-pink))" />
        
        {/* Stubby legs */}
        <line x1="58" y1="94" x2="56" y2="108" stroke="hsl(var(--soft-pink))" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="54" cy="110" rx="6" ry="3.5" fill="hsl(var(--soft-pink))" />
        <line x1="82" y1="94" x2="84" y2="108" stroke="hsl(var(--soft-pink))" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="86" cy="110" rx="6" ry="3.5" fill="hsl(var(--soft-pink))" />
        
        {/* Sparkle decorations */}
        <text x="28" y="44" fontSize="14" opacity="0.6">✨</text>
        <text x="104" y="40" fontSize="10" opacity="0.5">💕</text>
      </svg>
    </div>
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-1">
        {greeting || `Hello${userName ? `, ${userName}` : ''}! 💗`}
      </h2>
      <p className="text-muted-foreground">Tell me about your day, share photos, or use voice to chat.</p>
    </div>
  </div>
);

export default BrainCharacter;
