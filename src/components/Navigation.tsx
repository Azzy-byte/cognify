import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, BookOpen, Camera, Bell, Users, MapPin } from 'lucide-react';

const tabs = [
  { path: '/', icon: MessageCircle, label: 'Chat' },
  { path: '/memories', icon: BookOpen, label: 'Memories' },
  { path: '/camera', icon: Camera, label: 'Camera' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/family', icon: Users, label: 'Family' },
  { path: '/map', icon: MapPin, label: 'Map' },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-none" style={{ borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors duration-200 min-w-[56px] min-h-[48px] ${
                active ? 'bg-lavender/20 text-lavender' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
