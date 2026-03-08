import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { AppState, Memory, Person, Medication, Reminder, Contact, SafeZone, SOSEvent, AuditEntry, Location, FamilyMember } from '@/types';

const STORAGE_KEY = 'cognify_data';

function defaultData(): AppState {
  const userId = 'user-primary';

  return {
    currentUser: { id: userId, name: '', email: '', role: 'patient', created_at: new Date().toISOString() },
    users: [
      { id: userId, name: '', email: '', role: 'patient', created_at: new Date().toISOString() },
    ],
    memories: [],
    people: [],
    medications: [],
    reminders: [],
    locations: [],
    safeZones: [],
    contacts: [],
    familyMembers: [],
    sosEvents: [],
    auditLog: [],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      const isLegacyDemo =
        parsed?.currentUser?.email === 'margaret@example.com' ||
        parsed?.users?.some?.((u: { email?: string }) => u.email === 'margaret@example.com');

      if (isLegacyDemo) return defaultData();

      // Migrate: ensure photo_hashes exists on all people
      if (parsed.people) {
        parsed.people = parsed.people.map((p: Person) => ({
          ...p,
          photo_hashes: p.photo_hashes || [],
        }));
      }
      return parsed;
    }
  } catch { /* use defaults */ }
  return defaultData();
}

interface AppContextType extends AppState {
  addMemory: (m: Omit<Memory, 'id' | 'created_at'>) => void;
  addPerson: (p: Omit<Person, 'id' | 'created_at'>) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  addMedication: (m: Omit<Medication, 'id' | 'created_at'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addReminder: (r: Omit<Reminder, 'id' | 'created_at'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  addLocation: (l: Omit<Location, 'id'>) => void;
  addSafeZone: (z: Omit<SafeZone, 'id' | 'created_at'>) => void;
  updateSafeZone: (id: string, updates: Partial<SafeZone>) => void;
  deleteSafeZone: (id: string) => void;
  addContact: (c: Omit<Contact, 'id' | 'added_at'>) => void;
  deleteContact: (id: string) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  addSOSEvent: (e: Omit<SOSEvent, 'id'>) => void;
  addAuditEntry: (e: Omit<AuditEntry, 'id'>) => void;
  updateCurrentUser: (updates: Partial<AppState['currentUser']>) => void;
  switchUser: (userId: string) => void;
  canEdit: (createdBy: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState(prev => fn(prev));
  }, []);

  const canEdit = useCallback((createdBy: string): boolean => {
    if (state.currentUser.role === 'patient') return true;
    return createdBy === state.currentUser.id;
  }, [state.currentUser]);

  const ctx: AppContextType = {
    ...state,
    canEdit,
    switchUser: (userId) => update(s => ({ ...s, currentUser: s.users.find(u => u.id === userId) || s.currentUser })),
    updateCurrentUser: (updates) => update(s => {
      const nextCurrent = { ...s.currentUser, ...updates };
      return {
        ...s,
        currentUser: nextCurrent,
        users: s.users.map(u => (u.id === s.currentUser.id ? { ...u, ...updates } : u)),
      };
    }),
    addMemory: (m) => update(s => ({ ...s, memories: [{ ...m, id: uuid(), created_at: new Date().toISOString() }, ...s.memories] })),
    addPerson: (p) => update(s => ({ ...s, people: [...s.people, { ...p, id: uuid(), created_at: new Date().toISOString() }] })),
    updatePerson: (id, u) => update(s => ({ ...s, people: s.people.map(p => p.id === id ? { ...p, ...u } : p) })),
    addMedication: (m) => update(s => ({ ...s, medications: [...s.medications, { ...m, id: uuid(), created_at: new Date().toISOString() }] })),
    updateMedication: (id, u) => update(s => ({ ...s, medications: s.medications.map(m => m.id === id ? { ...m, ...u } : m) })),
    deleteMedication: (id) => update(s => ({ ...s, medications: s.medications.filter(m => m.id !== id) })),
    addReminder: (r) => update(s => ({ ...s, reminders: [...s.reminders, { ...r, id: uuid(), created_at: new Date().toISOString() }] })),
    updateReminder: (id, u) => update(s => ({ ...s, reminders: s.reminders.map(r => r.id === id ? { ...r, ...u } : r) })),
    addLocation: (l) => update(s => ({ ...s, locations: [...s.locations.slice(-100), { ...l, id: uuid() }] })),
    addSafeZone: (z) => update(s => ({ ...s, safeZones: [...s.safeZones, { ...z, id: uuid(), created_at: new Date().toISOString() }] })),
    updateSafeZone: (id, u) => update(s => ({ ...s, safeZones: s.safeZones.map(z => z.id === id ? { ...z, ...u } : z) })),
    deleteSafeZone: (id) => update(s => ({ ...s, safeZones: s.safeZones.filter(z => z.id !== id) })),
    addContact: (c) => update(s => ({ ...s, contacts: [...s.contacts, { ...c, id: uuid(), added_at: new Date().toISOString() }] })),
    deleteContact: (id) => update(s => ({ ...s, contacts: s.contacts.filter(c => c.id !== id) })),
    updateFamilyMember: (id, u) => update(s => ({ ...s, familyMembers: s.familyMembers.map(f => f.id === id ? { ...f, ...u } : f) })),
    addSOSEvent: (e) => update(s => ({ ...s, sosEvents: [...s.sosEvents, { ...e, id: uuid() }] })),
    addAuditEntry: (e) => update(s => ({ ...s, auditLog: [{ ...e, id: uuid() }, ...s.auditLog] })),
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
