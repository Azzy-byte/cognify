import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard = ({ children, className = '', hover = false, onClick }: GlassCardProps) => (
  <div className={`${hover ? 'glass-card-hover cursor-pointer' : 'glass-card'} ${className}`} onClick={onClick}>
    {children}
  </div>
);

export default GlassCard;
