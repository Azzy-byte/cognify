import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Search, Filter, Play, Pause, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { Memory } from '@/types';

const categories = ['All', 'Family', 'Social', 'Health', 'General'] as const;

const MemoriesPage = () => {
  const { memories, people } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = memories.filter(m => {
    if (category !== 'All' && m.category !== category.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.summary.toLowerCase().includes(q) ||
        m.people.some(p => p.toLowerCase().includes(q)) ||
        m.conversation.some(c => c.text.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <h1 className="text-2xl font-bold mb-4">📚 Memories</h1>

      <GlassCard className="p-3 flex items-center gap-2 mb-4">
        <Search size={20} className="text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search memories, people..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </GlassCard>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`pill-badge whitespace-nowrap transition-all duration-300 ${category === c ? 'bg-lavender/30 text-foreground' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center"><p className="text-muted-foreground">No memories found</p></GlassCard>
      ) : (
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
          {filtered.map(memory => (
            <GlassCard key={memory.id} hover className="p-4 break-inside-avoid" onClick={() => setSelectedMemory(memory)}>
              {memory.image_urls.length > 0 && (
                <img src={memory.image_urls[0]} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />
              )}
              {memory.audio_url && (
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Play size={14} /> Audio recording
                </div>
              )}
              <p className="font-medium mb-2 line-clamp-3">{memory.summary}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {memory.people.map(p => (
                  <span key={p} className="pill-badge text-xs">👤 {p}</span>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="pill-badge">{memory.category}</span>
                <span>{new Date(memory.created_at).toLocaleDateString()}</span>
              </div>

              {expandedId === memory.id && (
                <div className="mt-3 pt-3 border-t border-border space-y-2 animate-fade-in">
                  {memory.conversation.map((msg, i) => (
                    <div key={i} className={`text-sm ${msg.role === 'assistant' ? 'text-muted-foreground' : ''}`}>
                      <span className="font-medium">{msg.role === 'user' ? '🧑' : '🤖'}</span> {msg.text}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={e => { e.stopPropagation(); setExpandedId(expandedId === memory.id ? null : memory.id); }}
                className="mt-2 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              >
                {expandedId === memory.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expandedId === memory.id ? 'Less' : 'Full conversation'}
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedMemory(null)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <GlassCard className="relative p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">{selectedMemory.summary}</h3>
            {selectedMemory.image_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedMemory.image_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="rounded-xl w-full h-32 object-cover" />
                ))}
              </div>
            )}
            <div className="space-y-3 mb-4">
              {selectedMemory.conversation.map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl ${msg.role === 'user' ? 'bg-lavender/10' : 'bg-muted/50'}`}>
                  <span className="text-xs font-medium text-muted-foreground">{msg.role === 'user' ? '🧑 You' : '🤖 Cognify'}</span>
                  <p className="mt-1">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMemory.people.map(p => <span key={p} className="pill-badge">👤 {p}</span>)}
              <span className="pill-badge">{selectedMemory.category}</span>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
