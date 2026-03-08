import type { Memory, Person, Medication, Reminder, Contact, SafeZone, User } from '@/types';

interface AppData {
  currentUser: User;
  memories: Memory[];
  people: Person[];
  medications: Medication[];
  reminders: Reminder[];
  contacts: Contact[];
  safeZones: SafeZone[];
}

interface AssistantAction {
  type: 'navigate' | 'add_memory' | 'add_reminder' | 'info' | 'none';
  payload?: Record<string, unknown>;
}

interface AssistantResponse {
  text: string;
  action?: AssistantAction;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function matchAny(input: string, keywords: string[]): boolean {
  const n = normalize(input);
  return keywords.some(k => n.includes(k));
}

export function generateSmartResponse(input: string, data: AppData, messageHistory: { role: string; text: string }[]): AssistantResponse {
  const q = normalize(input);

  // Greetings
  if (matchAny(q, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening';
    return {
      text: `${greeting}, ${data.currentUser.name || 'dear'}! 😊 How can I help you today? I can help you with your medications, memories, contacts, safe zones, and more. Just ask!`,
    };
  }

  // How are you / how do I feel
  if (matchAny(q, ['how are you', 'how do you feel', "what's up"])) {
    return {
      text: `I'm doing great, thank you for asking! 💕 More importantly, how are YOU feeling today? Would you like to tell me about your day?`,
    };
  }

  // === MEDICATIONS ===
  if (matchAny(q, ['medication', 'medicine', 'pill', 'drug', 'prescription', 'meds'])) {
    if (matchAny(q, ['what', 'list', 'show', 'tell', 'which', 'my'])) {
      if (data.medications.length === 0) {
        return {
          text: "You don't have any medications recorded yet. Would you like to go to Reminders to add one?",
          action: { type: 'navigate', payload: { path: '/reminders' } },
        };
      }
      const medList = data.medications.map(m => `• **${m.name}** ${m.dosage} — ${m.frequency}, at ${m.times.join(', ')}`).join('\n');
      return {
        text: `Here are your current medications:\n\n${medList}\n\nWould you like to add a new one or check for any interactions?`,
      };
    }
    if (matchAny(q, ['add', 'new', 'start'])) {
      return {
        text: "Let me take you to the Reminders page where you can add a new medication with dosage, frequency, and interaction checking! 💊",
        action: { type: 'navigate', payload: { path: '/reminders' } },
      };
    }
    if (matchAny(q, ['interaction', 'conflict', 'safe', 'mix'])) {
      return {
        text: `You currently take ${data.medications.length} medication(s). Our system automatically checks for drug interactions when you add or change medications. Go to Reminders to manage them.`,
        action: { type: 'navigate', payload: { path: '/reminders' } },
      };
    }
    if (matchAny(q, ['refill', 'supply', 'stock', 'run out', 'left'])) {
      const withSupply = data.medications.filter(m => m.supply_quantity && m.doses_per_day && m.supply_start_date);
      if (withSupply.length === 0) {
        return { text: "None of your medications have supply tracking enabled yet. You can add supply quantities in the Reminders page." };
      }
      const statusList = withSupply.map(m => {
        const daysPassed = Math.floor((Date.now() - new Date(m.supply_start_date!).getTime()) / 86400000);
        const remaining = Math.max(0, m.supply_quantity! - daysPassed * m.doses_per_day!);
        const daysLeft = m.doses_per_day! > 0 ? Math.floor(remaining / m.doses_per_day!) : 0;
        return `• **${m.name}**: ${remaining} doses left (${daysLeft} days)`;
      }).join('\n');
      return { text: `Here's your medication supply status:\n\n${statusList}` };
    }
    return {
      text: `You have ${data.medications.length} medication(s) on file. I can show you the list, help you add new ones, or check supplies. What would you like?`,
    };
  }

  // === REMINDERS ===
  if (matchAny(q, ['reminder', 'remind', 'schedule', 'routine', 'appointment'])) {
    if (matchAny(q, ['what', 'list', 'show', 'my', 'upcoming', 'active'])) {
      const active = data.reminders.filter(r => !r.completed);
      if (active.length === 0) {
        return { text: "You have no active reminders. Want to create one?", action: { type: 'navigate', payload: { path: '/reminders' } } };
      }
      const list = active.slice(0, 5).map(r => `• **${r.title}** at ${r.time} (${r.category})`).join('\n');
      return { text: `Your active reminders:\n\n${list}${active.length > 5 ? `\n...and ${active.length - 5} more` : ''}` };
    }
    return {
      text: "I can help with reminders! Let me take you there.",
      action: { type: 'navigate', payload: { path: '/reminders' } },
    };
  }

  // === MEMORIES ===
  if (matchAny(q, ['memory', 'memories', 'remember', 'forgot', 'forget', 'recall'])) {
    if (matchAny(q, ['what', 'list', 'show', 'my', 'recent'])) {
      if (data.memories.length === 0) {
        return { text: "You haven't saved any memories yet. Tell me about your day and we can save it as a memory! 📝" };
      }
      const recent = data.memories.slice(0, 3).map(m => `• "${m.summary}" — ${m.people.length > 0 ? `with ${m.people.join(', ')}` : ''}`).join('\n');
      return { text: `Here are your recent memories:\n\n${recent}\n\nWant to see all of them?`, action: { type: 'navigate', payload: { path: '/memories' } } };
    }
    if (matchAny(q, ['save', 'add', 'create'])) {
      return { text: "Tell me what happened and I'll help you save it as a memory! You can also add photos and voice recordings. 📸🎙️" };
    }
    return {
      text: `You have ${data.memories.length} saved memories. Want to browse them or create a new one?`,
      action: { type: 'navigate', payload: { path: '/memories' } },
    };
  }

  // === PEOPLE / FAMILY ===
  if (matchAny(q, ['who is', 'family', 'people', 'person', 'know', 'friend', 'relative', 'daughter', 'son', 'wife', 'husband', 'spouse', 'partner', 'mom', 'dad', 'mother', 'father', 'brother', 'sister'])) {
    if (data.people.length === 0) {
      return { text: "You haven't added anyone to your people list yet. Go to the Camera page to add photos of people, or the Family page to manage contacts!", action: { type: 'navigate', payload: { path: '/family' } } };
    }
    // Check if asking about specific person
    const mentioned = data.people.find(p => q.includes(p.name.toLowerCase()));
    if (mentioned) {
      return {
        text: `**${mentioned.name}** is your ${mentioned.relationship}. They've been mentioned ${mentioned.times_mentioned} time(s) in your memories. ${mentioned.photo_urls.length > 0 ? 'You have photos of them!' : ''}`,
      };
    }
    const list = data.people.map(p => `• **${p.name}** — ${p.relationship}`).join('\n');
    return { text: `Here are the people you know:\n\n${list}` };
  }

  // === CONTACTS / EMERGENCY ===
  if (matchAny(q, ['contact', 'emergency', 'call', 'phone', 'caretaker', 'caregiver'])) {
    const emergency = data.contacts.filter(c => c.is_emergency);
    if (data.contacts.length === 0) {
      return { text: "You don't have any contacts saved. Go to the Family page to add emergency contacts!", action: { type: 'navigate', payload: { path: '/family' } } };
    }
    if (emergency.length > 0) {
      const list = emergency.map(c => `• **${c.name}** (${c.relationship}) — ${c.phone}`).join('\n');
      return { text: `Your emergency contacts:\n\n${list}\n\nNeed to call someone? You can tap their phone number.` };
    }
    return { text: `You have ${data.contacts.length} contact(s) but none marked as emergency. Consider marking someone as your emergency contact on the Family page.` };
  }

  // === SAFE ZONES / MAP / LOCATION ===
  if (matchAny(q, ['safe zone', 'home', 'location', 'map', 'where am i', 'lost', 'navigate', 'direction'])) {
    if (matchAny(q, ['where am i', 'lost'])) {
      return {
        text: "Let me open the map for you. It will show your current location and nearby safe zones. If you feel lost, press the SOS button! 🗺️",
        action: { type: 'navigate', payload: { path: '/map' } },
      };
    }
    if (data.safeZones.length === 0) {
      return { text: "You don't have any safe zones set up yet. Go to the Map to pin your home and other safe locations!", action: { type: 'navigate', payload: { path: '/map' } } };
    }
    const zones = data.safeZones.map(z => `• **${z.name}** (${z.radius_meters}m radius)`).join('\n');
    return { text: `Your safe zones:\n\n${zones}\n\nWant to see them on the map?`, action: { type: 'navigate', payload: { path: '/map' } } };
  }

  // === HELP / WHAT CAN YOU DO ===
  if (matchAny(q, ['help', 'what can you do', 'features', 'how to', 'guide', 'tutorial'])) {
    return {
      text: `I can help you with lots of things! Here's what I can do:\n\n🧠 **Memories** — Save and recall your memories\n💊 **Medications** — Check your meds, supply, and interactions\n⏰ **Reminders** — View and manage your schedule\n👥 **People** — Tell you about people you know\n📞 **Contacts** — Show emergency contacts\n🗺️ **Safe Zones** — Check your safe locations\n📸 **Camera** — Recognize faces in photos\n🆘 **SOS** — Emergency help\n\nJust ask me anything naturally!`,
    };
  }

  // === SOS ===
  if (matchAny(q, ['sos', 'emergency', 'help me', 'danger', 'scared', 'unsafe'])) {
    return {
      text: "I'm here for you! 💕 If this is an emergency, please tap the SOS button in the navigation bar below. It will alert your emergency contacts with your location immediately.",
    };
  }

  // === CAMERA / PHOTOS ===
  if (matchAny(q, ['camera', 'photo', 'picture', 'face', 'recognize', 'identify'])) {
    return {
      text: "Want to use the camera? I can help you take photos or recognize faces! Let me open the camera for you. 📸",
      action: { type: 'navigate', payload: { path: '/camera' } },
    };
  }

  // === DATE / TIME ===
  if (matchAny(q, ['what time', 'what day', 'what date', 'today', 'what year'])) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return { text: `Right now it's **${now.toLocaleDateString('en-US', options)}**. Is there anything you'd like to do today?` };
  }

  // === WEATHER (simulated) ===
  if (matchAny(q, ['weather', 'rain', 'sunny', 'cold', 'warm', 'hot', 'temperature'])) {
    return { text: "I can't check the weather right now, but I hope it's lovely outside! ☀️ Would you like to tell me about your day instead?" };
  }

  // === THANKS ===
  if (matchAny(q, ['thank', 'thanks', 'appreciate'])) {
    return { text: "You're very welcome! 😊 I'm always here for you. Is there anything else I can help with?" };
  }

  // === GOODBYE ===
  if (matchAny(q, ['bye', 'goodbye', 'see you', 'good night', 'night'])) {
    return { text: `Take care, ${data.currentUser.name || 'dear'}! 💕 Remember, I'm always here whenever you need me. Stay safe!` };
  }

  // === CONTEXTUAL: if user mentions a person by name ===
  const mentionedPeople = data.people.filter(p => q.includes(p.name.toLowerCase()));
  if (mentionedPeople.length > 0) {
    const details = mentionedPeople.map(p => `**${p.name}** is your ${p.relationship}`).join('. ');
    const relatedMemories = data.memories.filter(m =>
      mentionedPeople.some(p => m.people.includes(p.name) || m.summary.toLowerCase().includes(p.name.toLowerCase()))
    );

    let response = `${details}. `;
    if (relatedMemories.length > 0) {
      response += `You have ${relatedMemories.length} memory/memories with them. `;
      const latest = relatedMemories[0];
      response += `Most recent: "${latest.summary}". `;
    }
    response += "Tell me more about what happened!";
    return { text: response };
  }

  // === DEFAULT: Conversational catch-all with memory save suggestion ===
  const userMsgCount = messageHistory.filter(m => m.role === 'user').length;
  if (userMsgCount >= 2 && input.length > 20) {
    return {
      text: `That's really interesting, thank you for sharing! 💭 It sounds like this could be a meaningful memory. Would you like me to save this conversation? You can hit the "Save Memory" button below when you're ready.`,
    };
  }

  return {
    text: `I hear you! Tell me more about that. 😊 I'm here to chat, help you remember things, check your medications, or anything else you need.`,
  };
}
