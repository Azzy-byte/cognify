import { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, X, Pencil, Trash2, Plus } from 'lucide-react';
import type { Memory } from '@/types';

const categories = ['All', 'Family', 'Social', 'Health', 'General'] as const;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const MemoriesPage = () => {
  const { memories, currentUser, canEdit, addMemory, updateMemory, deleteMemory, addAuditEntry } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState<Memory['category']>('general');
  const [formPeople, setFormPeople] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => memories.filter(m => {
    if (category !== 'All' && m.category !== category.toLowerCase()) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return m.summary.toLowerCase().includes(q) ||
        m.people.some(p => p.toLowerCase().includes(q));
    }
    return true;
  }), [memories, category, debouncedSearch]);

  const handleAdd = () => {
    if (!formSummary.trim()) return;
    addMemory({
      conversation: [],
      summary: formSummary.trim(),
      image_urls: [],
      people: formPeople.split(',').map(p => p.trim()).filter(Boolean),
      category: formCategory,
      created_by: currentUser.id,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'memory_created',
      target_type: 'memory',
      target_id: '',
      new_value: { summary: formSummary },
    });
    setFormSummary('');
    setFormPeople('');
    setFormCategory('general');
    setShowAdd(false);
  };

  const startEdit = (m: Memory) => {
    setEditingId(m.id);
    setFormSummary(m.summary);
    setFormCategory(m.category);
    setFormPeople(m.people.join(', '));
    setSelectedMemory(null);
  };

  const saveEdit = () => {
    if (!editingId || !formSummary.trim()) return;
    updateMemory(editingId, {
      summary: formSummary.trim(),
      category: formCategory,
      people: formPeople.split(',').map(p => p.trim()).filter(Boolean),
      updated_by: currentUser.id,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'memory_updated',
      target_type: 'memory',
      target_id: editingId,
    });
    setEditingId(null);
    setFormSummary('');
    setFormPeople('');
  };

  const handleDelete = useCallback((memoryId: string) => {
    if (confirmDelete !== memoryId) {
      setConfirmDelete(memoryId);
      return;
    }
    deleteMemory(memoryId);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'memory_deleted',
      target_type: 'memory',
      target_id: memoryId,
    });
    setConfirmDelete(null);
    setSelectedMemory(null);
  }, [confirmDelete, currentUser, addAuditEntry, deleteMemory]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Memories</h1>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} className="p-3 rounded-full bg-soft-pink/20 hover:bg-soft-pink/30 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Add memory">
          {showAdd ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>

      {/* Add / Edit form */}
      {(showAdd || editingId) && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <h3 className="font-semibold mb-3">{editingId ? 'Edit Memory' : 'Add Memory'}</h3>
          <div className="space-y-3">
            <textarea value={formSummary} onChange={e => setFormSummary(e.target.value)} placeholder="What happened?" className="input-glass w-full min-h-[80px] resize-none" />
            <input value={formPeople} onChange={e => setFormPeople(e.target.value)} placeholder="People involved (comma separated)" className="input-glass w-full" />
            <select value={formCategory} onChange={e => setFormCategory(e.target.value as Memory['category'])} className="input-glass w-full">
              <option value="general">General</option>
              <option value="family">Family</option>
              <option value="social">Social</option>
              <option value="health">Health</option>
            </select>
            <button onClick={editingId ? saveEdit : handleAdd} className="btn-primary w-full min-h-[48px]">
              {editingId ? 'Save Changes' : 'Add Memory'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setFormSummary(''); setFormPeople(''); }} className="w-full text-sm text-muted-foreground min-h-[44px]">Cancel</button>
            )}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-3 flex items-center gap-2 mb-4">
        <Search size={20} className="text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search memories, people..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-h-[48px]"
        />
      </GlassCard>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`pill-badge whitespace-nowrap transition-colors duration-200 min-h-[40px] ${category === c ? 'bg-soft-pink/30 text-foreground' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center"><p className="text-muted-foreground">No memories yet. Add your first one!</p></GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(memory => (
            <GlassCard key={memory.id} className="p-4 cursor-pointer glass-card-hover" onClick={() => setSelectedMemory(memory)}>
              <p className="font-medium line-clamp-2">{memory.summary}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {memory.people.map(p => (
                  <span key={p} className="pill-badge text-xs">{p}</span>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                <span className="pill-badge">{memory.category}</span>
                <span>{timeAgo(memory.created_at)}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => { setSelectedMemory(null); setConfirmDelete(null); }}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div className="relative glass-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in" style={{ borderRadius: 'var(--radius-lg)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedMemory(null); setConfirmDelete(null); }} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-2 pr-10">{selectedMemory.summary}</h3>

            {selectedMemory.conversation.length > 0 && (
              <div className="mb-4 p-3 bg-muted/20 rounded-xl">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedMemory.conversation.filter(m => m.role === 'user').map(m => m.text).join('. ')}.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedMemory.people.map(p => <span key={p} className="pill-badge">{p}</span>)}
              <span className="pill-badge">{selectedMemory.category}</span>
              <span className="pill-badge">{timeAgo(selectedMemory.created_at)}</span>
            </div>

            {canEdit(selectedMemory.created_by) && (
              <div className="flex gap-2">
                <button onClick={() => startEdit(selectedMemory)} className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]">
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedMemory.id)}
                  className={`min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl transition-colors ${
                    confirmDelete === selectedMemory.id ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive'
                  }`}
                  aria-label={confirmDelete === selectedMemory.id ? 'Confirm delete' : 'Delete memory'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
