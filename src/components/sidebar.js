import { store } from '../state/store.js';

export function renderSidebar(container) {
  const state = store.getState();
  const currentView = state.activeView;

  const pendingTasksCount = state.tasks.filter(t => t.status !== 'completed').length;
  const todayEventsCount = state.events.filter(e => {
    const d = new Date(e.startTime);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  container.innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-icon">⚡</div>
      <div class="brand-title">StudyFlow AI</div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">Workspace</div>

      <a class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Dashboard</span>
      </a>

      <a class="nav-item ${currentView === 'calendar' ? 'active' : ''}" data-view="calendar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>Calendar</span>
        <span class="nav-badge">${todayEventsCount}</span>
      </a>

      <a class="nav-item ${currentView === 'timetable' ? 'active' : ''}" data-view="timetable">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Timetable Maker</span>
      </a>

      <a class="nav-item ${currentView === 'tasks' ? 'active' : ''}" data-view="tasks">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>
        <span>Tasks & Projects</span>
        <span class="nav-badge">${pendingTasksCount}</span>
      </a>

      <a class="nav-item ${currentView === 'study_planner' ? 'active' : ''}" data-view="study_planner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <span>AI Study Planner</span>
      </a>

      <div class="nav-section-title">Insights & Config</div>

      <a class="nav-item ${currentView === 'analytics' ? 'active' : ''}" data-view="analytics">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        <span>Progress Tracking</span>
      </a>

      <a class="nav-item ${currentView === 'settings' ? 'active' : ''}" data-view="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        <span>Preferences</span>
      </a>
    </nav>

    <div class="sidebar-ai-card">
      <div class="ai-card-title">
        <span>⚡</span> AI Schedule Copilot
      </div>
      <div class="ai-card-desc">
        Dynamic schedule generation & self-healing reallocations.
      </div>
      <button class="btn btn-primary btn-sm" style="width: 100%;" id="sidebar-launch-ai">
        Open Assistant
      </button>
    </div>
  `;

  // Attach nav click handlers
  container.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      store.setActiveView(targetView);
      const sidebar = document.querySelector('.app-sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });

  const launchAiBtn = container.querySelector('#sidebar-launch-ai');
  if (launchAiBtn) {
    launchAiBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-ai-modal'));
    });
  }
}
