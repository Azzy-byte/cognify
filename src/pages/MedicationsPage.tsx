import { useState, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Plus, Pill, Clock, Trash2, Check, Bell, X, Calendar, Pencil, AlertTriangle, ShieldAlert, Package } from 'lucide-react';
import { checkInteractions, checkDuplicates, checkDoseChange, type InteractionAlert, type DuplicateAlert } from '@/lib/medicationInteractions';

const InteractionWarning = ({
  interactions,
  duplicates,
  onConfirm,
  onCancel,
}: {
  interactions: InteractionAlert[];
  duplicates: DuplicateAlert[];
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const hasHigh = interactions.some(a => a.severity === 'high');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        className="relative glass-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
        style={{ borderRadius: 'var(--radius-lg)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasHigh ? 'bg-destructive/15' : 'bg-peach/20'}`}>
            <ShieldAlert size={24} className={hasHigh ? 'text-destructive' : 'text-foreground'} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Medication Alert</h3>
            <p className="text-sm text-muted-foreground">
              {interactions.length + duplicates.length} potential {interactions.length + duplicates.length === 1 ? 'issue' : 'issues'} found
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {duplicates.map((d, i) => (
            <div key={`dup-${i}`} className="p-3 bg-destructive/10 border border-destructive/20 text-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-foreground">{d.message}</p>
              </div>
            </div>
          ))}

          {interactions.map((alert, i) => (
            <div
              key={`int-${i}`}
              className={`p-3 border text-sm ${
                alert.severity === 'high'
                  ? 'bg-destructive/10 border-destructive/20'
                  : 'bg-peach/10 border-peach/20'
              }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${alert.severity === 'high' ? 'text-destructive' : 'text-peach'}`} />
                <div>
                  <p className="font-medium text-foreground mb-0.5">
                    {alert.drugA} + {alert.drugB}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      alert.severity === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-peach/20 text-foreground'
                    }`}>
                      {alert.severity === 'high' ? 'High Risk' : 'Moderate'}
                    </span>
                  </p>
                  <p className="text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-primary flex-1 min-h-[48px]">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 min-h-[48px] font-semibold transition-colors active:scale-95 ${
              hasHigh
                ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                : 'bg-peach/15 text-foreground hover:bg-peach/25'
            }`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

const DoseChangeWarning = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
    <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
    <div
      className="relative glass-card p-6 max-w-md w-full animate-scale-in"
      style={{ borderRadius: 'var(--radius-lg)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-peach/20 flex items-center justify-center">
          <AlertTriangle size={24} className="text-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Dosage Change Alert</h3>
      </div>
      <p className="text-sm text-foreground mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-primary flex-1 min-h-[48px]">Cancel</button>
        <button onClick={onConfirm} className="flex-1 min-h-[48px] bg-peach/15 text-foreground font-semibold hover:bg-peach/25 transition-colors active:scale-95" style={{ borderRadius: 'var(--radius-sm)' }}>
          Confirm Change
        </button>
      </div>
    </div>
  </div>
);

const MedicationsPage = () => {
  const { medications, reminders, currentUser, addMedication, updateMedication, deleteMedication, addReminder, updateReminder, deleteReminder, addAuditEntry, canEdit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'medication' | 'routine'>('medication');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [prescriber, setPrescriber] = useState('');
  const [supplyQty, setSupplyQty] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState<string | null>(null);

  // Edit medication state
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [editMedName, setEditMedName] = useState('');
  const [editMedDosage, setEditMedDosage] = useState('');

  // Interaction alerts
  const [pendingAlerts, setPendingAlerts] = useState<{ interactions: InteractionAlert[]; duplicates: DuplicateAlert[] } | null>(null);
  const [doseWarning, setDoseWarning] = useState<{ medId: string; newName: string; newDosage: string; message: string } | null>(null);

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

  const attemptAddMedication = () => {
    if (!name.trim()) return;

    const existingMeds = medications.map(m => ({ name: m.name, dosage: m.dosage }));
    const interactions = checkInteractions(name, existingMeds);
    const duplicates = checkDuplicates(name, existingMeds);

    if (interactions.length > 0 || duplicates.length > 0) {
      setPendingAlerts({ interactions, duplicates });
      return;
    }

    commitAddMedication();
  };

  const commitAddMedication = () => {
    setPendingAlerts(null);
    const dosesPerDay = times.length;
    const qty = supplyQty ? parseInt(supplyQty) : undefined;
    addMedication({
      name: name.trim(), dosage: dosage.trim(), frequency, times,
      prescriber: prescriber.trim(), start_date: new Date().toISOString().split('T')[0],
      created_by: currentUser.id, last_modified_by: currentUser.id,
      supply_quantity: qty,
      doses_per_day: dosesPerDay,
      supply_start_date: qty ? new Date().toISOString().split('T')[0] : undefined,
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
      new_value: { name, dosage, times, supply: qty },
    });
    setName(''); setDosage(''); setTimes(['08:00']); setPrescriber(''); setSupplyQty('');
    setShowForm(false);
  };

  const startEditMed = (med: typeof medications[0]) => {
    setEditingMed(med.id);
    setEditMedName(med.name);
    setEditMedDosage(med.dosage);
  };

  const attemptSaveEditMed = () => {
    if (!editingMed || !editMedName.trim()) return;

    const original = medications.find(m => m.id === editingMed);
    if (!original) return;

    // Check dose change
    const doseMsg = checkDoseChange(editMedName, original.dosage, editMedDosage);

    // Check interactions if name changed
    if (editMedName.toLowerCase() !== original.name.toLowerCase()) {
      const otherMeds = medications.filter(m => m.id !== editingMed).map(m => ({ name: m.name, dosage: m.dosage }));
      const interactions = checkInteractions(editMedName, otherMeds);
      if (interactions.length > 0) {
        setPendingAlerts({ interactions, duplicates: [] });
        return;
      }
    }

    if (doseMsg) {
      setDoseWarning({ medId: editingMed, newName: editMedName, newDosage: editMedDosage, message: doseMsg });
      return;
    }

    commitEditMed();
  };

  const commitEditMed = () => {
    if (!editingMed) return;
    updateMedication(editingMed, {
      name: editMedName.trim(),
      dosage: editMedDosage.trim(),
      last_modified_by: currentUser.id,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(), actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'medication_updated', target_type: 'medication', target_id: editingMed,
      new_value: { name: editMedName, dosage: editMedDosage },
    });
    setEditingMed(null);
    setDoseWarning(null);
    setPendingAlerts(null);
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
      {/* Interaction warning modal */}
      {pendingAlerts && (
        <InteractionWarning
          interactions={pendingAlerts.interactions}
          duplicates={pendingAlerts.duplicates}
          onConfirm={editingMed ? commitEditMed : commitAddMedication}
          onCancel={() => setPendingAlerts(null)}
        />
      )}

      {/* Dose change warning modal */}
      {doseWarning && (
        <DoseChangeWarning
          message={doseWarning.message}
          onConfirm={commitEditMed}
          onCancel={() => setDoseWarning(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
        <button onClick={() => setShowForm(!showForm)} className="p-3 rounded-full bg-soft-pink/20 hover:bg-soft-pink/30 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95" aria-label={showForm ? 'Close form' : 'Add reminder'}>
          {showForm ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFormType('medication')} className={`flex-1 min-h-[44px] rounded-xl font-medium transition-colors active:scale-95 ${formType === 'medication' ? 'bg-soft-pink/20 text-foreground' : 'text-muted-foreground'}`}>Medicine</button>
            <button onClick={() => setFormType('routine')} className={`flex-1 min-h-[44px] rounded-xl font-medium transition-colors active:scale-95 ${formType === 'routine' ? 'bg-soft-pink/20 text-foreground' : 'text-muted-foreground'}`}>Routine</button>
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
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Supply quantity (optional)</label>
                <input type="number" value={supplyQty} onChange={e => setSupplyQty(e.target.value)} placeholder="e.g., 30 tablets" className="input-glass w-full" min="1" />
                <p className="text-xs text-muted-foreground mt-1">We will alert you when your supply is running low.</p>
              </div>
              <button onClick={attemptAddMedication} className="btn-primary w-full min-h-[48px] active:scale-95">Add Medication</button>
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
              <button onClick={handleAddRoutine} className="btn-secondary w-full min-h-[48px] active:scale-95">Save Reminder</button>
            </div>
          )}
        </GlassCard>
      )}

      {activeReminders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground"><Bell size={20} /> Active Reminders</h2>
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
                        <p className="font-medium text-sm text-foreground">{r.title}</p>
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

      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground"><Pill size={20} /> Medications</h2>
      {medications.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-soft-pink/15 flex items-center justify-center mx-auto mb-4">
            <Pill size={28} className="text-soft-pink" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No medications added</h3>
          <p className="text-muted-foreground text-sm">Add your medications to get interaction alerts and reminders.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {medications.map(med => (
            <GlassCard key={med.id} className="p-4">
              {editingMed === med.id ? (
                <div className="space-y-3 animate-fade-in">
                  <input value={editMedName} onChange={e => setEditMedName(e.target.value)} placeholder="Medication name" className="input-glass w-full" />
                  <input value={editMedDosage} onChange={e => setEditMedDosage(e.target.value)} placeholder="Dosage" className="input-glass w-full" />
                  <div className="flex gap-2">
                    <button onClick={attemptSaveEditMed} className="btn-primary flex-1 min-h-[44px] text-sm active:scale-95">Save</button>
                    <button onClick={() => setEditingMed(null)} className="text-sm text-muted-foreground min-h-[44px] px-4">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                    <div className="flex gap-2 mt-1">
                      {med.times.map((t, i) => <span key={i} className="pill-badge text-xs">{t}</span>)}
                    </div>
                    {med.prescriber && <p className="text-xs text-muted-foreground mt-1">Prescribed by {med.prescriber}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {canEdit(med.created_by) && (
                      <>
                        <button onClick={() => startEditMed(med)} className="p-2 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Edit medication">
                          <Pencil size={14} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(med)} className={`p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${confirmDelete === med.id ? 'text-destructive' : 'text-destructive/60 hover:text-destructive'}`} aria-label="Delete medication">
                          {confirmDelete === med.id ? <X size={16} /> : <Trash2 size={16} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
