import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import UserSwitcher from '@/components/UserSwitcher';
import { Send, Mic, MicOff, ImagePlus, Save, X } from 'lucide-react';
import type { ChatMessage } from '@/types';

const ChatPage = () => {
  const { currentUser, people, addMemory, addAuditEntry } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!input.trim() && images.length === 0) return;
    const userMsg: ChatMessage = { role: 'user', text: input, image_urls: images.length > 0 ? [...images] : undefined };
    const newMessages = [...messages, userMsg];

    // Simple AI response
    const mentionedPeople = people.filter(p => input.toLowerCase().includes(p.name.toLowerCase()));
    let response = "Thank you for sharing! ";
    if (mentionedPeople.length > 0) {
      response += `I notice you mentioned ${mentionedPeople.map(p => `${p.name} (${p.relationship})`).join(', ')}. `;
    }
    response += "Tell me more about your day!";

    const assistantMsg: ChatMessage = { role: 'assistant', text: response };
    setMessages([...newMessages, assistantMsg]);
    setInput('');
    setImages([]);
  }, [input, images, messages, people]);

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

  const toggleVoice = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const saveMemory = () => {
    if (messages.length < 2) return;
    const allPeople = people.filter(p =>
      messages.some(m => m.text.toLowerCase().includes(p.name.toLowerCase()))
    );
    const summary = messages.filter(m => m.role === 'user').map(m => m.text).join('. ').slice(0, 200);
    const allImages = messages.flatMap(m => m.image_urls || []).concat(images);

    addMemory({
      conversation: messages,
      summary,
      image_urls: allImages,
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
    setTimeout(() => { setMessages([]); setSaved(false); }, 1500);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">💬 Chat</h1>
        <UserSwitcher />
      </div>

      <div className="space-y-4 mb-4">
        {messages.length === 0 && (
          <GlassCard className="p-8 text-center">
            <p className="text-4xl mb-4">👋</p>
            <h2 className="text-xl font-semibold mb-2">Hello, {currentUser.name}!</h2>
            <p className="text-muted-foreground">Tell me about your day, share photos, or use voice to chat.</p>
          </GlassCard>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <GlassCard className={`p-4 max-w-[85%] ${msg.role === 'user' ? 'bg-lavender/20' : ''}`}>
              <p>{msg.text}</p>
              {msg.image_urls && msg.image_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {msg.image_urls.map((url, j) => (
                    <img key={j} src={url} alt="" className="rounded-xl w-full h-20 object-cover" />
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        ))}
      </div>

      {messages.length >= 2 && (
        <div className="flex justify-center mb-4 animate-fade-in">
          <button onClick={saveMemory} className="btn-primary flex items-center gap-2" disabled={saved}>
            {saved ? <><span>✓ Saved!</span></> : <><Save size={18} /><span>Save Memory</span></>}
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap animate-fade-in">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                <X size={12} className="text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <GlassCard className="p-3 flex items-center gap-2">
        <input type="file" ref={fileRef} multiple accept="image/*" className="hidden" onChange={handleImages} />
        <button onClick={() => fileRef.current?.click()} className="p-3 rounded-full hover:bg-lavender/20 transition-colors" title="Add images">
          <ImagePlus size={22} className="text-muted-foreground" />
        </button>
        <button onClick={toggleVoice} className={`p-3 rounded-full transition-colors ${recording ? 'bg-destructive/20 text-destructive' : 'hover:bg-lavender/20 text-muted-foreground'}`} title="Voice input">
          {recording ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        <button onClick={handleSend} className="p-3 rounded-full bg-lavender/20 hover:bg-lavender/30 transition-colors">
          <Send size={20} className="text-lavender" />
        </button>
      </GlassCard>
    </div>
  );
};

export default ChatPage;
