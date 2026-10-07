# StudyFlow AI — Intelligent Student Schedule & Productivity Application

**StudyFlow AI** is a modern, high-performance web application designed for students balancing rigid institutional college/school timetables, coursework deadlines, upcoming exams, and personal study routines.

---

## ⚡ Key Highlights & Core Capabilities

### 1. AI Schedule Maker
- **Natural Language Parsing:** Students can enter natural statements such as:
  > *"I have college from 9 AM to 4 PM, I want to study Python, mathematics and AI, and my exams are in three weeks."*
- **Constraint-Satisfaction Solver (CSP):** Automatically carves out balanced study blocks outside fixed college hours and sleep windows without cognitive overload or collisions.
- **Schedule Diff Previews:** Renders interactive visual diffs with **Apply Changes** and **Decline** options before mutating the student's calendar.

### 2. Timetable Maker
- **Institutional Matrix:** Configure recurring weekly college or school lecture periods (Period 1 to Period 4, Mon–Fri).
- **Collision Protection:** College hours are designated as `isFixed: true` so the AI Scheduler never overlaps study sessions over mandatory classes.
- **Period Management:** Quick modal to add or remove class periods with room numbers and professor names.
- **JSON Export:** 1-click export of the timetable.

### 3. Academic Task Manager
- **Kanban Board:** Organize coursework across **To Do**, **In Progress**, and **Completed** columns.
- **Task Classifications:** Assignments, Projects, Homework, Study Tasks, Exam Prep, and Personal Tasks.
- **Rich Task Metadata:** Priority badges (`Urgent`, `High`, `Medium`, `Low`), due dates, estimated durations, and interactive subtask checklists.
- **⚡ 1-Click Auto-Schedule:** Instantly generate calendar study blocks before any task deadline.

### 4. Self-Healing AI Rescheduler
- **Automated Drift Recovery:** If a student misses a planned session (e.g., *"I missed today's Python study session"*), the AI identifies the nearest conflict-free gap over the upcoming 72 hours and moves the session without overloading upcoming days.

### 5. Multi-View Interactive Calendar
- **Day View:** High-resolution timeline with current-time marker.
- **Week View:** 7-day column grid with 15-hour gutter (08:00 to 22:00) and color-coded event blocks.
- **Month View:** Monthly date grid with event counts and drill-down support.
- **Agenda View:** Chronological stream of all upcoming commitments.

### 6. Executive Student Dashboard
- **Live Focus Card:** Displays the current active or upcoming block with live status and quick actions (*Mark Done*, *Missed? Reschedule with AI*, *View in Calendar*).
- **Summary Metrics:** Today's completed blocks, active assignments, exam countdowns, and study consistency streaks.
- **AI Study Pulse:** Real-time nudges and recommendations based on gaps between classes.

### 7. Progress Tracking & Workload Analytics
- **Subject Hour Distribution:** Normalized progress meters tracking study hours per course.
- **Weekly Academic Rhythm:** Day-by-day load distribution (lectures vs. study).
- **Exam Readiness Index:** Objective, non-gamified indicator of preparation status.

### 8. System & Preferences
- **Student Profile & Rhythm:** Configurable college hours, sleep window, max study hours per day, and session/break durations.
- **Notifications Engine:** Integration with the browser Web Notifications API and in-app sound/chime alerts.
- **Theme Toggle:** Sleek Dark Mode with Obsidian/Indigo glow + High-Contrast Light Mode.
- **Local Persistence:** Automatic persistence to `localStorage` with export and reset options.

---

## 🛠️ Technology Architecture

- **Core:** HTML5, Modern ES6+ JavaScript Modules
- **Design System:** Vanilla CSS with custom property tokens, glassmorphism, responsive grid, and micro-interactions
- **Dev & Build Tooling:** Vite 8.3
- **Typography:** Google Fonts (`Inter`, `Outfit`, `JetBrains Mono`)
- **State Management:** Reactive Observer Store with `localStorage` synchronization
- **AI Engine:** Heuristic Intent Parser + Interval Packing Constraint Solver

---

## 🚀 Running the Application Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open your browser to: `http://localhost:5173/`

3. **Build for production:**
   ```bash
   npm run build
   ```
   Production build outputs to `dist/`.

---

## ⌨️ Keyboard Shortcuts

- `⌘K` or `Ctrl+K`: Open central StudyFlow AI Copilot Assistant from anywhere in the app.
