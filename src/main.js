import './style.css';
import { store } from './state/store.js';
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { renderDashboard } from './components/dashboard.js';
import { renderCalendarView } from './components/calendarView.js';
import { renderTimetableMaker } from './components/timetableMaker.js';
import { renderTaskManager } from './components/taskManager.js';
import { renderStudyPlanner } from './components/studyPlanner.js';
import { renderAnalyticsView } from './components/analyticsView.js';
import { renderSettingsView } from './components/settingsView.js';
import { setupAICopilotModal } from './components/aiCopilotModal.js';
import { setupEventModals } from './components/eventModal.js';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('StudyFlow PWA ServiceWorker active:', reg.scope);
    }).catch((err) => {
      console.warn('ServiceWorker registration failed:', err);
    });
  });
}

// Global PWA install prompt state
window.deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Initialize theme
  document.documentElement.setAttribute('data-theme', store.getState().theme);

  // App Frame Layout
  appContainer.innerHTML = `
    <aside class="app-sidebar"></aside>
    <div class="app-main">
      <header class="app-header"></header>
      <main class="app-content" id="main-view-container"></main>
    </div>
  `;

  const sidebarEl = appContainer.querySelector('.app-sidebar');
  const headerEl = appContainer.querySelector('.app-header');
  const contentEl = appContainer.querySelector('#main-view-container');

  // Setup Global Modals
  setupAICopilotModal();
  setupEventModals();

  // Primary View Dispatcher
  function renderCurrentView() {
    const state = store.getState();
    const activeView = state.activeView;

    // Render Shell
    renderSidebar(sidebarEl);
    renderNavbar(headerEl);

    // Render Active Content
    contentEl.innerHTML = '';
    switch (activeView) {
      case 'dashboard':
        renderDashboard(contentEl);
        break;
      case 'calendar':
        renderCalendarView(contentEl);
        break;
      case 'timetable':
        renderTimetableMaker(contentEl);
        break;
      case 'tasks':
        renderTaskManager(contentEl);
        break;
      case 'study_planner':
        renderStudyPlanner(contentEl);
        break;
      case 'analytics':
        renderAnalyticsView(contentEl);
        break;
      case 'settings':
        renderSettingsView(contentEl);
        break;
      default:
        renderDashboard(contentEl);
    }
  }

  // Subscribe to reactive store changes
  store.subscribe(() => {
    renderCurrentView();
  });

  // Initial render
  renderCurrentView();

  // Periodic refresh for current-time live indicator (every 60s)
  setInterval(() => {
    if (store.getState().activeView === 'dashboard') {
      renderCurrentView();
    }
  }, 60000);
}

// Start application on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
