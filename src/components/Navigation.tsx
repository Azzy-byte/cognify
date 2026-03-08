import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, BookOpen, Camera, Bell, Users } from 'lucide-react';

const tabs = [
  { path: '/', icon: MessageCircle, label: 'Chat' },
  { path: '/memories', icon: BookOpen, label: 'Memories' },
  { path: '/camera', icon: Camera, label: 'Camera' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/family', icon: Users, label: 'Family' },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/50 px-6 py-3">
      <div className="flex items-center justify-around max-w-xl mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[48px] min-h-[48px] active:scale-95 ${
                active ? 'bg-lavender/20 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
