import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Clock, Pill, Brain, Shield, AlertTriangle } from 'lucide-react';

const filters = ['All', 'Memories', 'Medications', 'Permissions'] as const;

const iconMap: Record<string, React.ReactNode> = {
  memory_created: <Brain size={16} className="text-soft-pink" />,
  memory_edited: <Brain size={16} className="text-sky-blue" />,
  memory_deleted: <Brain size={16} className="text-destructive" />,
  medication_added: <Pill size={16} className="text-mint" />,
  medication_updated: <Pill size={16} className="text-sky-blue" />,
  medication_deleted: <Pill size={16} className="text-destructive" />,
  permission_changed: <Shield size={16} className="text-lavender" />,
  contact_added: <Clock size={16} className="text-mint" />,
  sos_triggered: <AlertTriangle size={16} className="text-destructive" />,
  person_tagged: <Brain size={16} className="text-mint" />,
  person_added: <Brain size={16} className="text-sky-blue" />,
  safe_zone_added: <Shield size={16} className="text-mint" />,
  reminder_added: <Clock size={16} className="text-sky-blue" />,
};

const filterMatch: Record<string, string[]> = {
  All: [],
  Memories: ['memory_created', 'memory_edited', 'memory_deleted', 'person_tagged', 'person_added'],
  Medications: ['medication_added', 'medication_updated', 'medication_deleted', 'reminder_added'],
  Permissions: ['permission_changed'],
};

const AuditLogPage = () => {
  const { auditLog } = useApp();
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All'
    ? auditLog
    : auditLog.filter(e => filterMatch[filter]?.includes(e.action_type));

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`pill-badge whitespace-nowrap transition-colors duration-200 min-h-[40px] ${filter === f ? 'bg-soft-pink/30 text-foreground' : ''}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center"><p className="text-muted-foreground">No entries found</p></GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <GlassCard key={entry.id} className="p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="mt-1">{iconMap[entry.action_type] || <Clock size={16} className="text-muted-foreground" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{entry.actor_name}</span>{' '}
                    <span className="text-muted-foreground">{entry.action_type.replace(/_/g, ' ')}</span>
                  </p>
                  {(entry.old_value || entry.new_value) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {entry.old_value && <span className="line-through">{JSON.stringify(entry.old_value)}</span>}
                      {entry.old_value && entry.new_value && <span> → </span>}
                      {entry.new_value && <span className="text-foreground">{JSON.stringify(entry.new_value)}</span>}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
