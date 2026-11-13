# Corporate-Startup AI Tutor
### BML Munjal University — Designing Corporate-Startup Synergies (ENT 3805)

A specialized academic collaboration platform and AI Agent Tutor custom-engineered for the **BML Munjal University** course *"Designing Corporate-Startup Synergies (ENT 3805)"*. 

Unlike generic chatbot interfaces, this platform enforces the strict pedagogical boundaries of the course: each student group creates **ONE dedicated Agent Tutor** accessible to group members and faculty, strictly limited to two functions: **Class Reflections** and **Fortnightly News Curation**, backed by a mandatory, immutable **Visible Prompt Log**.

---

## 🏛️ Course & Assignment Alignment

| Requirement | Implementation in Application |
| :--- | :--- |
| **One Agent Tutor Per Group** | Each group registers one shared Agent Tutor (e.g. *Synergy Alpha AI Tutor*) accessible by all group students and the instructor. |
| **Strict 2-Task AI Scope** | **Task 1:** Short post-session class reflections with key points & exactly one open question.<br/>**Task 2:** Fortnightly corporate-startup collaboration news curation. |
| **Zero-Hallucination Guardrails** | Reflection system prompt strictly forbids inventing facts, speakers, or topics; synthesizes *only* what the student actually entered. |
| **Mandatory Visible Prompt Log** | Full transparent audit trail recording student, group, feature, timestamp, prompt input, AI output, student notes, and edited versions. Immutable & non-deletable by students. |
| **Instructor Oversight** | Course instructor can monitor all cohorts, track syllabus completion progress, inspect group workspaces, and audit every AI prompt interaction. |

---

## 🚀 Key Features

### 1. Class Reflections (`/reflections`)
- **Post-Session Synthesis**: Students enter raw discussion notes from lecture sessions.
- **AI Synthesis**: Generates:
  - **Key Points**: Concise bullet points capturing core discussions (CVC, IP partitioning, speed vs. scale, GCCs).
  - **Open Question**: Exactly **one** unresolved dilemma or strategic tension without inventing answers.
- **Student Notes & Editable Drafts**: Students can refine points, formulate open questions, and attach team follow-up notes before saving.

### 2. Fortnightly Corporate-Startup News (`/news`)
- **Curated Intelligence**: Bi-weekly updates covering Corporate Venture Capital (CVC), accelerators, co-innovation labs, strategic alliances, GCC venture tracks, and technology integration.
- **Structured Fields**: Headline, Company, Startup/Partner, Date, Source, Source URL, Summary, Why It Matters for Synergies, and Collaboration Type.
- **Verified Sourcing & Manual Entry**: Zero fabricated URLs. Supports AI curation and manual entry of verified business news.

### 3. Transparent Prompt Audit Log (`/prompt-log`)
- **Full Transparency**: Every AI generation automatically creates an audit entry.
- **Comparative Inspection**: Side-by-side view of **Raw Student Prompt** ➔ **Original AI Response** ➔ **Student Edited Version** ➔ **Student-Added Notes**.
- **Role-Based Access**: Students view their group logs; the instructor has class-wide visibility.

### 4. Group Workspace (`/workspace`)
- Shared hub displaying group members, faculty lead, reflection archive, curated news, and chronological activity timeline.

### 5. Instructor Command Center (`/` & `/instructor`)
- Aggregate metrics: Total groups, students, reflections submitted (e.g. 12/13 sessions), news volume, and prompt audits.
- Group-by-group compliance table with 1-click **Inspect Group Workspace**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js (REST API architecture)
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs password hashing
- **AI Service Layer**: Pluggable LLM connector (Google Gemini 1.5/2.0 Flash, OpenAI) + deterministic NLP synthesis engine for zero-hallucination offline resilience

---

## 📂 Project Directory Structure

```text
corporate-startup-tutor/
├── client/                      # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/          # Reusable UI (Modal, Badge, LoadingSpinner, EmptyState)
│   │   ├── context/             # AuthContext with 1-click demo switcher
│   │   ├── layouts/             # DashboardLayout (Sidebar + TopBar)
│   │   ├── pages/               # Dashboard, Reflections, News, PromptLog, Workspace, Instructor
│   │   ├── services/            # Axios API service with JWT interceptors
│   │   ├── types/               # TypeScript interfaces (User, Group, Reflection, News, PromptLog)
│   │   └── utils/               # Date & collaboration type formatters
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                      # Backend Server (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/              # MongoDB connection
│   │   ├── controllers/         # Auth, Reflections, News, PromptLog, Group, Instructor
│   │   ├── middleware/          # JWT protect, authorize, group resolution
│   │   ├── models/              # User, Group, Reflection, News, PromptLog schemas
│   │   ├── routes/              # Express REST endpoints
│   │   ├── scripts/             # Database seed and API automated test suites
│   │   ├── services/ai/         # ReflectionAI & NewsAI service layers
│   │   └── server.js            # Express application entry point
│   ├── package.json
│   └── .env
│
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Running the Project

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or configured via `MONGODB_URI`)

### 1. Setup Backend
```bash
cd server
npm install
node src/scripts/seed.js   # Seeds ENT 3805 realistic demo dataset
npm run dev               # Starts backend on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd ../client
npm install
npm run dev               # Starts frontend on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Credentials (1-Click Switcher Available in UI)

The login screen and top navigation bar include instant **1-Click Demo Profile Switchers**:

| Role | Name | Email | Password | Group |
| :--- | :--- | :--- | :--- | :--- |
| **Instructor** | Dr. Sameer Sharma (Faculty) | `instructor@bml.edu.in` | `Password123!` | All Groups (Course Lead) |
| **Student 1** | Aarav Sharma | `aarav.sharma@bml.edu.in` | `Password123!` | Group 01 - Synergy Alpha |
| **Student 2** | Priya Nair | `priya.nair@bml.edu.in` | `Password123!` | Group 01 - Synergy Alpha |
| **Student 3** | Rohan Gupta | `rohan.gupta@bml.edu.in` | `Password123!` | Group 01 - Synergy Alpha |
| **Student 4** | Ananya Deshmukh | `ananya.d@bml.edu.in` | `Password123!` | Group 02 - Nexus Innovations |

---

## 🧪 Automated Testing

To run the automated backend test suite:
```bash
cd server
npm run test
```

Tests verified:
- ✅ Health check & ENT 3805 course metadata
- ✅ Student authentication & group assignment
- ✅ Instructor authentication & elevated privileges
- ✅ AI Reflection generation with zero hallucination constraints
- ✅ Reflection persistence with prompt log correlation
- ✅ Fortnightly news curation & verified source linking
- ✅ Prompt log immutability & cross-role access controls
- ✅ Instructor dashboard analytics aggregation

---

## 🎓 Academic Integrity Notice
This application is strictly designed for educational coursework under **BML Munjal University** course guidelines. Generic open-ended chatbot prompts, homework solvers, and external scraping tools are omitted by design to ensure focused, transparent learning.