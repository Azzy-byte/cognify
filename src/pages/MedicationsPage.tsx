import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Plus, Pill, Clock, Trash2, Check, Bell, X } from 'lucide-react';

const MedicationsPage = () => {
  const { medications, reminders, currentUser, addMedication, deleteMedication, addReminder, updateReminder, addAuditEntry, canEdit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [prescriber, setPrescriber] = useState('');

  // Check reminders every minute
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      reminders.filter(r => !r.completed && r.time === currentTime).forEach(r => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`💊 ${r.title}`, { body: 'Time to take your medication', icon: '💊' });
        }
      });
    };
    if ('Notification' in window) Notification.requestPermission();
    const interval = setInterval(check, 60000);
    check();
    return () => clearInterval(interval);
  }, [reminders]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addMedication({
      name: name.trim(), dosage: dosage.trim(), frequency, times,
      prescriber: prescriber.trim(), start_date: new Date().toISOString().split('T')[0],
      created_by: currentUser.id, last_modified_by: currentUser.id,
    });
    // Auto-generate reminders
    times.forEach(time => {
      addReminder({
        title: `Take ${name} ${dosage}`,
        time, date: new Date().toISOString().split('T')[0],
        category: 'medication', repeat: frequency === 'daily',
        completed: false,
      });
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'medication_added',
      target_type: 'medication', target_id: '',
      new_value: { name, dosage, times },
    });
    setName(''); setDosage(''); setTimes(['08:00']); setPrescriber('');
    setShowForm(false);
  };

  const handleDelete = (med: typeof medications[0]) => {
    if (!canEdit(med.created_by)) {
      alert("You can only edit items you created");
      return;
    }
    deleteMedication(med.id);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'medication_deleted',
      target_type: 'medication', target_id: med.id,
      old_value: { name: med.name, dosage: med.dosage },
    });
  };

  const markComplete = (r: typeof reminders[0]) => {
    updateReminder(r.id, { completed: true, completed_at: new Date().toISOString() });
  };

  const activeReminders = reminders.filter(r => !r.completed);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🔔 Medications & Reminders</h1>
        <button onClick={() => setShowForm(!showForm)} className="p-2 rounded-full bg-lavender/20 hover:bg-lavender/30 transition-colors">
          {showForm ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <h3 className="font-semibold mb-3">Add Medication</h3>
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Medication name" className="input-glass w-full" />
            <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (e.g., 10mg)" className="input-glass w-full" />
            <select value={frequency} onChange={e => setFrequency(e.target.value)} className="input-glass w-full">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As Needed</option>
            </select>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Times</label>
              {times.map((t, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="time" value={t} onChange={e => setTimes(prev => prev.map((v, j) => j === i ? e.target.value : v))} className="input-glass flex-1" />
                  {times.length > 1 && (
                    <button onClick={() => setTimes(prev => prev.filter((_, j) => j !== i))} className="p-2 text-destructive">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setTimes(prev => [...prev, '12:00'])} className="text-sm text-lavender hover:underline">+ Add time</button>
            </div>
            <input value={prescriber} onChange={e => setPrescriber(e.target.value)} placeholder="Prescriber" className="input-glass w-full" />
            <button onClick={handleAdd} className="btn-primary w-full">Add Medication</button>
          </div>
        </GlassCard>
      )}

      {activeReminders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Bell size={20} /> Active Reminders</h2>
          <div className="space-y-2">
            {activeReminders.map(r => (
              <GlassCard key={r.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-lavender" />
                  <div>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.time}</p>
                  </div>
                </div>
                <button onClick={() => markComplete(r)} className="p-2 rounded-full hover:bg-mint/20 transition-colors">
                  <Check size={18} className="text-mint" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Pill size={20} /> Medications</h2>
      {medications.length === 0 ? (
        <GlassCard className="p-8 text-center"><p className="text-muted-foreground">No medications added</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {medications.map(med => (
            <GlassCard key={med.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{med.name}</h3>
                  <p className="text-sm text-muted-foreground">{med.dosage} · {med.frequency}</p>
                  <div className="flex gap-2 mt-1">
                    {med.times.map((t, i) => (
                      <span key={i} className="pill-badge text-xs">🕐 {t}</span>
                    ))}
                  </div>
                  {med.prescriber && <p className="text-xs text-muted-foreground mt-1">Prescribed by {med.prescriber}</p>}
                </div>
                {canEdit(med.created_by) && (
                  <button onClick={() => handleDelete(med)} className="p-2 text-destructive/60 hover:text-destructive transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
