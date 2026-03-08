import { useState, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Plus, Pill, Clock, Trash2, Check, Bell, X, Calendar, Pencil } from 'lucide-react';

const MedicationsPage = () => {
  const { medications, reminders, currentUser, addMedication, updateMedication, deleteMedication, addReminder, updateReminder, deleteReminder, addAuditEntry, canEdit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'medication' | 'routine'>('medication');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [prescriber, setPrescriber] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState<string | null>(null);

  // Edit reminder state
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');

  // Routine fields
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineTime, setRoutineTime] = useState('');
  const [routineCategory, setRoutineCategory] = useState('routine');
  const [routineRepeat, setRoutineRepeat] = useState('daily');

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      reminders.filter(r => !r.completed && r.time === currentTime).forEach(r => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(r.title, { body: r.category === 'medication' ? 'Time to take your medication' : 'Reminder' });
        }
      });
    };
    if ('Notification' in window) Notification.requestPermission();
    const interval = setInterval(check, 60000);
    check();
    return () => clearInterval(interval);
  }, [reminders]);

  const handleAddMedication = () => {
    if (!name.trim()) return;
    addMedication({
      name: name.trim(), dosage: dosage.trim(), frequency, times,
      prescriber: prescriber.trim(), start_date: new Date().toISOString().split('T')[0],
      created_by: currentUser.id, last_modified_by: currentUser.id,
    });
    times.forEach(time => {
      addReminder({
        title: `Take ${name} ${dosage}`,
        time, date: new Date().toISOString().split('T')[0],
        category: 'medication', repeat: frequency === 'daily',
        completed: false,
      });
    });
    addAuditEntry({
      timestamp: new Date().toISOString(), actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'medication_added', target_type: 'medication', target_id: '',
      new_value: { name, dosage, times },
    });
    setName(''); setDosage(''); setTimes(['08:00']); setPrescriber('');
    setShowForm(false);
  };

  const handleAddRoutine = () => {
    if (!routineTitle.trim() || !routineTime) return;
    addReminder({
      title: routineTitle.trim(), time: routineTime,
      date: new Date().toISOString().split('T')[0],
      category: routineCategory,
      repeat: routineRepeat === 'daily' || routineRepeat === 'weekly',
      completed: false,
    });
    setRoutineTitle(''); setRoutineTime(''); setRoutineCategory('routine');
    setShowForm(false);
  };

  const handleDelete = (med: typeof medications[0]) => {
    if (!canEdit(med.created_by)) { alert("You can only delete medications you created"); return; }
    if (confirmDelete !== med.id) { setConfirmDelete(med.id); return; }
    deleteMedication(med.id);
    setConfirmDelete(null);
  };

  const handleDeleteReminder = (id: string) => {
    if (confirmDeleteReminder !== id) { setConfirmDeleteReminder(id); return; }
    deleteReminder(id);
    setConfirmDeleteReminder(null);
  };

  const startEditReminder = (r: typeof reminders[0]) => {
    setEditingReminder(r.id);
    setEditTitle(r.title);
    setEditTime(r.time);
  };

  const saveEditReminder = () => {
    if (!editingReminder || !editTitle.trim()) return;
    updateReminder(editingReminder, { title: editTitle.trim(), time: editTime });
    setEditingReminder(null);
  };

  const markComplete = (r: typeof reminders[0]) => {
    updateReminder(r.id, { completed: true, completed_at: new Date().toISOString() });
  };

  const activeReminders = reminders.filter(r => !r.completed);

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <button onClick={() => setShowForm(!showForm)} className="p-3 rounded-full bg-soft-pink/20 hover:bg-soft-pink/30 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label={showForm ? 'Close form' : 'Add reminder'}>
          {showForm ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFormType('medication')} className={`flex-1 min-h-[44px] rounded-xl font-medium transition-colors ${formType === 'medication' ? 'bg-soft-pink/20 text-foreground' : 'text-muted-foreground'}`}>Medicine</button>
            <button onClick={() => setFormType('routine')} className={`flex-1 min-h-[44px] rounded-xl font-medium transition-colors ${formType === 'routine' ? 'bg-soft-pink/20 text-foreground' : 'text-muted-foreground'}`}>Routine</button>
          </div>

          {formType === 'medication' ? (
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
                      <button onClick={() => setTimes(prev => prev.filter((_, j) => j !== i))} className="p-2 text-destructive min-w-[44px] min-h-[44px] flex items-center justify-center"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setTimes(prev => [...prev, '12:00'])} className="text-sm text-soft-pink hover:underline min-h-[44px]">+ Add time</button>
              </div>
              <input value={prescriber} onChange={e => setPrescriber(e.target.value)} placeholder="Prescriber" className="input-glass w-full" />
              <button onClick={handleAddMedication} className="btn-primary w-full min-h-[48px]">Add Medication</button>
            </div>
          ) : (
            <div className="space-y-3">
              <input value={routineTitle} onChange={e => setRoutineTitle(e.target.value)} placeholder="Reminder title" className="input-glass w-full" />
              <select value={routineCategory} onChange={e => setRoutineCategory(e.target.value)} className="input-glass w-full">
                <option value="routine">Daily Routine</option>
                <option value="appointment">Appointment</option>
                <option value="exercise">Exercise</option>
                <option value="meal">Meal Time</option>
                <option value="other">Other</option>
              </select>
              <input type="time" value={routineTime} onChange={e => setRoutineTime(e.target.value)} className="input-glass w-full" />
              <select value={routineRepeat} onChange={e => setRoutineRepeat(e.target.value)} className="input-glass w-full">
                <option value="once">Once</option>
                <option value="daily">Every Day</option>
                <option value="weekly">Every Week</option>
              </select>
              <button onClick={handleAddRoutine} className="btn-secondary w-full min-h-[48px]">Save Reminder</button>
            </div>
          )}
        </GlassCard>
      )}

      {activeReminders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Bell size={20} /> Active Reminders</h2>
          <div className="space-y-2">
            {activeReminders.map(r => (
              <GlassCard key={r.id} className="p-3">
                {editingReminder === r.id ? (
                  <div className="space-y-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="input-glass w-full text-sm" />
                    <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="input-glass w-full text-sm" />
                    <div className="flex gap-2">
                      <button onClick={saveEditReminder} className="btn-primary flex-1 text-sm min-h-[40px]">Save</button>
                      <button onClick={() => setEditingReminder(null)} className="text-sm text-muted-foreground min-h-[40px] px-3">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {r.category === 'medication' ? <Pill size={18} className="text-soft-pink" /> : <Calendar size={18} className="text-sky-blue" />}
                      <div>
                        <p className="font-medium text-sm">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.time} - {r.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditReminder(r)} className="p-2 rounded-full hover:bg-muted transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Edit reminder">
                        <Pencil size={14} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDeleteReminder(r.id)} className={`p-2 rounded-full hover:bg-destructive/10 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${confirmDeleteReminder === r.id ? 'text-destructive' : 'text-muted-foreground'}`} aria-label="Delete reminder">
                        {confirmDeleteReminder === r.id ? <X size={14} /> : <Trash2 size={14} />}
                      </button>
                      <button onClick={() => markComplete(r)} className="p-2 rounded-full hover:bg-mint/20 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Mark as done">
                        <Check size={18} className="text-mint" />
                      </button>
                    </div>
                  </div>
                )}
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
                  <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                  <div className="flex gap-2 mt-1">
                    {med.times.map((t, i) => <span key={i} className="pill-badge text-xs">{t}</span>)}
                  </div>
                  {med.prescriber && <p className="text-xs text-muted-foreground mt-1">Prescribed by {med.prescriber}</p>}
                </div>
                {canEdit(med.created_by) && (
                  <button onClick={() => handleDelete(med)} className={`p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${confirmDelete === med.id ? 'text-destructive' : 'text-destructive/60 hover:text-destructive'}`} aria-label="Delete medication">
                    {confirmDelete === med.id ? <X size={16} /> : <Trash2 size={16} />}
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
