<p align="center">
  <img src="https://img.shields.io/badge/Cognify-AI%20Memory%20Companion-8B5CF6?style=for-the-badge&logo=brain&logoColor=white" alt="Cognify" />
</p>

<h1 align="center">🧠 Cognify - AI-Powered Cognitive Care Companion</h1>

<p align="center">
  <em>Restoring independence and dignity to people living with dementia and memory challenges - one interaction at a time.</em>
</p>

<p align="center">
  <a href="https://cognify-app.lovable.app">🌐 Live Demo</a> •
  <a href="#-key-features">✨ Features</a> •
  <a href="#-architecture-overview">🏗 Architecture</a> •
  <a href="#-technologies-used">⚙️ Tech Stack</a>
</p>

---

## 🔴 The Problem

**55 million people worldwide live with dementia**, and this number is projected to reach **139 million by 2050** (WHO). Every 3 seconds, someone develops dementia.

Patients face devastating daily challenges:
- **Forgetting loved ones' faces and names** - leading to isolation and distress
- **Missing critical medications** - causing dangerous drug interactions and health emergencies
- **Getting lost in familiar places** - even in their own neighbourhood
- **Inability to communicate needs** - leaving caregivers guessing and exhausted
- **Loss of personal memories** - eroding identity and self-worth

Current solutions are fragmented: a pill reminder here, a GPS tracker there, a photo album somewhere else. **There is no unified, intelligent companion** that understands the full context of a patient's life and acts proactively.

Caregivers - often unpaid family members - spend **an average of 171 hours per month** on care duties with limited tools to help them coordinate and monitor remotely.

---

## 💡 The Solution - Cognify

**Cognify is an AI-powered cognitive care companion** that combines conversational AI, facial recognition, medication safety, GPS safety tracking, and memory preservation into a single, beautifully simple interface designed for people who need it most.

Unlike generic health apps, Cognify is built with **empathy-first design principles**:
- 🔤 Large, clear typography and high-contrast glassmorphic UI
- 🗣 Voice input/output for users who struggle with typing
- 🧠 Context-aware AI that remembers the user's world - their people, medications, routines, and memories
- 👨‍👩‍👧 Family dashboard for remote caregiver coordination and oversight

**One app. One companion. Complete cognitive support.**

---

## ✨ Key Features

### 🤖 AI Conversational Companion
- Powered by **Google Gemini 2.5 Flash** via Lovable Cloud edge functions
- **Streaming responses** for natural, real-time conversation
- Context-aware: the AI knows the user's medications, people, memories, and safe zones
- Proactive suggestions: "Would you like me to save this as a memory?" / "Time for your Metformin"
- Voice input via Web Speech API with real-time transcription

### 📸 Facial Recognition & People Index
- **Client-side perceptual hashing (pHash)** - no photos leave the device
- Dual-hash strategy for robust matching across lighting/angle variations
- Instant face-to-name matching: "This is Sarah, your daughter"
- Automatic linking of recognized people to conversation memories
- Privacy-first: all recognition runs in-browser, zero cloud uploads

### 💊 Medication Management & Safety
- Full medication tracking with dosage, frequency, prescriber, and schedule
- **Drug interaction checker** with 30+ known dangerous combinations (sourced from clinical databases)
- Severity-graded warnings (High / Moderate) with actionable guidance
- **Supply tracking**: calculates remaining doses and days until refill
- AI assistant can answer "What meds do I take?" or "Am I running low?"

### 🗺 GPS Safety & Navigation
- **Real-time location tracking** with Leaflet maps
- **Safe Zones** - geofenced areas (Home, Doctor, Park) with configurable radius
- **"Am I Safe?" detection** - instant check if user is within a safe zone
- **"Show Way Back Home"** - one-tap Google Maps walking directions from current location
- Breadcrumb trail showing recent movement history

### 🆘 SOS Emergency System
- **4 emergency types**: Medical, Lost, Safety, General Help
- One-tap activation with GPS auto-capture
- Automatically identifies nearest safe zone and distance
- **Direct navigation to home** via Google Maps integration
- Full event logging for caregiver review

### 🧠 Memory Vault
- Save conversations as structured memories with categories (Family, Social, Health, General)
- Attach photos and audio recordings to memories
- AI-generated summaries of conversations
- People tagging - link memories to recognized individuals
- Searchable, browsable memory timeline

### 👨‍👩‍👧 Family & Caregiver Portal
- **Role-based access control** (Patient / Family Member)
- Caregivers can view medications, memories, and location remotely
- Permission system: View / Add / Edit granularity per caregiver
- Emergency contact management
- **Audit log** - complete trail of who changed what and when (HIPAA-aligned)

### 🔒 Privacy & Security
- Facial recognition runs **entirely client-side** - no biometric data in the cloud
- Role-based data access with audit trail
- All data encrypted in transit
- RBAC-ready architecture for clinical deployment

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                  │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐  │
│  │  Chat   │ │  Camera  │ │   Map   │ │ Medications │  │
│  │  Page   │ │  + pHash │ │ Leaflet │ │ + Interactions│ │
│  └────┬────┘ └──────────┘ └────┬────┘ └─────────────┘  │
│       │                        │                         │
│  ┌────▼────────────────────────▼────┐                   │
│  │      AppContext (State Store)     │                   │
│  │   localStorage persistence       │                   │
│  └────┬─────────────────────────────┘                   │
│       │                                                  │
│  ┌────▼─────────────────┐  ┌─────────────────────────┐  │
│  │  streamChat (SSE)    │  │  Perceptual Hash Engine │  │
│  │  -> Edge Function    │  │  (100% client-side)     │  │
│  └────┬─────────────────┘  └─────────────────────────┘  │
└───────┼─────────────────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────────────────┐
│                  LOVABLE CLOUD (Backend)                 │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │   Edge Function:     │  │   Google Gemini 2.5     │  │
│  │   /chat              │──│   Flash (AI Model)      │  │
│  │   - Streaming SSE    │  │   via Lovable AI        │  │
│  │   - Context injection│  └─────────────────────────┘  │
│  └──────────────────────┘                               │
│  ┌──────────────────────┐                               │
│  │   Supabase Database  │  (Ready for migration from    │
│  │   + Auth + Storage   │   localStorage to cloud DB)   │
│  └──────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
        │
┌───────▼──────────────┐
│  EXTERNAL SERVICES   │
│  - Google Maps API   │
│  - OpenStreetMap     │
│  - Leaflet Tiles     │
│  - Web Speech API    │
└──────────────────────┘
```

---

## ⚙️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI with type safety |
| **Styling** | Tailwind CSS + Glassmorphism | Accessible, high-contrast design system |
| **UI Library** | shadcn/ui + Radix Primitives | Accessible, composable components |
| **State** | React Context + localStorage | Offline-first data persistence |
| **AI** | Google Gemini 2.5 Flash | Empathetic conversational AI |
| **Backend** | Lovable Cloud (Edge Functions) | Serverless AI streaming endpoint |
| **Database** | Supabase (PostgreSQL) | Cloud-ready relational database |
| **Maps** | Leaflet + React-Leaflet | GPS tracking & safe zone visualization |
| **Face Recognition** | Custom pHash (client-side) | Privacy-preserving facial matching |
| **Voice** | Web Speech API | Voice input for accessibility |
| **Build** | Vite | Fast development & optimized builds |
| **Routing** | React Router v6 | SPA navigation with lazy loading |

---

## 🗄 Database & Storage

- **Current**: Client-side `localStorage` with structured JSON (offline-first, zero-setup)
- **Cloud-Ready**: Lovable Cloud (Supabase PostgreSQL) connected and configured for migration
- **Edge Functions**: Deployed on Lovable Cloud for AI chat streaming with SSE
- **Schema**: Comprehensive type system covering Users, Memories, People, Medications, Reminders, Locations, Safe Zones, Contacts, Family Members, SOS Events, and Audit Logs

---

## 🔌 Third-Party Integrations

| Integration | Usage |
|------------|-------|
| **Lovable AI Gateway** | Routes AI requests to Google Gemini without requiring user API keys |
| **Google Maps** | Walking directions for "Show Way Back Home" SOS feature |
| **OpenStreetMap / Leaflet** | Interactive map rendering, safe zone visualization |
| **Web Speech API** | Browser-native voice input for hands-free interaction |
| **Cloudflare CDN** | Leaflet marker assets |

---

## 📊 Market & Impact

### Market Size
- **Global dementia care market**: $12.2 billion (2023) - projected **$19.8 billion by 2030**
- **Digital therapeutics market**: $6.1 billion - **$26.1 billion by 2030** (CAGR 23.1%)
- **55 million** people living with dementia worldwide; **10 million new cases annually**

### Who Benefits
| Stakeholder | Impact |
|------------|--------|
| **Patients** | Restored independence, reduced anxiety, maintained identity through memory preservation |
| **Family Caregivers** | Remote monitoring, reduced burden (171 hrs/month - significantly less), peace of mind |
| **Healthcare Systems** | Fewer ER visits from missed medications, delayed institutionalization, lower care costs |
| **Clinicians** | Audit-trail data for better treatment decisions, medication adherence tracking |

### Social Impact
- **Delays cognitive decline** through active memory engagement and social connection
- **Prevents medical emergencies** via drug interaction alerts and medication tracking
- **Reduces caregiver burnout** - the #1 reason families resort to institutional care
- **Preserves human dignity** - patients can recognize loved ones and maintain their life story

---

## 🏆 Why Cognify Should Win

1. **Solves a Real, Urgent Problem** - Dementia affects 55M people globally with no cure. Cognify provides practical, daily support that improves quality of life *right now*.

2. **Technical Excellence** - Client-side facial recognition (privacy-first), streaming AI with context awareness, real-time GPS safety, drug interaction engine - all in a single cohesive app.

3. **Empathy-First Design** - Every pixel is designed for users with cognitive challenges: large text, glassmorphic high-contrast UI, voice input, simple navigation. This isn't a tech demo - it's a tool people can actually use.

4. **Privacy by Architecture** - Facial recognition runs entirely in-browser. No biometric data ever leaves the device. This isn't a policy - it's a technical guarantee.

5. **Comprehensive, Not Fragmented** - Unlike competitors offering one feature (pill reminder OR GPS tracker OR photo album), Cognify unifies everything with AI as the connective tissue.

6. **Production-Ready** - Live at [cognify-app.lovable.app](https://cognify-app.lovable.app), fully functional, responsive on all devices, with offline-first architecture and cloud-ready backend.

7. **Scalable Impact** - Built on modern serverless architecture, ready for clinical trials, multi-language support, and institutional deployment.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see Cognify in action.

---

<p align="center">
  <strong>Cognify</strong> - Because every memory matters.
</p>
