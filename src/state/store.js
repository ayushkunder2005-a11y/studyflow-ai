import { initialSubjects, initialPreferences, initialTimetableSlots, initialTasks, getInitialEvents } from './initialData.js';

const STORAGE_KEY = 'studyflow_ai_state_v1';

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          subjects: parsed.subjects || initialSubjects,
          preferences: parsed.preferences || initialPreferences,
          timetableSlots: parsed.timetableSlots || initialTimetableSlots,
          tasks: parsed.tasks || initialTasks,
          events: parsed.events || getInitialEvents(),
          activeView: 'dashboard',
          calendarMode: 'week',
          selectedDate: new Date().toISOString(),
          chatMessages: parsed.chatMessages || [
            {
              id: 'msg_welcome',
              sender: 'ai',
              text: "Hello Alex! I'm your StudyFlow Copilot. You can tell me things like: **'I have college from 9 AM to 4 PM, I want to study Python, mathematics and AI, and my exams are in three weeks'**, or ask me to reschedule any missed study session.",
              timestamp: new Date().toISOString()
            }
          ],
          aiPendingDiff: null,
          theme: localStorage.getItem('studyflow_theme') || 'dark'
        };
      }
    } catch (e) {
      console.warn('Failed to parse localStorage, resetting to defaults', e);
    }

    return {
      subjects: initialSubjects,
      preferences: initialPreferences,
      timetableSlots: initialTimetableSlots,
      tasks: initialTasks,
      events: getInitialEvents(),
      activeView: 'dashboard',
      calendarMode: 'week',
      selectedDate: new Date().toISOString(),
      chatMessages: [
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: "Hello Alex! I'm your StudyFlow Copilot. You can tell me things like: **'I have college from 9 AM to 4 PM, I want to study Python, mathematics and AI, and my exams are in three weeks'**, or ask me to reschedule any missed study session.",
          timestamp: new Date().toISOString()
        }
      ],
      aiPendingDiff: null,
      theme: 'dark'
    };
  }

  saveState() {
    try {
      const { subjects, preferences, timetableSlots, tasks, events, chatMessages } = this.state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        subjects, preferences, timetableSlots, tasks, events, chatMessages
      }));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
    this.notify();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setActiveView(view) {
    this.state.activeView = view;
    this.notify();
  }

  setCalendarMode(mode) {
    this.state.calendarMode = mode;
    this.notify();
  }

  setSelectedDate(dateIso) {
    this.state.selectedDate = dateIso;
    this.notify();
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.state.theme);
    localStorage.setItem('studyflow_theme', this.state.theme);
    this.notify();
  }

  // Event Mutations
  addEvent(event) {
    const newEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'scheduled',
      ...event
    };
    this.state.events.push(newEvent);
    this.saveState();
    return newEvent;
  }

  updateEvent(id, patch) {
    const idx = this.state.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.state.events[idx] = { ...this.state.events[idx], ...patch };
      this.saveState();
    }
  }

  deleteEvent(id) {
    this.state.events = this.state.events.filter(e => e.id !== id);
    this.saveState();
  }

  markEventStatus(id, status) {
    this.updateEvent(id, { status });
  }

  // Task Mutations
  addTask(task) {
    const newTask = {
      id: 'task_' + Date.now(),
      status: 'todo',
      subtasks: [],
      ...task
    };
    this.state.tasks.push(newTask);
    this.saveState();
    return newTask;
  }

  updateTask(id, patch) {
    const idx = this.state.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.tasks[idx] = { ...this.state.tasks[idx], ...patch };
      this.saveState();
    }
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.subtasks) {
      const st = task.subtasks.find(s => s.id === subtaskId);
      if (st) {
        st.completed = !st.completed;
        this.saveState();
      }
    }
  }

  // Timetable Slot Mutations
  addTimetableSlot(slot) {
    const newSlot = {
      id: 'tt_' + Date.now(),
      ...slot
    };
    this.state.timetableSlots.push(newSlot);
    this.saveState();
  }

  deleteTimetableSlot(id) {
    this.state.timetableSlots = this.state.timetableSlots.filter(s => s.id !== id);
    this.saveState();
  }

  // AI & Chat
  addChatMessage(sender, text, diffPayload = null) {
    const msg = {
      id: 'msg_' + Date.now(),
      sender,
      text,
      timestamp: new Date().toISOString(),
      diffPayload
    };
    this.state.chatMessages.push(msg);
    if (diffPayload) {
      this.state.aiPendingDiff = diffPayload;
    }
    this.saveState();
    return msg;
  }

  setPendingDiff(diff) {
    this.state.aiPendingDiff = diff;
    this.notify();
  }

  applyPendingDiff() {
    if (!this.state.aiPendingDiff) return;
    const { addEvents = [], moveEvents = [], removeEventIds = [] } = this.state.aiPendingDiff;

    if (removeEventIds.length > 0) {
      this.state.events = this.state.events.filter(e => !removeEventIds.includes(e.id));
    }

    for (const move of moveEvents) {
      const ev = this.state.events.find(e => e.id === move.id);
      if (ev) {
        ev.startTime = move.newStartTime;
        ev.endTime = move.newEndTime;
        ev.status = 'rescheduled';
      }
    }

    for (const ev of addEvents) {
      this.state.events.push({
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        ...ev
      });
    }

    this.state.aiPendingDiff = null;
    this.saveState();
  }

  discardPendingDiff() {
    this.state.aiPendingDiff = null;
    this.notify();
  }

  updatePreferences(patch) {
    this.state.preferences = { ...this.state.preferences, ...patch };
    this.saveState();
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.notify();
  }
}

export const store = new Store();
