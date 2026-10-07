import { store } from '../state/store.js';
import { formatTime, formatDate, getRelativeDaysText } from '../utils/dateUtils.js';
import { notifications } from '../utils/notifications.js';

export function renderDashboard(container) {
  const state = store.getState();
  const now = new Date();

  // Find today's events sorted by startTime
  const todayEvents = state.events.filter(e => {
    const d = new Date(e.startTime);
    return d.toDateString() === now.toDateString();
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // Find current or upcoming event for Hero card
  const activeEvent = todayEvents.find(e => new Date(e.endTime) > now && e.status !== 'completed') || todayEvents[0];

  // Metrics
  const completedToday = todayEvents.filter(e => e.status === 'completed').length;
  const pendingTasks = state.tasks.filter(t => t.status !== 'completed');
  const upcomingExams = state.events.filter(e => e.eventType === 'exam' && new Date(e.startTime) > now);

  // Subject lookup helper
  const getSubject = (id) => state.subjects.find(s => s.id === id) || { name: 'General', color: '#6366f1' };

  container.innerHTML = `
    <!-- Top Greeting & Quick Actions -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800;">Welcome back, ${state.preferences.userName} 👋</h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">
          ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • You have ${todayEvents.length} scheduled blocks today.
        </p>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-secondary btn-sm" id="btn-quick-task">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Task
        </button>
        <button class="btn btn-gradient btn-sm" id="btn-open-copilot">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          AI Schedule Generator
        </button>
      </div>
    </div>

    <!-- AI Study Pulse Recommendation Alert -->
    <div class="ai-recommendation-box">
      <div class="ai-rec-content">
        <div class="ai-rec-icon">⚡</div>
        <div>
          <div class="ai-rec-title">AI Study Pulse Recommendation</div>
          <div class="ai-rec-text">
            Your college classes wrap up at 4:00 PM. We recommend a 60-minute break before your 5:00 PM Python study session to maintain maximum cognitive retention.
          </div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-ask-ai-quick" style="white-space: nowrap;">
        Ask Copilot →
      </button>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Left Column: Hero Focus & Today's Timeline -->
      <div>
        <!-- Hero Focus Card -->
        ${activeEvent ? `
          <div class="hero-focus-card">
            <div class="focus-meta">
              <div class="focus-tag">
                <span class="live-pulse"></span>
                <span>${activeEvent.status === 'completed' ? 'Completed Session' : (new Date(activeEvent.startTime) <= now ? 'Current Focus Block' : 'Next Up')}</span>
              </div>
              <span class="badge ${activeEvent.eventType === 'college_class' ? 'badge-class' : (activeEvent.eventType === 'exam' ? 'badge-exam' : 'badge-study')}">
                ${activeEvent.eventType.replace('_', ' ')}
              </span>
            </div>

            <div class="focus-title">${activeEvent.title}</div>

            <div class="focus-details">
              <span>🕒 ${formatTime(activeEvent.startTime)} – ${formatTime(activeEvent.endTime)}</span>
              ${activeEvent.location ? `<span>📍 ${activeEvent.location}</span>` : ''}
              ${activeEvent.subjectId ? `<span>📚 ${getSubject(activeEvent.subjectId).name}</span>` : ''}
            </div>

            <div class="focus-actions">
              ${activeEvent.status !== 'completed' ? `
                <button class="btn btn-primary btn-sm" id="btn-complete-active" data-id="${activeEvent.id}">
                  ✓ Mark Done
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-missed-reschedule" data-id="${activeEvent.id}">
                  🔄 Missed? Reschedule with AI
                </button>
              ` : `
                <span style="color: #34d399; font-size: 0.88rem; font-weight: 600;">✓ Completed</span>
              `}
              <button class="btn btn-ghost btn-sm" id="btn-view-cal">View in Calendar →</button>
            </div>
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: var(--text-secondary); margin-bottom: 12px;">No active sessions right now.</p>
            <button class="btn btn-gradient btn-sm" id="btn-generate-today">Generate Study Schedule with AI</button>
          </div>
        `}

        <!-- Metrics Row -->
        <div class="metrics-row">
          <div class="metric-card">
            <span class="metric-label">Completed Today</span>
            <span class="metric-value">${completedToday} / ${todayEvents.length}</span>
            <span class="metric-sub" style="color: #10b981;">Blocks completed</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Active Tasks</span>
            <span class="metric-value">${pendingTasks.length}</span>
            <span class="metric-sub">Pending assignments</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Exams Countdown</span>
            <span class="metric-value">${upcomingExams.length}</span>
            <span class="metric-sub" style="color: #f43f5e;">In next 30 days</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Study Streak</span>
            <span class="metric-value">6 Days</span>
            <span class="metric-sub" style="color: #f59e0b;">🔥 Steady pace</span>
          </div>
        </div>

        <!-- Today's Schedule Timeline -->
        <div class="timeline-section">
          <div class="section-header">
            <div class="section-title">
              <span>📅</span> Today's Timeline Stream
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-add-event-today">+ Add Event</button>
          </div>

          <div class="timeline-list">
            ${todayEvents.length > 0 ? todayEvents.map(evt => {
              const sub = getSubject(evt.subjectId);
              let typeClass = 'event-class';
              if (evt.eventType === 'study_session') typeClass = 'event-study';
              if (evt.eventType === 'exam') typeClass = 'event-exam';
              if (evt.eventType === 'break') typeClass = 'event-break';

              return `
                <div class="timeline-event-card ${typeClass}">
                  <div class="event-left">
                    <div class="event-time-col">
                      <div class="event-time">${formatTime(evt.startTime)}</div>
                      <div class="event-duration">${formatTime(evt.endTime)}</div>
                    </div>
                    <div class="event-info">
                      <div class="event-name" style="${evt.status === 'completed' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${evt.title}</div>
                      <div class="event-meta">
                        ${evt.location ? `<span>📍 ${evt.location}</span>` : ''}
                        ${sub ? `<span style="color: ${sub.color};">● ${sub.name}</span>` : ''}
                        ${evt.status === 'completed' ? '<span style="color: #34d399; font-weight: 600;">✓ Done</span>' : ''}
                        ${evt.status === 'rescheduled' ? '<span style="color: #fbbf24; font-weight: 600;">🔄 Rescheduled</span>' : ''}
                      </div>
                    </div>
                  </div>

                  <div class="event-actions">
                    ${evt.status !== 'completed' ? `
                      <button class="btn btn-ghost btn-sm check-done-btn" data-id="${evt.id}" title="Mark completed">✓</button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="card" style="text-align: center; padding: 30px; color: var(--text-muted);">
                No events scheduled for today yet. Use the AI Assistant to plan your day!
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Right Column: Upcoming Tasks & Upcoming Exams -->
      <div>
        <!-- Upcoming Deadlines & Tasks -->
        <div class="card" style="margin-bottom: 24px;">
          <div class="section-header" style="margin-bottom: 12px;">
            <div class="section-title" style="font-size: 1.05rem;">
              <span>📝</span> Urgent & Upcoming Tasks
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-go-tasks">View All →</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${pendingTasks.slice(0, 4).map(task => {
              const sub = getSubject(task.subjectId);
              return `
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div style="font-size: 0.88rem; font-weight: 600;">${task.title}</div>
                    <span class="badge priority-${task.priority}">${task.priority}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                    <span style="color: ${sub.color};">● ${sub.name}</span>
                    <span>Due: ${task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Upcoming Exams Radar -->
        <div class="card">
          <div class="section-header" style="margin-bottom: 12px;">
            <div class="section-title" style="font-size: 1.05rem;">
              <span>🎯</span> Exam Horizons
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${upcomingExams.map(exam => {
              const sub = getSubject(exam.subjectId);
              return `
                <div style="background: var(--bg-surface-elevated); border-left: 3px solid var(--color-exam); border-radius: var(--radius-sm); padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.88rem; font-weight: 700;">${exam.title}</div>
                    <span class="badge badge-exam">${getRelativeDaysText(exam.startTime)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                    <span>${formatDate(exam.startTime)} at ${formatTime(exam.startTime)}</span>
                    <span>${exam.location || ''}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  container.querySelectorAll('#btn-open-copilot, #btn-ask-ai-quick, #btn-generate-today').forEach(btn => {
    btn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-ai-modal'));
    });
  });

  container.querySelector('#btn-quick-task')?.addEventListener('click', () => {
    store.setActiveView('tasks');
  });

  container.querySelector('#btn-go-tasks')?.addEventListener('click', () => {
    store.setActiveView('tasks');
  });

  container.querySelector('#btn-view-cal')?.addEventListener('click', () => {
    store.setActiveView('calendar');
  });

  container.querySelector('#btn-complete-active')?.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    store.markEventStatus(id, 'completed');
    notifications.showToast('Great job! Focus block completed.', 'success');
  });

  container.querySelector('#btn-missed-reschedule')?.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const evt = state.events.find(ev => ev.id === id);
    if (evt) {
      // Trigger AI reschedule intent directly
      window.dispatchEvent(new CustomEvent('trigger-ai-prompt', {
        detail: { prompt: `I missed today's ${evt.title}. Please reschedule it.` }
      }));
    }
  });

  container.querySelectorAll('.check-done-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      store.markEventStatus(id, 'completed');
      notifications.showToast('Event marked completed!', 'success');
    });
  });

  container.querySelector('#btn-add-event-today')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-create-event-modal', {
      detail: { defaultDate: new Date().toISOString() }
    }));
  });
}
