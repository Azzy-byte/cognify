import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { User } from 'lucide-react';

const TopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useApp();
  const isProfile = location.pathname === '/profile';

  return (
    <div className="fixed top-0 left-0 right-0 z-40 px-4 py-2 flex items-center justify-between">
      <div />
      <button
        onClick={() => navigate('/profile')}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
          isProfile
            ? 'bg-soft-pink/30 ring-2 ring-soft-pink/40'
            : 'bg-card/80 backdrop-blur-lg border border-border/50 hover:bg-soft-pink/20'
        }`}
        aria-label="Profile"
      >
        {currentUser.name ? (
          <span className="text-sm font-bold text-foreground">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User size={18} className="text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

export default TopHeader;
