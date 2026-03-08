import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Camera, RotateCcw, User, Check, X } from 'lucide-react';
import { generatePerceptualHash, findMatch, type MatchResult } from '@/lib/phash';

const CameraPage = () => {
  const { people, addPerson, updatePerson, addAuditEntry, currentUser } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [tagged, setTagged] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called directly from button click (user gesture required)
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings and try again.');
      } else {
        setError('Could not access camera. Please make sure your device has a camera and try again.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const capture = useCallback(async () => {
    if (!videoRef.current) return;
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
      const result = findMatch(hash, people);
      setMatchResult(result);
      if (!result.recognized) {
        setShowForm(true);
      }
    } catch {
      setShowForm(true);
      setMatchResult({ recognized: false });
    }
    setAnalyzing(false);
  }, [people, stopCamera]);

  const confirmMatch = async () => {
    if (!matchResult?.personId || !photo) return;
    const person = people.find(p => p.id === matchResult.personId);
    if (!person) return;

    const hash = await generatePerceptualHash(photo);
    updatePerson(person.id, {
      photo_urls: [...person.photo_urls, photo],
      photo_hashes: [...(person.photo_hashes || []), hash],
      times_mentioned: person.times_mentioned + 1,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'person_tagged',
      target_type: 'person',
      target_id: person.id,
      new_value: { name: person.name, photo_added: true },
    });
    setTagged(person.name);
    setTimeout(() => reset(), 2000);
  };

  const denyMatch = () => {
    setMatchResult({ recognized: false });
    setShowForm(true);
  };

  const addNewPerson = async () => {
    if (!name.trim() || !photo) return;
    let hash = '';
    try { hash = await generatePerceptualHash(photo); } catch { /* fallback */ }

    addPerson({
      name: name.trim(),
      relationship: relationship.trim() || 'Unknown',
      photo_urls: [photo],
      photo_hashes: hash ? [hash] : [],
      times_mentioned: 1,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'person_added',
      target_type: 'person',
      target_id: '',
      new_value: { name, relationship },
    });
    setTagged(name);
    setTimeout(() => reset(), 2000);
  };

  const reset = () => {
    setPhoto(null);
    setMatchResult(null);
    setShowForm(false);
    setName('');
    setRelationship('');
    setTagged(null);
    setAnalyzing(false);
    setError(null);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <h1 className="text-2xl font-bold mb-4">Face Recognition</h1>

      {tagged ? (
        <GlassCard className="p-8 text-center animate-scale-in">
          <Check size={48} className="text-mint mx-auto mb-4" />
          <h2 className="text-xl font-bold">Tagged: {tagged}</h2>
          <p className="text-muted-foreground mt-2">Photo saved successfully!</p>
        </GlassCard>
      ) : photo ? (
        <div className="space-y-4 animate-fade-in">
          <GlassCard className="overflow-hidden">
            <img src={photo} alt="Captured photo" className="w-full" style={{ borderRadius: 'var(--radius-md)' }} />
          </GlassCard>

          <div className="flex gap-2">
            <button onClick={reset} className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]">
              <RotateCcw size={18} /> Retake
            </button>
          </div>

          {analyzing && (
            <GlassCard className="p-6 text-center animate-fade-in">
              <div className="w-8 h-8 border-2 border-soft-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Analyzing photo...</p>
            </GlassCard>
          )}

          {matchResult?.recognized && !tagged && (
            <GlassCard className="p-4 animate-fade-in">
              <h3 className="font-semibold mb-3">
                This is {matchResult.name} ({matchResult.relationship})
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Confidence: {matchResult.confidence}%
              </p>
              <div className="flex gap-2">
                <button onClick={confirmMatch} className="btn-primary flex-1 min-h-[48px]">Correct</button>
                <button onClick={denyMatch} className="btn-pink flex-1 min-h-[48px]">Not them</button>
              </div>
            </GlassCard>
          )}

          {showForm && (
            <GlassCard className="p-4 animate-fade-in">
              <h3 className="font-semibold mb-3">I don't recognize this person yet</h3>
              <div className="space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="input-glass w-full" />
                <select value={relationship} onChange={e => setRelationship(e.target.value)} className="input-glass w-full">
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
                <button onClick={addNewPerson} className="btn-pink w-full min-h-[48px]">Save Person</button>
              </div>
            </GlassCard>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <GlassCard className="overflow-hidden aspect-[4/3] flex items-center justify-center bg-foreground/5">
            {streaming ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ borderRadius: 'var(--radius-md)' }} />
            ) : (
              <div className="text-center p-8">
                <Camera size={48} className="text-muted-foreground mx-auto mb-4" />
                {error ? (
                  <p className="text-muted-foreground mb-4">{error}</p>
                ) : (
                  <p className="text-muted-foreground mb-4">Tap the button below to open your camera</p>
                )}
              </div>
            )}
          </GlassCard>

          {streaming ? (
            <button onClick={capture} className="btn-pink w-full flex items-center justify-center gap-2 min-h-[48px]">
              <Camera size={20} /> Capture Photo
            </button>
          ) : (
            <button onClick={startCamera} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]">
              <Camera size={20} /> {error ? 'Try Again' : 'Open Camera'}
            </button>
          )}

          {people.length > 0 && (
            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">Known People ({people.length})</h3>
              <div className="space-y-2">
                {people.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-soft-pink/20 flex items-center justify-center overflow-hidden">
                      {p.photo_urls.length > 0 ? (
                        <img src={p.photo_urls[0]} alt={p.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                      ) : (
                        <User size={16} className="text-soft-pink" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraPage;
