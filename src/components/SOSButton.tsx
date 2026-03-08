import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SOSModal from './SOSModal';

const SOSButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-[60] w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg sos-pulse"
        style={{ bottom: '5.5rem', right: '1rem' }}
        aria-label="SOS Emergency"
      >
        <AlertTriangle size={24} className="text-destructive-foreground" />
      </button>
      <SOSModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default SOSButton;
