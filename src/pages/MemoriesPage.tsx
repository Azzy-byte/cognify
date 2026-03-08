import { useState, useMemo } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Play, Pause, X } from 'lucide-react';
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
  const { memories } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

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

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <h1 className="text-2xl font-bold mb-4">Memories</h1>

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
            className={`pill-badge whitespace-nowrap transition-colors duration-200 min-h-[40px] ${category === c ? 'bg-lavender/30 text-foreground' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center"><p className="text-muted-foreground">No memories found</p></GlassCard>
      ) : (
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
          {filtered.map(memory => (
            <div key={memory.id} className="break-inside-avoid" onClick={() => setSelectedMemory(memory)}>
              <div className="glass-card-hover overflow-hidden cursor-pointer">
                {/* Photo with gradient overlay */}
                {memory.image_urls.length > 0 ? (
                  <div className="relative">
                    <img
                      src={memory.image_urls[0]}
                      alt={memory.summary}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <p className="absolute bottom-3 left-3 right-3 text-card font-medium text-sm line-clamp-2">
                      {memory.summary}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 pb-2">
                    <p className="font-medium line-clamp-3">{memory.summary}</p>
                  </div>
                )}

                {/* Audio player */}
                {memory.audio_url && (
                  <div className="px-4 py-2 flex items-center gap-2 border-t border-border">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlayingAudio(playingAudio === memory.id ? null : memory.id); }}
                      className="p-2 rounded-full bg-lavender/20 min-w-[40px] min-h-[40px] flex items-center justify-center"
                      aria-label={playingAudio === memory.id ? 'Pause audio' : 'Play audio'}
                    >
                      {playingAudio === memory.id ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-lavender/40 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                )}

                {/* Tags & metadata */}
                <div className="p-4 pt-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {memory.people.map(p => (
                      <span key={p} className="pill-badge text-xs">{p}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="pill-badge">{memory.category}</span>
                    <span>{timeAgo(memory.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedMemory(null)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div className="relative glass-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in" style={{ borderRadius: 'var(--radius-lg)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} />
            </button>

            {/* Photo gallery */}
            {selectedMemory.image_urls.length > 0 && (
              <div className={`gap-2 mb-4 ${selectedMemory.image_urls.length > 1 ? 'grid grid-cols-2' : ''}`}>
                {selectedMemory.image_urls.map((url, i) => (
                  <img key={i} src={url} alt={`Memory photo ${i + 1}`} className="w-full h-48 object-cover" style={{ borderRadius: 'var(--radius-md)' }} loading="lazy" />
                ))}
              </div>
            )}

            {/* Audio player */}
            {selectedMemory.audio_url && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-xl">
                <button className="p-3 rounded-full bg-lavender/20 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Play audio">
                  <Play size={20} />
                </button>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-lavender/40 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <h3 className="text-lg font-bold mb-4">{selectedMemory.summary}</h3>

            {/* People & metadata */}
            <div className="flex flex-wrap gap-2">
              {selectedMemory.people.map(p => <span key={p} className="pill-badge">{p}</span>)}
              <span className="pill-badge">{selectedMemory.category}</span>
              <span className="pill-badge">{timeAgo(selectedMemory.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
