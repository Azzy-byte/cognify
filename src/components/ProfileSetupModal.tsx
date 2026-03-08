import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';

const ProfileSetupModal = () => {
  const { currentUser, updateCurrentUser } = useApp();
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');

  if (currentUser.name.trim()) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <GlassCard className="relative w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">Welcome to Cognify</h2>
        <p className="text-muted-foreground mb-4">Set up your profile to start using your own data.</p>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input-glass w-full"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (optional)"
            className="input-glass w-full"
            type="email"
          />
          <button
            onClick={() => updateCurrentUser({ name: name.trim(), email: email.trim() })}
            disabled={!name.trim()}
            className="btn-primary w-full disabled:opacity-60"
          >
            Save Profile
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfileSetupModal;
