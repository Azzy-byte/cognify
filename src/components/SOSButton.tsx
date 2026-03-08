import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SOSModal from './SOSModal';

const SOSButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg sos-pulse transition-transform duration-300 hover:scale-110"
        aria-label="SOS Emergency"
      >
        <AlertTriangle size={28} className="text-destructive-foreground" />
      </button>
      <SOSModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default SOSButton;
