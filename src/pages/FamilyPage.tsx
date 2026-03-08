import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import UserSwitcher from '@/components/UserSwitcher';
import { Plus, Phone, AlertTriangle, Trash2, Users, Shield, Eye, PenLine, ChevronRight, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FamilyPage = () => {
  const { contacts, familyMembers, users, currentUser, memories, auditLog,
    addContact, deleteContact, updateFamilyMember, addAuditEntry, canEdit } = useApp();
  const navigate = useNavigate();
  const [showAddContact, setShowAddContact] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [editingPerms, setEditingPerms] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim()) return;
    addContact({
      user_id: currentUser.id, name: name.trim(), phone: phone.trim(),
      relationship: '', is_emergency: isEmergency, added_by: currentUser.id,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'contact_added',
      target_type: 'contact', target_id: '',
      new_value: { name, phone, is_emergency: isEmergency },
    });
    setName(''); setPhone(''); setIsEmergency(false); setShowAddContact(false);
  };

  const handleDeleteContact = (c: typeof contacts[0]) => {
    if (!canEdit(c.added_by)) { alert("You can only delete contacts you created"); return; }
    if (confirmDelete !== c.id) { setConfirmDelete(c.id); return; }
    deleteContact(c.id);
    setConfirmDelete(null);
  };

  const togglePermission = (fm: typeof familyMembers[0], perm: 'can_view' | 'can_add' | 'can_edit') => {
    if (currentUser.role !== 'patient') { alert("Only patient can change permissions"); return; }
    const oldVal = fm[perm];
    updateFamilyMember(fm.id, { [perm]: !oldVal });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'permission_changed',
      target_type: 'family_member', target_id: fm.id,
      old_value: { [perm]: oldVal },
      new_value: { [perm]: !oldVal },
    });
  };

  const myMemories = memories.filter(m => m.created_by === currentUser.id).length;
  const recentAudit = auditLog.slice(0, 3);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Family & Friends</h1>
        <UserSwitcher />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-lavender">{memories.length}</p>
          <p className="text-xs text-muted-foreground">Memories</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-sky-blue">{myMemories}</p>
          <p className="text-xs text-muted-foreground">My Items</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-mint">{contacts.length}</p>
          <p className="text-xs text-muted-foreground">Contacts</p>
        </GlassCard>
      </div>

      {/* Family Members & Permissions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Shield size={20} /> Family Members</h2>
        <div className="space-y-2">
          {familyMembers.map(fm => {
            const user = users.find(u => u.id === fm.family_user_id);
            return (
              <GlassCard key={fm.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lavender/20 flex items-center justify-center font-bold text-lavender">
                      {user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{fm.relationship}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {fm.can_view && <span className="pill-badge text-xs"><Eye size={10} /> View</span>}
                    {fm.can_add && <span className="pill-badge text-xs"><Plus size={10} /> Add</span>}
                    {fm.can_edit && <span className="pill-badge text-xs"><PenLine size={10} /> Edit</span>}
                  </div>
                </div>
                {currentUser.role === 'patient' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <button onClick={() => setEditingPerms(editingPerms === fm.id ? null : fm.id)}
                      className="text-sm text-lavender flex items-center gap-1 min-h-[44px]">
                      Edit Permissions <ChevronRight size={14} className={`transition-transform ${editingPerms === fm.id ? 'rotate-90' : ''}`} />
                    </button>
                    {editingPerms === fm.id && (
                      <div className="mt-2 space-y-2 animate-fade-in">
                        {(['can_view', 'can_add', 'can_edit'] as const).map(perm => (
                          <label key={perm} className="flex items-center justify-between min-h-[44px]">
                            <span className="text-sm capitalize">{perm.replace('can_', 'Can ')}</span>
                            <button
                              onClick={() => togglePermission(fm, perm)}
                              className={`w-12 h-6 rounded-full transition-colors duration-200 ${fm[perm] ? 'bg-mint' : 'bg-muted'}`}
                              aria-label={`Toggle ${perm.replace('_', ' ')}`}
                            >
                              <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform duration-200 ${fm[perm] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Contacts */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Phone size={20} /> Contacts</h2>
        <button onClick={() => setShowAddContact(!showAddContact)} className="p-3 rounded-full bg-lavender/20 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label={showAddContact ? 'Close' : 'Add contact'}>
          {showAddContact ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAddContact && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="input-glass w-full" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="input-glass w-full" />
            <label className="flex items-center gap-2 cursor-pointer min-h-[48px]">
              <input type="checkbox" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)}
                className="w-5 h-5 rounded accent-destructive" />
              <span className="text-sm">Use as Emergency Contact (SOS)</span>
              <AlertTriangle size={16} className="text-destructive" />
            </label>
            <button onClick={handleAddContact} className="btn-pink w-full min-h-[48px]">Save Contact</button>
          </div>
        </GlassCard>
      )}

      <div className="space-y-2 mb-6">
        {contacts.map(c => (
          <GlassCard key={c.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-blue/20 flex items-center justify-center font-bold text-sky-blue">
                {c.name[0]}
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {c.name}
                  {c.is_emergency && <span className="text-xs bg-destructive/10 text-destructive rounded-full px-2 py-0.5">SOS</span>}
                </p>
                <p className="text-sm text-muted-foreground">{c.phone}</p>
              </div>
            </div>
            {canEdit(c.added_by) && (
              <button
                onClick={() => handleDeleteContact(c)}
                className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${confirmDelete === c.id ? 'text-destructive' : 'text-destructive/60 hover:text-destructive'}`}
                aria-label="Delete contact"
              >
                {confirmDelete === c.id ? <X size={16} /> : <Trash2 size={16} />}
              </button>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Clock size={20} /> Recent Activity</h2>
          <button onClick={() => navigate('/audit')} className="text-sm text-lavender min-h-[44px] flex items-center">View All</button>
        </div>
        <div className="space-y-2">
          {recentAudit.map(entry => (
            <GlassCard key={entry.id} className="p-3">
              <p className="text-sm">{entry.actor_name} <span className="text-muted-foreground">{entry.action_type.replace(/_/g, ' ')}</span></p>
              <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;
