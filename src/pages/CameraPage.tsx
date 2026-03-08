import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Camera, RotateCcw, User, Check, Trash2, X } from 'lucide-react';
import { generatePerceptualHash, findMatch, compareHashes, type MatchResult } from '@/lib/phash';

type DerivedMemoryPerson = { id: string; name: string; relationship: string; photo_hashes: string[] };

const STOP_WORD_NAMES = new Set([
  'I', 'Im', 'My', 'Me', 'We', 'You', 'He', 'She', 'They', 'It',
  'Today', 'Yesterday', 'Tomorrow', 'Morning', 'Evening', 'Night',
  'The', 'A', 'An', 'And', 'But', 'With', 'From', 'For', 'At', 'In', 'On',
]);

const extractCandidateNames = (text: string) => {
  const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) ?? [];
  return [...new Set(matches.filter(name => !STOP_WORD_NAMES.has(name)))].slice(0, 6);
};

const getMemoryNames = (memory: { people: string[]; summary: string; conversation: Array<{ role: string; text: string }> }) => {
  if (memory.people.length > 0) {
    return [...new Set(memory.people.map(p => p.trim()).filter(Boolean))];
  }

  const conversationText = memory.conversation
    .filter(msg => msg.role === 'user')
    .map(msg => msg.text)
    .join(' ');

  const inferred = extractCandidateNames(`${memory.summary} ${conversationText}`);
  return inferred;
};

const CameraPage = () => {
  const { people, memories, addPerson, updatePerson, deletePerson, addAuditEntry, currentUser } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');
  const [tagged, setTagged] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [confirmDeletePerson, setConfirmDeletePerson] = useState<string | null>(null);
  const [memoryHashesByPerson, setMemoryHashesByPerson] = useState<Record<string, string[]>>({});
  const [derivedMemoryPeople, setDerivedMemoryPeople] = useState<DerivedMemoryPerson[]>([]);
  const [hashingMemoryPhotos, setHashingMemoryPhotos] = useState(false);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    const buildMemoryHashes = async () => {
      setHashingMemoryPhotos(true);
      const next: Record<string, string[]> = {};
      const derivedByName = new Map<string, { id: string; name: string; relationship: string; photo_hashes: string[] }>();

      // Hash photos for known people from tagged memories / summary mention
      for (const person of people) {
        const relatedImages = memories
          .filter(m => m.people.includes(person.name) || m.summary.toLowerCase().includes(person.name.toLowerCase()))
          .flatMap(m => m.image_urls);

        const uniqueImages = [...new Set(relatedImages)].slice(0, 15);
        if (uniqueImages.length === 0) {
          next[person.id] = [];
          continue;
        }

        const hashResults = await Promise.allSettled(uniqueImages.map(url => generatePerceptualHash(url)));
        next[person.id] = hashResults
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map(result => result.value);
      }

      // Build recognisable people directly from memory tags/text (works even if People list is empty)
      for (const memory of memories) {
        if (!memory.image_urls.length) continue;
        const memoryNames = getMemoryNames(memory);
        if (!memoryNames.length) continue;

        const hashResults = await Promise.allSettled(
          [...new Set(memory.image_urls)].slice(0, 8).map(url => generatePerceptualHash(url))
        );
        const memoryHashes = hashResults
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map(result => result.value);

        for (const rawName of memoryNames) {
          const trimmedName = rawName.trim();
          if (!trimmedName) continue;
          const key = trimmedName.toLowerCase();
          const existing = derivedByName.get(key);
          const existingHashes = existing?.photo_hashes ?? [];

          derivedByName.set(key, {
            id: `memory-${key.replace(/\s+/g, '-')}`,
            name: existing?.name ?? trimmedName,
            relationship: 'From memories',
            photo_hashes: [...new Set([...existingHashes, ...memoryHashes])],
          });
        }
      }

      if (active) {
        setMemoryHashesByPerson(next);
        setDerivedMemoryPeople(Array.from(derivedByName.values()));
        setHashingMemoryPhotos(false);
      }
    };

    void buildMemoryHashes();

    return () => {
      active = false;
    };
  }, [people, memories]);

  // Build an extended people list that includes perceptual hashes from memories
  const getPeopleWithMemoryHashes = useCallback(() => {
    const knownPeople = people.map(person => ({
      ...person,
      photo_hashes: [...new Set([...(person.photo_hashes || []), ...(memoryHashesByPerson[person.id] || [])])],
    }));

    const knownNames = new Set(knownPeople.map(p => p.name.toLowerCase()));
    const memoryOnlyPeople = derivedMemoryPeople.filter(p => !knownNames.has(p.name.toLowerCase()));

    return [...knownPeople, ...memoryOnlyPeople];
  }, [people, memoryHashesByPerson, derivedMemoryPeople]);

  const startCamera = useCallback(async (nextFacing?: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const mode = nextFacing || facingMode;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;

      const playVideo = async () => {
        try {
          await video.play();
          streamRef.current = stream;
          setStreaming(true);
          setFacingMode(mode);
          setError(null);
        } catch {
          setError('Camera started but video preview failed.');
        }
      };

      if (video.readyState >= 2) await playVideo();
      else video.onloadedmetadata = () => { void playVideo(); };
    } catch (err) {
      if (nextFacing) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = videoRef.current;
          if (!video) return;
          video.srcObject = stream;
          await video.play();
          streamRef.current = stream;
          setStreaming(true);
          setError(null);
          return;
        } catch { /* fall through */ }
      }
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
      } else {
        setError('Could not access camera.');
      }
    }
  }, [facingMode]);

  const flipCamera = useCallback(() => {
    void startCamera(facingMode === 'user' ? 'environment' : 'user');
  }, [facingMode, startCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  }, []);

  const capture = useCallback(async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      setError('Camera not ready yet.'); return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhoto(dataUrl);
    stopCamera();

    setAnalyzing(true);
    try {
      const hash = await generatePerceptualHash(dataUrl);
      let extendedPeople = getPeopleWithMemoryHashes();

      // Fallback: if memory indexing is still cold, compute directly from memories now
      const hasAnyHashes = extendedPeople.some(p => (p.photo_hashes?.length || 0) > 0);
      if (!hasAnyHashes && memories.length > 0) {
        const derivedByName = new Map<string, DerivedMemoryPerson>();
        for (const memory of memories) {
          if (!memory.image_urls.length) continue;
          const memoryNames = getMemoryNames(memory);
          if (!memoryNames.length) continue;

          const hashResults = await Promise.allSettled(
            [...new Set(memory.image_urls)].slice(0, 8).map(url => generatePerceptualHash(url))
          );
          const memoryHashes = hashResults
            .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
            .map(result => result.value);

          for (const rawName of memoryNames) {
            const trimmedName = rawName.trim();
            if (!trimmedName) continue;
            const key = trimmedName.toLowerCase();
            const existing = derivedByName.get(key);
            derivedByName.set(key, {
              id: existing?.id ?? `memory-${key.replace(/\s+/g, '-')}`,
              name: existing?.name ?? trimmedName,
              relationship: existing?.relationship ?? 'From memories',
              photo_hashes: [...new Set([...(existing?.photo_hashes ?? []), ...memoryHashes])],
            });
          }
        }

        const knownNames = new Set(people.map(p => p.name.toLowerCase()));
        const memoryOnlyPeople = Array.from(derivedByName.values()).filter(p => !knownNames.has(p.name.toLowerCase()));
        extendedPeople = [
          ...people.map(person => ({
            ...person,
            photo_hashes: [...new Set([...(person.photo_hashes || []), ...(memoryHashesByPerson[person.id] || [])])],
          })),
          ...memoryOnlyPeople,
        ];
      }

      const result = findMatch(hash, extendedPeople);
      setMatchResult(result);
      if (!result.recognized) setShowForm(true);
    } catch {
      setShowForm(true);
      setMatchResult({ recognized: false });
    }
    setAnalyzing(false);
  }, [stopCamera, getPeopleWithMemoryHashes, memories, people, memoryHashesByPerson]);

  const confirmMatch = async () => {
    if (!matchResult?.name || !photo) return;
    const matchedName = matchResult.name;
    const person = people.find((p) =>
      p.id === matchResult.personId || p.name.toLowerCase() === matchedName.toLowerCase()
    );
    const hash = await generatePerceptualHash(photo);

    if (person) {
      updatePerson(person.id, {
        photo_urls: [...person.photo_urls, photo],
        photo_hashes: [...(person.photo_hashes || []), hash],
        times_mentioned: person.times_mentioned + 1,
      });
      setTagged(person.name);
    } else {
      addPerson({
        name: matchResult.name,
        relationship: matchResult.relationship || 'From memories',
        photo_urls: [photo],
        photo_hashes: [hash],
        times_mentioned: 1,
      });
      setTagged(matchResult.name);
    }

    setTimeout(() => reset(), 2000);
  };

  const denyMatch = () => { setMatchResult({ recognized: false }); setShowForm(true); };

  const getRelationshipValue = () => {
    if (relationship === 'Other' || relationship === '') return customRelationship.trim() || 'Unknown';
    return relationship;
  };

  const addNewPerson = async () => {
    if (!name.trim() || !photo) return;
    let hash = '';
    try { hash = await generatePerceptualHash(photo); } catch { /* empty */ }
    addPerson({
      name: name.trim(), relationship: getRelationshipValue(),
      photo_urls: [photo], photo_hashes: hash ? [hash] : [], times_mentioned: 1,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'person_added',
      target_type: 'person',
      target_id: '',
      new_value: { name: name.trim(), relationship: getRelationshipValue() },
    });
    setTagged(name.trim());
    setTimeout(() => reset(), 2000);
  };

  const handleDeletePerson = (id: string) => {
    if (confirmDeletePerson !== id) { setConfirmDeletePerson(id); return; }
    deletePerson(id);
    setConfirmDeletePerson(null);
  };

  const reset = () => {
    setPhoto(null); setMatchResult(null); setShowForm(false);
    setName(''); setRelationship(''); setCustomRelationship(''); setTagged(null); setAnalyzing(false); setError(null);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      <h1 className="text-2xl font-bold mb-4">Face Recognition</h1>

      {tagged ? (
        <GlassCard className="p-8 text-center animate-scale-in">
          <Check size={48} className="text-mint mx-auto mb-4" />
          <h2 className="text-xl font-bold">Tagged: {tagged}</h2>
          <p className="text-muted-foreground mt-2">Photo saved!</p>
        </GlassCard>
      ) : photo ? (
        <div className="space-y-4 animate-fade-in">
          <GlassCard className="overflow-hidden">
            <img src={photo} alt="Captured" className="w-full" style={{ borderRadius: 'var(--radius-md)' }} />
          </GlassCard>
          <button onClick={reset} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]"><RotateCcw size={18} /> Retake</button>

          {analyzing && (
            <GlassCard className="p-6 text-center animate-fade-in">
              <div className="w-8 h-8 border-2 border-soft-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Analyzing...</p>
            </GlassCard>
          )}

          {matchResult?.recognized && !tagged && (
            <GlassCard className="p-4 animate-fade-in">
              <h3 className="font-semibold mb-3">This is {matchResult.name} ({matchResult.relationship})</h3>
              <p className="text-sm text-muted-foreground mb-4">Confidence: {matchResult.confidence}%</p>
              <div className="flex gap-2">
                <button onClick={confirmMatch} className="btn-primary flex-1 min-h-[48px]">Correct</button>
                <button onClick={denyMatch} className="btn-pink flex-1 min-h-[48px]">Not them</button>
              </div>
            </GlassCard>
          )}

          {showForm && (
            <GlassCard className="p-4 animate-fade-in">
              <h3 className="font-semibold mb-3">Who is this?</h3>
              <div className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="input-glass w-full" />
                <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="input-glass w-full">
                  <option value="">Select relationship</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Grandchild">Grandchild</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Other">Other</option>
                </select>
                {(relationship === 'Other' || relationship === '') && (
                  <input
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    placeholder="Type relationship (e.g. Cousin, Uncle)"
                    className="input-glass w-full"
                  />
                )}
                <button onClick={addNewPerson} className="btn-pink w-full min-h-[48px]">Save Person</button>
              </div>
            </GlassCard>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <GlassCard className="overflow-hidden aspect-[4/3] flex items-center justify-center bg-foreground/5 relative">
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${streaming ? 'block' : 'hidden'}`} style={{ borderRadius: 'var(--radius-md)' }} />
            {!streaming && (
              <div className="text-center p-8">
                <Camera size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{error || 'Tap below to open your camera'}</p>
              </div>
            )}
          </GlassCard>

          {streaming ? (
            <div className="flex gap-2">
              <button onClick={capture} className="btn-pink flex-1 flex items-center justify-center gap-2 min-h-[48px]"><Camera size={20} /> Capture</button>
              <button onClick={flipCamera} className="btn-primary min-h-[48px] flex items-center justify-center gap-2 px-4"><RotateCcw size={18} /> Flip</button>
            </div>
          ) : (
            <button onClick={() => void startCamera()} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]"><Camera size={20} /> {error ? 'Try Again' : 'Open Camera'}</button>
          )}

          {/* Known People */}
          <GlassCard className="p-4">
            <h3 className="font-semibold mb-3">Known People ({people.length})</h3>
            {hashingMemoryPhotos && (
              <p className="text-xs text-muted-foreground mb-2">Indexing memory photos for recognition…</p>
            )}
            {people.length === 0 ? (
              <p className="text-muted-foreground text-sm">No people added yet. Capture a photo to add someone.</p>
            ) : (
              <div className="space-y-2">
                {people.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-soft-pink/20 flex items-center justify-center overflow-hidden">
                        {p.photo_urls.length > 0 ? (
                          <img src={p.photo_urls[0]} alt={p.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                        ) : (
                          <User size={16} className="text-soft-pink" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.relationship} · {new Set([...(p.photo_hashes || []), ...(memoryHashesByPerson[p.id] || [])]).size} face hash(es)</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeletePerson(p.id)} className={`p-2 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center ${confirmDeletePerson === p.id ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}>
                      {confirmDeletePerson === p.id ? <X size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CameraPage;
