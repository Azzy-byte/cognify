import { useApp } from '@/store/AppContext';
import GlassCard from './GlassCard';
import { Hospital, HelpCircle, ShieldAlert, Phone, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const emergencyTypes = [
  { type: 'medical' as const, icon: Hospital, label: 'Medical', color: 'text-destructive' },
  { type: 'lost' as const, icon: HelpCircle, label: 'Lost', color: 'text-sky-blue' },
  { type: 'safety' as const, icon: ShieldAlert, label: 'Safety', color: 'text-lavender' },
  { type: 'help' as const, icon: Phone, label: 'Help', color: 'text-mint' },
];

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
}

const SOSModal = ({ open, onClose }: SOSModalProps) => {
  const { contacts, currentUser, addSOSEvent, addAuditEntry } = useApp();
  const [sent, setSent] = useState(false);
  const emergencyContacts = contacts.filter(c => c.is_emergency);

  const handleSOS = (type: 'medical' | 'lost' | 'safety' | 'help') => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        addSOSEvent({
          user_id: currentUser.id, type,
          location_lat: pos.coords.latitude, location_lng: pos.coords.longitude,
          contacts_notified: emergencyContacts.map(c => c.name),
          timestamp: new Date().toISOString(),
        });
        addAuditEntry({
          timestamp: new Date().toISOString(),
          actor_id: currentUser.id,
          actor_name: `${currentUser.name} (${currentUser.role})`,
          action_type: 'sos_triggered',
          target_type: 'sos', target_id: '',
          new_value: { type, contacts: emergencyContacts.map(c => c.name) },
        });
        setSent(true);
        setTimeout(() => { setSent(false); onClose(); }, 2000);
      },
      () => {
        addSOSEvent({
          user_id: currentUser.id, type,
          location_lat: 0, location_lng: 0,
          contacts_notified: emergencyContacts.map(c => c.name),
          timestamp: new Date().toISOString(),
        });
        setSent(true);
        setTimeout(() => { setSent(false); onClose(); }, 2000);
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div className="relative animate-scale-in" onClick={e => e.stopPropagation()}>
        {sent ? (
          <GlassCard className="p-8 text-center">
            <CheckCircle size={48} className="text-mint mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Alert Sent</h3>
            <p className="text-muted-foreground">Notified {emergencyContacts.length} emergency contact{emergencyContacts.length !== 1 ? 's' : ''}</p>
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
