export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'family';
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  image_urls?: string[];
  audio_urls?: string[];
}

export interface Memory {
  id: string;
  conversation: ChatMessage[];
  summary: string;
  image_urls: string[];
  audio_url?: string;
  audio_urls?: string[];
  transcription?: string;
  people: string[];
  category: 'family' | 'social' | 'health' | 'general';
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  photo_urls: string[];
  photo_hashes: string[];
  times_mentioned: number;
  created_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  prescriber: string;
  start_date: string;
  created_by: string;
  last_modified_by: string;
  created_at: string;
  supply_quantity?: number;
  doses_per_day?: number;
  supply_start_date?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  category: string;
  medication_id?: string;
  repeat: boolean;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Location {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export interface SafeZone {
  id: string;
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  radius_meters: number;
  active_hours_start: string;
  active_hours_end: string;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  is_emergency: boolean;
  added_by: string;
  added_at: string;
}

export interface FamilyMember {
  id: string;
  patient_id: string;
  family_user_id: string;
  relationship: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  added_at: string;
}

export interface SOSEvent {
  id: string;
  user_id: string;
  type: 'medical' | 'lost' | 'safety' | 'help';
  location_lat: number;
  location_lng: number;
  location_address?: string;
  contacts_notified: string[];
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  action_type: string;
  target_type: string;
  target_id: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

export interface AppState {
  currentUser: User;
  users: User[];
  memories: Memory[];
  people: Person[];
  medications: Medication[];
  reminders: Reminder[];
  locations: Location[];
  safeZones: SafeZone[];
  contacts: Contact[];
  familyMembers: FamilyMember[];
  sosEvents: SOSEvent[];
  auditLog: AuditEntry[];
}
