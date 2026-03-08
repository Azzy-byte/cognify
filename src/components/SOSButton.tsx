import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SOSModal from './SOSModal';

const SOSButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 w-16 h-16 rounded-full bg-gradient-to-br from-destructive to-soft-pink shadow-2xl flex items-center justify-center sos-pulse active:scale-95 transition-transform"
        style={{ bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)' }}
        aria-label="SOS Emergency"
      >
        <AlertTriangle size={26} className="text-destructive-foreground" />
      </button>
      <SOSModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default SOSButton;
