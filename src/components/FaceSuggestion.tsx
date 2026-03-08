import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import { generatePerceptualHash, findMatch, type MatchResult } from '@/lib/phash';
import { User, Check, X, UserPlus } from 'lucide-react';

interface FaceSuggestionProps {
  imageUrls: string[];
  memoryId: string;
  existingPeople: string[];
}

interface Suggestion {
  imageUrl: string;
  hash: string;
  match: MatchResult;
  confirmed: boolean;
  dismissed: boolean;
}

const FaceSuggestion = ({ imageUrls, memoryId, existingPeople }: FaceSuggestionProps) => {
  const { people, updatePerson, addPerson, updateMemory, addAuditEntry, currentUser } = useApp();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingNewForIndex, setAddingNewForIndex] = useState<number | null>(null);

  useEffect(() => {
    if (imageUrls.length === 0) return;
    let active = true;

    const analyze = async () => {
      setLoading(true);
      const results: Suggestion[] = [];

      for (const url of imageUrls.slice(0, 6)) {
        try {
          const hash = await generatePerceptualHash(url);
          const match = findMatch(hash, people);
          // Only show suggestion if recognized and not already tagged
          if (match.recognized && match.name && !existingPeople.includes(match.name)) {
            results.push({ imageUrl: url, hash, match, confirmed: false, dismissed: false });
          } else if (!match.recognized) {
            results.push({ imageUrl: url, hash, match: { recognized: false }, confirmed: false, dismissed: false });
          }
        } catch {
          // skip failed hashes
        }
      }

      if (active) {
        setSuggestions(results);
        setLoading(false);
      }
    };

    void analyze();
    return () => { active = false; };
  }, [imageUrls, people, existingPeople]);

  const confirmSuggestion = useCallback((index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion?.match?.name) return;

    const person = people.find(
      (p) => p.id === suggestion.match.personId || p.name.toLowerCase() === suggestion.match.name!.toLowerCase()
    );

    if (person) {
      const newHashes = [...new Set([...(person.photo_hashes || []), suggestion.hash])];
      const newPhotoUrls = person.photo_urls.includes(suggestion.imageUrl)
        ? person.photo_urls
        : [...person.photo_urls, suggestion.imageUrl];
      updatePerson(person.id, {
        photo_hashes: newHashes,
        photo_urls: newPhotoUrls,
        times_mentioned: person.times_mentioned + 1,
      });
    }

    // Also tag the person in the memory if not already there
    if (!existingPeople.includes(suggestion.match.name!)) {
      updateMemory(memoryId, {
        people: [...existingPeople, suggestion.match.name!],
      });
    }

    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'face_confirmed',
      target_type: 'person',
      target_id: person?.id || '',
      new_value: { name: suggestion.match.name, memoryId },
    });

    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, confirmed: true } : s))
    );
  }, [suggestions, people, updatePerson, updateMemory, existingPeople, memoryId, addAuditEntry, currentUser]);

  const dismissSuggestion = useCallback((index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, dismissed: true } : s))
    );
  }, []);

  const addNewPersonFromSuggestion = useCallback((index: number) => {
    const suggestion = suggestions[index];
    if (!newName.trim() || !suggestion) return;

    addPerson({
      name: newName.trim(),
      relationship: 'Unknown',
      photo_urls: [suggestion.imageUrl],
      photo_hashes: [suggestion.hash],
      times_mentioned: 1,
    });

    if (!existingPeople.includes(newName.trim())) {
      updateMemory(memoryId, {
        people: [...existingPeople, newName.trim()],
      });
    }

    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'person_added',
      target_type: 'person',
      target_id: '',
      new_value: { name: newName.trim(), source: 'memory_suggestion', memoryId },
    });

    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, confirmed: true } : s))
    );
    setNewName('');
    setAddingNewForIndex(null);
  }, [suggestions, newName, addPerson, updateMemory, existingPeople, memoryId, addAuditEntry, currentUser]);

  const activeSuggestions = suggestions.filter((s) => !s.confirmed && !s.dismissed);

  if (loading) {
    return (
      <div className="mb-4 p-3 bg-lavender/10 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Scanning for faces…</p>
        </div>
      </div>
    );
  }

  if (activeSuggestions.length === 0 && suggestions.some((s) => s.confirmed)) {
    return (
      <div className="mb-4 p-3 bg-mint/10 rounded-xl flex items-center gap-2">
        <Check size={16} className="text-mint" />
        <p className="text-xs text-muted-foreground">All faces confirmed!</p>
      </div>
    );
  }

  if (activeSuggestions.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <User size={14} /> Who's in these photos?
      </p>
      {suggestions.map((suggestion, index) => {
        if (suggestion.confirmed || suggestion.dismissed) return null;
        const isRecognized = suggestion.match.recognized;

        return (
          <div key={index} className="flex items-center gap-3 p-3 bg-soft-pink/10 rounded-xl">
            <img
              src={suggestion.imageUrl}
              alt="Face"
              className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-soft-pink/30"
            />
            <div className="flex-1 min-w-0">
              {isRecognized ? (
                <>
                  <p className="text-sm font-medium text-foreground truncate">
                    Is this <span className="text-soft-pink">{suggestion.match.name}</span>?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.match.confidence}% match · {suggestion.match.relationship}
                  </p>
                </>
              ) : addingNewForIndex === index ? (
                <div className="flex gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter name"
                    className="input-glass text-sm flex-1 min-h-[36px]"
                    onKeyDown={(e) => e.key === 'Enter' && addNewPersonFromSuggestion(index)}
                    autoFocus
                  />
                  <button
                    onClick={() => addNewPersonFromSuggestion(index)}
                    className="p-2 rounded-lg bg-soft-pink/20 hover:bg-soft-pink/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Save person"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => { setAddingNewForIndex(null); setNewName(''); }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unknown person</p>
              )}
            </div>
            {isRecognized ? (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => confirmSuggestion(index)}
                  className="p-2 rounded-lg bg-mint/20 hover:bg-mint/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Confirm"
                >
                  <Check size={16} className="text-mint" />
                </button>
                <button
                  onClick={() => dismissSuggestion(index)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Not them"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            ) : addingNewForIndex !== index ? (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setAddingNewForIndex(index); setNewName(''); }}
                  className="p-2 rounded-lg bg-lavender/20 hover:bg-lavender/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Add as new person"
                >
                  <UserPlus size={16} className="text-lavender" />
                </button>
                <button
                  onClick={() => dismissSuggestion(index)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Skip"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default FaceSuggestion;
