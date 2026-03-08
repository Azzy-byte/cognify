import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { AppState, Memory, Person, Medication, Reminder, Contact, SafeZone, SOSEvent, AuditEntry, Location, FamilyMember } from '@/types';

const STORAGE_KEY = 'cognify_data';

function defaultData(): AppState {
  const patientId = 'user-patient-1';
  const familyId1 = 'user-family-1';
  const familyId2 = 'user-family-2';

  return {
    currentUser: { id: patientId, name: 'Margaret', email: 'margaret@example.com', role: 'patient', created_at: new Date().toISOString() },
    users: [
      { id: patientId, name: 'Margaret', email: 'margaret@example.com', role: 'patient', created_at: new Date().toISOString() },
      { id: familyId1, name: 'Sarah', email: 'sarah@example.com', role: 'family', created_at: new Date().toISOString() },
      { id: familyId2, name: 'James', email: 'james@example.com', role: 'family', created_at: new Date().toISOString() },
    ],
    memories: [
      {
        id: uuid(), conversation: [
          { role: 'user', text: 'Emily came to visit today with the grandkids! We baked cookies together.' },
          { role: 'assistant', text: 'That sounds wonderful! What kind of cookies did you bake?' },
          { role: 'user', text: 'Chocolate chip, Emily\'s favorite since she was little.' }
        ],
        summary: 'Emily visited with grandkids, baked chocolate chip cookies together',
        image_urls: [], people: ['Emily'], category: 'family',
        created_by: patientId, created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: uuid(), conversation: [
          { role: 'user', text: 'Had my checkup with Dr. Smith today. He said my blood pressure is looking better.' },
          { role: 'assistant', text: 'Great news! Did he change any medications?' },
          { role: 'user', text: 'No, keeping Lisinopril the same. Next visit in 3 months.' }
        ],
        summary: 'Checkup with Dr. Smith, blood pressure improving, continuing Lisinopril',
        image_urls: [], people: ['Dr. Smith'], category: 'health',
        created_by: patientId, created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: uuid(), conversation: [
          { role: 'user', text: 'Michael called from California! He\'s planning to visit next month.' },
          { role: 'assistant', text: 'How exciting! How long will he stay?' },
          { role: 'user', text: 'A whole week. He wants to take me to the garden show.' }
        ],
        summary: 'Michael calling from California, visiting next month for a week, garden show planned',
        image_urls: [], people: ['Michael'], category: 'family',
        created_by: familyId1, created_at: new Date(Date.now() - 259200000).toISOString()
      },
    ],
    people: [
      { id: uuid(), name: 'Emily', relationship: 'Daughter', photo_urls: [], times_mentioned: 5, created_at: new Date().toISOString() },
      { id: uuid(), name: 'Michael', relationship: 'Son', photo_urls: [], times_mentioned: 3, created_at: new Date().toISOString() },
      { id: uuid(), name: 'Dr. Smith', relationship: 'Doctor', photo_urls: [], times_mentioned: 2, created_at: new Date().toISOString() },
    ],
    medications: [
      { id: uuid(), name: 'Lisinopril', dosage: '10mg', frequency: 'daily', times: ['08:00', '20:00'], prescriber: 'Dr. Smith', start_date: '2024-01-15', created_by: patientId, last_modified_by: patientId, created_at: new Date().toISOString() },
      { id: uuid(), name: 'Donepezil', dosage: '5mg', frequency: 'daily', times: ['09:00'], prescriber: 'Dr. Williams', start_date: '2024-03-01', created_by: familyId1, last_modified_by: familyId1, created_at: new Date().toISOString() },
    ],
    reminders: [],
    locations: [],
    safeZones: [
      { id: uuid(), user_id: patientId, name: 'Home', lat: 40.7128, lng: -74.006, radius_meters: 500, active_hours_start: '00:00', active_hours_end: '23:59', created_at: new Date().toISOString() },
      { id: uuid(), user_id: patientId, name: "Daughter's House", lat: 40.7282, lng: -73.7949, radius_meters: 300, active_hours_start: '08:00', active_hours_end: '20:00', created_at: new Date().toISOString() },
    ],
    contacts: [
      { id: uuid(), user_id: patientId, name: 'Emily', phone: '555-0101', relationship: 'Daughter', is_emergency: true, added_by: patientId, added_at: new Date().toISOString() },
      { id: uuid(), user_id: patientId, name: 'Michael', phone: '555-0102', relationship: 'Son', is_emergency: true, added_by: patientId, added_at: new Date().toISOString() },
      { id: uuid(), user_id: patientId, name: 'Dr. Smith', phone: '555-0200', relationship: 'Doctor', is_emergency: false, added_by: familyId1, added_at: new Date().toISOString() },
    ],
    familyMembers: [
      { id: uuid(), patient_id: patientId, family_user_id: familyId1, relationship: 'Daughter', can_view: true, can_add: true, can_edit: true, added_at: new Date().toISOString() },
      { id: uuid(), patient_id: patientId, family_user_id: familyId2, relationship: 'Son', can_view: true, can_add: true, can_edit: false, added_at: new Date().toISOString() },
    ],
    sosEvents: [],
    auditLog: [
      { id: uuid(), timestamp: new Date(Date.now() - 3600000).toISOString(), actor_id: 'user-family-1', actor_name: 'Sarah (Daughter)', action_type: 'medication_updated', target_type: 'medication', target_id: '', old_value: { dosage: '5mg' }, new_value: { dosage: '10mg' } },
      { id: uuid(), timestamp: new Date(Date.now() - 7200000).toISOString(), actor_id: patientId, actor_name: 'Margaret (Patient)', action_type: 'memory_created', target_type: 'memory', target_id: '', old_value: undefined, new_value: { summary: 'Emily visited with grandkids' } },
      { id: uuid(), timestamp: new Date(Date.now() - 10800000).toISOString(), actor_id: 'user-family-1', actor_name: 'Sarah (Daughter)', action_type: 'contact_added', target_type: 'contact', target_id: '', old_value: undefined, new_value: { name: 'Dr. Smith', phone: '555-0200' } },
      { id: uuid(), timestamp: new Date(Date.now() - 14400000).toISOString(), actor_id: patientId, actor_name: 'Margaret (Patient)', action_type: 'permission_changed', target_type: 'family_member', target_id: '', old_value: { can_edit: false }, new_value: { can_edit: true } },
      { id: uuid(), timestamp: new Date(Date.now() - 18000000).toISOString(), actor_id: 'user-family-2', actor_name: 'James (Son)', action_type: 'memory_created', target_type: 'memory', target_id: '', old_value: undefined, new_value: { summary: 'Michael called from California' } },
    ],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
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
