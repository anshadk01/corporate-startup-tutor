# AUDIT.md — Corporate Startup Tutor (ENT 3805)
Audit performed on Phase 0 against the updated strict specification.

---

## 1. Prompt Log Immutability & Modification Routes
- **Current status in API:**
  - `promptLogRoutes.js` only exposes `GET /api/prompt-logs`. No explicit `DELETE` or `PUT` route exists on `/api/prompt-logs`.
  - **However**, prompt logs are silently modified via backdoor updates in `reflectionController.js` and `newsController.js`:
    - `updateReflection`: lines 166-172 execute `PromptLog.findByIdAndUpdate(reflection.promptLogId, { editedResponse: ..., studentNotes: ... })`.
    - `createReflection`: lines 84-90 execute `PromptLog.findByIdAndUpdate(promptLogId, { editedResponse: ..., studentNotes: ... })`.
    - `updateNews`: lines 177-181 execute `PromptLog.findByIdAndUpdate(news.promptLogId, { studentNotes: news.studentNotes })`.
  - **Spec Violation:** Prompt logs must be strictly **append-only**. Edits to student notes or responses must never mutate existing log entries in place; they must be written as new versioned entries marked with `"edited"` and chained via cryptographic hashes.
  - **Missing Tamper Detection:** No hash-chain mechanism exists (`previousHash`, `hash` calculated via SHA-256).

---

## 2. Hardcoded Student Names, Roll Numbers, and Emails
- Real student and faculty names, emails, and enrollment numbers are committed across multiple code files:
  1. `server/src/scripts/seed.js`: Hardcodes Ansh Adhikari, Harshdeep Singh, Nitin, Prince Malhan, Prof. Kulbir Singh Lamba, emails (`@bml.edu.in`), and registration numbers (`230C...`, `230822`, etc.).
  2. `server/src/scripts/test-api.js`: Hardcodes student email `ansh.adhikari@bml.edu.in` and instructor email `kulbir.lamba@bml.edu.in`.
  3. `client/src/components/layout/TopBar.tsx`: Demo switcher hardcodes real names, emails, and group labels.
  4. `client/src/pages/Login.tsx`: Demo buttons hardcode real names, roll numbers, and emails.
  5. `client/src/services/ai/newsAI.js` and `seed.js`: Specific notes mention real student names ("Ansh:", "Harshdeep:").
- **Spec Violation:** All real student IDs and emails must be removed from git tracking and loaded dynamically from a gitignored `roster.csv` or environment file. Seed data committed to the repo must contain **fictional data only** (with 2-3 demo accounts enabled strictly when `NODE_ENV=development`).

---

## 3. AI Service Implementation (Model, Prompt, Context)
- **Files:** `server/src/services/ai/reflectionAI.js`, `server/src/services/ai/newsAI.js`.
- **Model Called:** Fallback chain: Google Gemini 1.5 Flash (`gemini-1.5-flash:generateContent`) -> OpenAI `gpt-3.5-turbo` -> deterministic parser.
- **Context & System Prompts:**
  - `reflectionAI.js`: System prompt instructs the model to act as the Corporate-Startup Course Reflection Assistant, strictly forbidding hallucination.
  - **Spec Violation in News Curation:** `newsAI.js` contains pre-baked real-world items and passes an open-ended topic prompt to the LLM.
  - **Spec Requirement:** The AI service must be **one unified module** that calls the model with the **SOURCE TEXT only** (pasted or fetched article/post text). Summaries and "Why It Matters" must derive strictly from the provided source text, never from model memory or unverified pre-baked datasets. Each AI interaction must log the specific `modelName` and `modelVersion`. In case of API failure, it must log the failure and allow students to complete a manual entry.

---

## 4. Group Isolation & Multi-Group Architecture
- **Server-Side Group Enforcement:**
  - `reflectionRoutes.js` and `newsRoutes.js` use `protect` middleware, but lack route-level parameter validation for `groupId`.
  - In `reflectionController.js`: `createReflection` checks `req.user.groupId || req.body.groupId`. A student could potentially submit `groupId` for another group.
  - In `groupController.js`: `getGroupById` does NOT verify if a student belongs to the requested group before returning member details and stats.
  - `groupRoutes.js`: Exposes `GET /api/groups` which lists all groups without role filtering (students should only access their own group).
  - In `promptLogController.js`: Student query is restricted to `req.user.groupId`, which is secure, but other group-scoped endpoints must strictly reject students requesting resources outside their group.
- **Data Model:**
  - The model currently hardcodes references to "Group 09" in client UI and seed scripts. It must be fully multi-group and agnostic (e.g. Group 1, Group 2, Group N).

---

## 5. Course Schema & Spec Gaps
- **Reflection Schema:**
  - `openQuestion` is currently a freeform string. It needs server-level validation ensuring it is a single valid question string, or nullable with an explicit boolean flag `noneOutstanding: true`.
  - Missing explicit `authorId` validation (currently uses `createdBy`).
- **News Schema:**
  - Missing fields required by spec: `retrievedAt`, `sourceExcerpt`, `fortnightCycleId`, and `verifiedByStudent` (boolean).
  - Missing `FortnightCycle` entity with `cycleNumber`, `startDate`, `endDate`, `dueDate`, and `isMissed` flag.
- **Instructor Privileges:**
  - Instructors can currently edit news or reflections via standard PUT routes. Spec requires the instructor to be **read-only on student content** while possessing the capability to post clearly labeled **instructor comments**.
- **Export Endpoint:**
  - Missing `GET /api/groups/:id/export?format=csv|pdf` covering prompts, AI responses, and notes with timestamps and authors for faculty review.

---

## Action Plan for Phase 1 & Phase 2
1. Create `server/src/models/FortnightCycle.js` and `server/src/models/InstructorComment.js`.
2. Refactor `PromptLog.js` with SHA-256 hash chaining (`previousHash`, `hash`), append-only design, and `isEdit`/`parentLogId` versioning.
3. Remove real names and emails from seed and demo UI; configure `roster.csv` support and `.gitignore`.
4. Rebuild AI service into a single source-text-only engine logging model and version.
5. Implement group isolation middleware and instructor comment endpoints.
6. Build CSV/PDF export endpoint for faculty.
7. Build modern Tailwind + Framer Motion client design with unified shared space, motion safety hook, coverage matrix, and WCAG AA contrast.
