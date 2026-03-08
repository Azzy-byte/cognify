import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SOSModal from './SOSModal';

const SOSButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-destructive to-soft-pink shadow-2xl flex items-center justify-center sos-pulse active:scale-95 transition-transform"
        style={{ top: '4.5rem', right: '1rem' }}
        aria-label="SOS Emergency"
      >
        <AlertTriangle size={22} className="text-destructive-foreground" />
      </button>
      <SOSModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default SOSButton;
