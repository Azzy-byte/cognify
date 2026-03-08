import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import BrainCharacter from '@/components/BrainCharacter';
import { Send, Mic, ImagePlus, Save, X, Play, Square } from 'lucide-react';
import { streamChat } from '@/lib/streamChat';
import type { ChatMessage } from '@/types';

interface AudioRecording {
  url: string;
  dataUrl: string;
}

const ChatBubble = ({ msg, index }: { msg: ChatMessage; index: number }) => {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        opacity: 0,
        animation: `chat-slide-up 0.2s ease-out ${index * 0.05}s forwards`,
      }}
    >
      <div
        className={`max-w-[85%] px-5 py-3 ${
          isUser
            ? 'rounded-3xl rounded-br-lg bg-soft-pink/20'
            : 'glass-card rounded-3xl rounded-bl-lg'
        }`}
      >
        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
          {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
        {msg.image_urls && msg.image_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {msg.image_urls.map((url, j) => (
              <img
                key={j}
                src={url}
                alt="Shared photo"
                className="w-full h-20 object-cover"
                style={{ borderRadius: 'var(--radius-sm)' }}
                loading="lazy"
              />
            ))}
          </div>
        )}
        {msg.audio_urls && msg.audio_urls.length > 0 && (
          <div className="space-y-2 mt-2">
            {msg.audio_urls.map((url, j) => (
              <audio key={j} src={url} controls className="w-full h-8" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="glass-card rounded-3xl rounded-bl-lg px-5 py-3 flex gap-1.5">
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const ChatPage = () => {
  const { currentUser, people, memories, medications, reminders, contacts, safeZones, addMemory, addAuditEntry } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const buildAppContext = useCallback(() => {
    const medsList = medications.map(m => `${m.name} ${m.dosage} (${m.frequency}, ${m.times.join(', ')})`).join('; ');
    const peopleList = people.map(p => `${p.name} (${p.relationship})`).join('; ');
    const recentMems = memories.slice(0, 5).map(m => m.summary).join('; ');
    const contactsList = contacts.filter(c => c.is_emergency).map(c => `${c.name} (${c.relationship}) ${c.phone}`).join('; ');
    const zonesList = safeZones.map(z => z.name).join('; ');
    const remindersList = reminders.slice(0, 5).map(r => `${r.title} at ${r.time}`).join('; ');

    return {
      userName: currentUser.name || 'Friend',
      medications: medsList || 'None saved',
      people: peopleList || 'None saved',
      recentMemories: recentMems || 'None saved',
      contacts: contactsList || 'None set',
      safeZones: zonesList || 'None set',
      reminders: remindersList || 'None set',
    };
  }, [currentUser, medications, people, memories, contacts, safeZones, reminders]);

  const handleSend = useCallback(() => {
    if (!input.trim() && images.length === 0 && audioRecordings.length === 0) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      image_urls: images.length > 0 ? [...images] : undefined,
      audio_urls: audioRecordings.length > 0 ? audioRecordings.map(r => r.dataUrl) : undefined,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setImages([]);
    setStreaming(true);

    // Build message history for AI
    const aiMessages = newMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.text,
    }));

    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant' as const, text: assistantSoFar }];
      });
    };

    streamChat({
      messages: aiMessages,
      appContext: buildAppContext(),
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setStreaming(false),
      onError: (error) => {
        upsertAssistant(error || "I'm having trouble connecting. Please try again.");
      },
    });

    audioRecordings.forEach(rec => URL.revokeObjectURL(rec.url));
    setAudioRecordings([]);
  }, [input, images, messages, audioRecordings, buildAppContext]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const toggleVoice = useCallback(async () => {
    if (recording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : '';
            if (dataUrl) {
              setAudioRecordings(prev => [...prev, { url, dataUrl }]);
            } else {
              URL.revokeObjectURL(url);
            }
          };
          reader.readAsDataURL(blob);
        }
        audioChunksRef.current = [];
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone permissions.');
      } else {
        alert('Could not access microphone.');
      }
      setRecording(false);
    }
  }, [recording]);

  const removeAudio = (index: number) => {
    setAudioRecordings(prev => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const saveMemory = () => {
    if (messages.length < 2) return;
    const allPeople = people.filter(p =>
      messages.some(m => m.text.toLowerCase().includes(p.name.toLowerCase()))
    );
    const summary = messages.filter(m => m.role === 'user').map(m => m.text).join('. ').slice(0, 200);
    const allImages = messages.flatMap(m => m.image_urls || []).concat(images);
    const allAudioUrls = messages.flatMap(m => m.audio_urls || []);

    addMemory({
      conversation: messages,
      summary,
      image_urls: allImages,
      audio_urls: allAudioUrls.length > 0 ? allAudioUrls : undefined,
      people: allPeople.map(p => p.name),
      category: 'general',
      created_by: currentUser.id,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'memory_created',
      target_type: 'memory',
      target_id: '',
      new_value: { summary },
    });
    setSaved(true);
    setTimeout(() => {
      setMessages([]);
      setSaved(false);
    }, 1500);
  };

  const quickActions = [
    { label: '💊 My Meds', prompt: 'What are my current medications and when should I take them?' },
    { label: '🧠 Memories', prompt: 'Show me my recent memories and what happened' },
    { label: '👥 People', prompt: 'Who are the people I know? Tell me about them.' },
    { label: '❓ Help', prompt: 'What can you help me with?' },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      const el = document.querySelector('[data-send-btn]') as HTMLButtonElement;
      el?.click();
    }, 50);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      <div className="space-y-3 mb-4">
        {messages.length === 0 && (
          <>
            <BrainCharacter userName={currentUser.name} />
            <div className="flex flex-wrap gap-2 justify-center px-4">
              {quickActions.map(a => (
                <button
                  key={a.label}
                  onClick={() => handleQuickAction(a.prompt)}
                  className="pill-badge hover:bg-soft-pink/30 transition-colors cursor-pointer active:scale-95 text-sm"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} index={i} />
        ))}
        {streaming && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      {messages.length >= 2 && (
        <div className="flex justify-center mb-4 animate-fade-in">
          <button onClick={saveMemory} className="btn-primary flex items-center gap-2" disabled={saved}>
            {saved ? <span>Saved!</span> : <><Save size={18} /><span>Save Memory</span></>}
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap animate-fade-in">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="Upload preview" className="w-16 h-16 object-cover" style={{ borderRadius: 'var(--radius-sm)' }} />
              <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive flex items-center justify-center" aria-label="Remove image">
                <X size={12} className="text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {audioRecordings.length > 0 && (
        <div className="flex flex-col gap-2 mb-3 animate-fade-in">
          {audioRecordings.map((rec, i) => (
            <div key={i} className="flex items-center gap-2 glass-card px-3 py-2">
              <Play size={16} className="text-soft-pink" />
              <audio src={rec.url} controls className="flex-1 h-8" style={{ maxWidth: '100%' }} />
              <button onClick={() => removeAudio(i)} className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center" aria-label="Remove audio">
                <X size={12} className="text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {recording && (
        <div className="flex items-center gap-2 mb-3 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm text-muted-foreground">Recording audio...</span>
        </div>
      )}

      <GlassCard className="p-3 flex items-center gap-2">
        <input type="file" ref={fileRef} multiple accept="image/*" className="hidden" onChange={handleImages} />
        <button onClick={() => fileRef.current?.click()} className="p-3 rounded-full hover:bg-soft-pink/20 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95" aria-label="Add images">
          <ImagePlus size={22} className="text-muted-foreground" />
        </button>
        <button onClick={toggleVoice} className={`p-3 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95 ${recording ? 'bg-destructive/20 text-destructive' : 'hover:bg-soft-pink/20 text-muted-foreground'}`} aria-label={recording ? 'Stop recording' : 'Start voice recording'}>
          {recording ? <Square size={22} /> : <Mic size={22} />}
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !streaming && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground min-h-[48px]"
          disabled={streaming}
        />
        <button data-send-btn onClick={handleSend} disabled={streaming} className="p-3 rounded-full bg-soft-pink/20 hover:bg-soft-pink/30 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95 disabled:opacity-50" aria-label="Send message">
          <Send size={20} className="text-soft-pink" />
        </button>
      </GlassCard>
    </div>
  );
};

export default ChatPage;
