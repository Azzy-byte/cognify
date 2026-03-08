import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GlassCard = ({ children, className = '', hover = false, onClick, style }: GlassCardProps) => (
  <div className={`${hover ? 'glass-card-hover cursor-pointer' : 'glass-card'} ${className}`} onClick={onClick} style={style}>
    {children}
  </div>
);

export default GlassCard;
