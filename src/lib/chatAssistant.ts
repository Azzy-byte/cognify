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

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

function extractReminderIntent(input: string): { title: string; time: string } | null {
  const timeMatch = input.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!timeMatch) return null;

  const titleSource = input
    .replace(/\b(remind me to|set reminder|create reminder|add reminder)\b/i, '')
    .replace(timeMatch[0], '')
    .replace(/\b(at|for)\b/gi, '')
    .trim();

  if (!titleSource) return null;

  return {
    title: titleSource.charAt(0).toUpperCase() + titleSource.slice(1),
    time: timeMatch[0],
  };
}

function medicationSupplySummary(medication: Medication): string {
  if (!medication.supply_quantity || !medication.doses_per_day || !medication.supply_start_date) {
    return `${medication.name}: supply tracking is not set.`;
  }

  const daysPassed = Math.floor((Date.now() - new Date(medication.supply_start_date).getTime()) / 86400000);
  const remaining = Math.max(0, medication.supply_quantity - daysPassed * medication.doses_per_day);
  const daysLeft = medication.doses_per_day > 0 ? Math.floor(remaining / medication.doses_per_day) : 0;

  return `${medication.name}: ${remaining} doses left (~${daysLeft} day${daysLeft === 1 ? '' : 's'}).`;
}

export function generateSmartResponse(input: string, data: AppData, messageHistory: { role: string; text: string }[]): AssistantResponse {
  const q = normalize(input);
  const isQuestion = q.endsWith('?') || hasAny(q, ['what', 'how', 'where', 'when', 'who', 'can you']);

  const reminderIntent = extractReminderIntent(input);
  if (reminderIntent) {
    return {
      text: `Done — I can create this reminder: **${reminderIntent.title}** at **${reminderIntent.time}**.`,
      action: {
        type: 'add_reminder',
        payload: {
          title: reminderIntent.title,
          time: reminderIntent.time,
        },
      },
    };
  }

  if (hasAny(q, ['open map', 'go to map', 'show map', 'directions'])) {
    return {
      text: 'Opening your map now. I can also help you navigate back home from there.',
      action: { type: 'navigate', payload: { path: '/map' } },
    };
  }

  if (hasAny(q, ['open reminders', 'go to reminders', 'show medications', 'my meds'])) {
    return {
      text: 'Taking you to Reminders so you can manage medications and schedules.',
      action: { type: 'navigate', payload: { path: '/reminders' } },
    };
  }

  if (hasAny(q, ['open memories', 'show memories', 'my memories'])) {
    return {
      text: 'Opening your memories now.',
      action: { type: 'navigate', payload: { path: '/memories' } },
    };
  }

  if (hasAny(q, ['medication', 'medicine', 'pill', 'prescription', 'meds'])) {
    if (data.medications.length === 0) {
      return {
        text: 'You do not have medications saved yet. I can take you to Reminders to add one.',
        action: { type: 'navigate', payload: { path: '/reminders' } },
      };
    }

    if (hasAny(q, ['supply', 'refill', 'running low', 'left'])) {
      const summary = data.medications.map(medicationSupplySummary).join('\n');
      return { text: `Current supply status:\n\n${summary}` };
    }

    const list = data.medications
      .map(m => `• **${m.name}** ${m.dosage} — ${m.frequency}${m.times.length ? ` at ${m.times.join(', ')}` : ''}`)
      .join('\n');

    return { text: `Here is your medication list:\n\n${list}` };
  }

  if (hasAny(q, ['contact', 'emergency', 'caretaker', 'caregiver'])) {
    const emergencyContacts = data.contacts.filter(contact => contact.is_emergency);
    if (emergencyContacts.length === 0) {
      return {
        text: 'No emergency contacts are configured yet. You can add one in Family.',
        action: { type: 'navigate', payload: { path: '/family' } },
      };
    }

    const list = emergencyContacts.map(contact => `• **${contact.name}** (${contact.relationship || 'Emergency'}) — ${contact.phone}`).join('\n');
    return { text: `Emergency contacts:\n\n${list}` };
  }

  if (hasAny(q, ['people', 'family', 'who do i know', 'recognize'])) {
    if (data.people.length === 0) {
      return {
        text: 'No people are indexed yet. You can add faces in Camera.',
        action: { type: 'navigate', payload: { path: '/camera' } },
      };
    }

    const mentioned = data.people.find(person => q.includes(person.name.toLowerCase()));
    if (mentioned) {
      const personMemories = data.memories.filter(memory =>
        memory.people.includes(mentioned.name) || memory.summary.toLowerCase().includes(mentioned.name.toLowerCase())
      );
      return {
        text: `**${mentioned.name}** is marked as **${mentioned.relationship}** and appears in ${personMemories.length} memor${personMemories.length === 1 ? 'y' : 'ies'}.`,
      };
    }

    return {
      text: `People you know:\n\n${data.people.map(person => `• **${person.name}** — ${person.relationship}`).join('\n')}`,
    };
  }

  if (hasAny(q, ['memory', 'memories', 'remember'])) {
    if (data.memories.length === 0) {
      return { text: 'You have no memories saved yet. Share a moment and then tap Save Memory.' };
    }

    const recent = data.memories.slice(0, 3).map(memory => `• ${memory.summary}`).join('\n');
    return {
      text: `Recent memories:\n\n${recent}`,
      action: { type: 'navigate', payload: { path: '/memories' } },
    };
  }

  if (hasAny(q, ['safe zone', 'lost', 'home zone', 'where am i'])) {
    if (data.safeZones.length === 0) {
      return {
        text: 'No safe zones are set up yet. Add Home on the map first.',
        action: { type: 'navigate', payload: { path: '/map' } },
      };
    }
    return {
      text: `You currently have ${data.safeZones.length} safe zone${data.safeZones.length === 1 ? '' : 's'}. I can open the map for live tracking.`,
      action: { type: 'navigate', payload: { path: '/map' } },
    };
  }

  if (hasAny(q, ['help', 'what can you do'])) {
    return {
      text: 'I can help with medications, reminders, memories, contacts, map safety, and people recognition. You can also ask me to open pages or create reminders by saying “remind me to … at HH:MM”.',
    };
  }

  if (hasAny(q, ['hi', 'hello', 'hey'])) {
    return {
      text: `Hi ${data.currentUser.name || 'there'}. Tell me what you want to do and I’ll act on it when possible.`,
    };
  }

  const lastUserMessages = messageHistory.filter(message => message.role === 'user').slice(-2).map(message => message.text).join(' ');
  if (!isQuestion && (input.length > 24 || lastUserMessages.length > 50)) {
    return {
      text: 'Got it. If you want, I can help turn this into a memory, create a reminder, or open the right screen for the next step.',
    };
  }

  return {
    text: 'I can help with that. Ask me to list meds, open memories/map, show contacts, or create a reminder with a time.',
  };
}
