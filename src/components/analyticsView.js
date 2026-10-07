import { store } from '../state/store.js';

export function renderAnalyticsView(container) {
  const state = store.getState();
  const getSubject = (id) => state.subjects.find(s => s.id === id) || { name: 'General', color: '#6366f1' };

  // Calculate stats
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const taskRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Study hours logged
  const studySessions = state.events.filter(e => e.eventType === 'study_session');
  const completedSessions = studySessions.filter(e => e.status === 'completed');
  const studyHoursLogged = (completedSessions.length * 1.5).toFixed(1);

  // Subject breakdown
  const subjectHours = {};
  state.subjects.forEach(s => subjectHours[s.id] = 0);
  studySessions.forEach(e => {
    if (e.subjectId && subjectHours[e.subjectId] !== undefined) {
      subjectHours[e.subjectId] += 1.5;
    }
  });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800;">Academic Progress & Workload Analytics</h1>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Clean, objective tracking of study distribution, task completion velocity, and exam preparation balance.
        </p>
      </div>

      <!-- Top Summary Metrics -->
      <div class="metrics-row" style="margin-top: 0;">
        <div class="metric-card">
          <span class="metric-label">Task Completion Rate</span>
          <span class="metric-value">${taskRate}%</span>
          <span class="metric-sub" style="color: #10b981;">${completedTasks} of ${totalTasks} completed</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Study Hours Logged</span>
          <span class="metric-value">${studyHoursLogged} hrs</span>
          <span class="metric-sub">Across study blocks</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Study Streak</span>
          <span class="metric-value">6 Days</span>
          <span class="metric-sub" style="color: #f59e0b;">Consistent daily cadence</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Exam Readiness Index</span>
          <span class="metric-value">84 / 100</span>
          <span class="metric-sub" style="color: #6366f1;">On track for horizons</span>
        </div>
      </div>

      <!-- Analytical Grids -->
      <div class="analytics-grid">
        <!-- Subject Effort Distribution -->
        <div class="chart-card">
          <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <span>📊</span> Subject Study Hours Distribution
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">
            Breakdown of allocated and completed study sessions per course.
          </p>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 8px;">
            ${state.subjects.map(s => {
              const hrs = subjectHours[s.id] || 0;
              const maxHrs = 12; // Normalization target
              const pct = Math.min(100, Math.round((hrs / maxHrs) * 100));

              return `
                <div class="progress-bar-container">
                  <div class="progress-meta">
                    <span style="color: ${s.color};">● ${s.name} (${s.code})</span>
                    <span>${hrs} hrs</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${pct}%; background: ${s.color};"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Weekly Workload Heatmap & Rhythm -->
        <div class="chart-card">
          <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <span>⏱</span> Weekly Academic Rhythm
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">
            Hours committed per day of the week (College lectures + Self-study).
          </p>

          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 16px; text-align: center;">
            ${[
              { day: 'Mon', hrs: '7.5h', fill: 80 },
              { day: 'Tue', hrs: '8.0h', fill: 85 },
              { day: 'Wed', hrs: '7.0h', fill: 75 },
              { day: 'Thu', hrs: '8.5h', fill: 90 },
              { day: 'Fri', hrs: '6.5h', fill: 70 },
              { day: 'Sat', hrs: '4.5h', fill: 50 },
              { day: 'Sun', hrs: '3.0h', fill: 35 }
            ].map(col => `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div style="height: 120px; width: 100%; max-width: 28px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); display: flex; align-items: flex-end; overflow: hidden;">
                  <div style="width: 100%; height: ${col.fill}%; background: var(--primary-gradient); border-radius: var(--radius-sm);"></div>
                </div>
                <span style="font-size: 0.75rem; font-weight: 700;">${col.day}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${col.hrs}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
