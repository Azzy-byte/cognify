import { useApp } from '@/store/AppContext';
import GlassCard from './GlassCard';
import { Hospital, HelpCircle, ShieldAlert, Phone, CheckCircle, Navigation } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const emergencyTypes = [
  { type: 'medical' as const, icon: Hospital, label: 'Medical' },
  { type: 'lost' as const, icon: HelpCircle, label: 'Lost' },
  { type: 'safety' as const, icon: ShieldAlert, label: 'Safety' },
  { type: 'help' as const, icon: Phone, label: 'Help' },
];

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
}

const SOSModal = ({ open, onClose }: SOSModalProps) => {
  const { contacts, currentUser, safeZones, addSOSEvent, addAuditEntry } = useApp();
  const [sent, setSent] = useState(false);
  const [sosType, setSosType] = useState<string | null>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const emergencyContacts = contacts.filter(c => c.is_emergency);

  const handleSOS = (type: 'medical' | 'lost' | 'safety' | 'help') => {
    setSosType(type);

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(loc);
        triggerSOS(type, loc);
      },
      () => {
        // Try to get a cached position for directions
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCurrentPos(loc);
            triggerSOS(type, loc);
          },
          () => {
            setCurrentPos({ lat: 0, lng: 0 });
            triggerSOS(type, { lat: 0, lng: 0 });
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const triggerSOS = (type: string, loc: { lat: number; lng: number }) => {
    addSOSEvent({
      user_id: currentUser.id,
      type: type as 'medical' | 'lost' | 'safety' | 'help',
      location_lat: loc.lat,
      location_lng: loc.lng,
      contacts_notified: emergencyContacts.map(c => c.name),
      timestamp: new Date().toISOString(),
    });

    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'sos_triggered',
      target_type: 'sos',
      target_id: '',
      new_value: { type, contacts: emergencyContacts.map(c => c.name), location: loc },
    });

    // Alert each emergency contact
    emergencyContacts.forEach(contact => {
      toast.error(`SOS Alert sent to ${contact.name}!`, {
        description: `${currentUser.name} triggered a ${type} emergency${loc.lat !== 0 ? ` at location (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})` : ''}.`,
        duration: 8000,
      });
    });

    if (emergencyContacts.length === 0) {
      toast.warning('No emergency contacts set up. Add contacts in the Family page.');
    }

    setSent(true);
  };

  const getHomeDirections = () => {
    const homeZone = safeZones.find(z => z.name.toLowerCase().includes('home')) || safeZones[0];
    if (!homeZone) {
      toast.info('No home location set. Add a safe zone on the Map page.');
      return;
    }

    const openDirections = (lat: number, lng: number) => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${homeZone.lat},${homeZone.lng}&travelmode=walking`,
        '_blank'
      );
    };

    if (currentPos && currentPos.lat !== 0) {
      openDirections(currentPos.lat, currentPos.lng);
      return;
    }

    // Try to get fresh location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(loc);
        openDirections(loc.lat, loc.lng);
      },
      () => {
        toast.info('Location not available. Please enable GPS.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div className="relative animate-scale-in" onClick={e => e.stopPropagation()}>
        {sent ? (
          <GlassCard className="p-8 text-center max-w-sm">
            <CheckCircle size={48} className="text-mint mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Alert Sent</h3>
            <p className="text-muted-foreground mb-4">
              Notified {emergencyContacts.length} emergency contact{emergencyContacts.length !== 1 ? 's' : ''}
            </p>
            {sosType === 'lost' && (
              <button
                onClick={getHomeDirections}
                className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px] mb-3"
              >
                <Navigation size={18} />
                Show Way Back Home
              </button>
            )}
            <button
              onClick={() => { setSent(false); setSosType(null); onClose(); }}
              className="text-sm text-muted-foreground min-h-[44px]"
            >
              Close
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h2 className="text-xl font-bold text-center mb-6">SOS Emergency</h2>
            <div className="grid grid-cols-2 gap-4">
              {emergencyTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleSOS(type)}
                  className="glass-card-hover p-6 flex flex-col items-center gap-3 active:scale-95 transition-transform duration-200 min-h-[120px]"
                >
                  <Icon size={32} />
                  <span className="font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default SOSModal;
