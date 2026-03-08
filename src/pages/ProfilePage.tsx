import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { User, Pencil, Check, Trash2, X, Plus, Users, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, updateCurrentUser, people, updatePerson, deletePerson, contacts, familyMembers, memories, addAuditEntry } = useApp();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [confirmDeletePerson, setConfirmDeletePerson] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonRel, setEditPersonRel] = useState('');

  const saveProfile = () => {
    updateCurrentUser({ name: name.trim(), email: email.trim() });
    setEditingProfile(false);
  };

  const startEditPerson = (p: typeof people[0]) => {
    setEditingPerson(p.id);
    setEditPersonName(p.name);
    setEditPersonRel(p.relationship);
  };

  const saveEditPerson = () => {
    if (!editingPerson || !editPersonName.trim()) return;
    updatePerson(editingPerson, { name: editPersonName.trim(), relationship: editPersonRel.trim() });
    setEditingPerson(null);
  };

  const handleDeletePerson = (id: string) => {
    if (confirmDeletePerson !== id) { setConfirmDeletePerson(id); return; }
    deletePerson(id);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'person_deleted',
      target_type: 'person',
      target_id: id,
    });
    setConfirmDeletePerson(null);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('cognify_data');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
      </div>

      {/* Profile Card */}
      <GlassCard className="p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-soft-pink/20 flex items-center justify-center">
            <User size={32} className="text-soft-pink" />
          </div>
          <div className="flex-1">
            {editingProfile ? (
              <div className="space-y-2">
                <input value={name} onChange={e => setName(e.target.value)} className="input-glass w-full text-sm" placeholder="Your name" />
                <input value={email} onChange={e => setEmail(e.target.value)} className="input-glass w-full text-sm" placeholder="Email" type="email" />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold">{currentUser.name || 'No name set'}</h2>
                <p className="text-sm text-muted-foreground">{currentUser.email || 'No email set'}</p>
              </>
            )}
          </div>
        </div>
        {editingProfile ? (
          <div className="flex gap-2">
            <button onClick={saveProfile} className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[44px] text-sm"><Check size={16} /> Save</button>
            <button onClick={() => setEditingProfile(false)} className="text-sm text-muted-foreground min-h-[44px] px-4">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditingProfile(true)} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm"><Pencil size={16} /> Edit Profile</button>
        )}
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-soft-pink">{memories.length}</p>
          <p className="text-xs text-muted-foreground">Memories</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-sky-blue">{people.length}</p>
          <p className="text-xs text-muted-foreground">People</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-mint">{contacts.length}</p>
          <p className="text-xs text-muted-foreground">Contacts</p>
        </GlassCard>
      </div>

      {/* Known People */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Users size={20} /> Known People</h2>
        {people.length === 0 ? (
          <GlassCard className="p-4 text-center">
            <p className="text-muted-foreground text-sm">No people added yet. Use the Camera to add people.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {people.map(p => (
              <GlassCard key={p.id} className="p-3">
                {editingPerson === p.id ? (
                  <div className="space-y-2">
                    <input value={editPersonName} onChange={e => setEditPersonName(e.target.value)} className="input-glass w-full text-sm" placeholder="Name" />
                    <input value={editPersonRel} onChange={e => setEditPersonRel(e.target.value)} className="input-glass w-full text-sm" placeholder="Relationship" />
                    <div className="flex gap-2">
                      <button onClick={saveEditPerson} className="btn-primary flex-1 text-sm min-h-[40px]">Save</button>
                      <button onClick={() => setEditingPerson(null)} className="text-sm text-muted-foreground min-h-[40px] px-3">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-soft-pink/20 flex items-center justify-center overflow-hidden">
                        {p.photo_urls.length > 0 ? (
                          <img src={p.photo_urls[0]} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User size={16} className="text-soft-pink" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.relationship} · {p.photo_hashes.length} photo(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditPerson(p)} className="p-2 rounded-full hover:bg-muted min-w-[40px] min-h-[40px] flex items-center justify-center"><Pencil size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => handleDeletePerson(p.id)} className={`p-2 rounded-full hover:bg-destructive/10 min-w-[40px] min-h-[40px] flex items-center justify-center ${confirmDeletePerson === p.id ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {confirmDeletePerson === p.id ? <X size={14} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <GlassCard className="p-4">
        <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2"><Shield size={18} /> Data Management</h3>
        <p className="text-sm text-muted-foreground mb-3">Clear all app data and start fresh.</p>
        <button onClick={clearAllData} className="btn-danger w-full min-h-[48px]">Clear All Data</button>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
