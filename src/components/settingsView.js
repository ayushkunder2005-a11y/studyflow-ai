import { store } from '../state/store.js';
import { notifications } from '../utils/notifications.js';

export function renderSettingsView(container) {
  const state = store.getState();
  const pref = state.preferences;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 800px;">
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800;">Preferences & Student Profile</h1>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Fine-tune the constraint parameters used by the AI Scheduler and Timetable Solver.
        </p>
      </div>

      <!-- Student Profile -->
      <div class="card">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Student Profile</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="pref-user-name" value="${pref.userName}">
          </div>
          <div class="form-group">
            <label class="form-label">Degree / Program</label>
            <input type="text" class="form-input" id="pref-degree" value="${pref.degree}">
          </div>
        </div>
      </div>

      <!-- Daily Time Budget Constraints -->
      <div class="card">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Schedule Constraints & Rhythm</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label">College / School Hours Start</label>
            <input type="time" class="form-input" id="pref-college-start" value="${pref.collegeStartTime}">
          </div>
          <div class="form-group">
            <label class="form-label">College / School Hours End</label>
            <input type="time" class="form-input" id="pref-college-end" value="${pref.collegeEndTime}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label">Sleep Window Start</label>
            <input type="time" class="form-input" id="pref-sleep-start" value="${pref.sleepStartTime}">
          </div>
          <div class="form-group">
            <label class="form-label">Wake Up Time</label>
            <input type="time" class="form-input" id="pref-sleep-end" value="${pref.sleepEndTime}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div class="form-group">
            <label class="form-label">Max Study Hours / Day</label>
            <input type="number" class="form-input" id="pref-max-study" value="${pref.maxStudyHoursPerDay}" step="0.5" min="1" max="8">
          </div>
          <div class="form-group">
            <label class="form-label">Session Duration (mins)</label>
            <input type="number" class="form-input" id="pref-session-mins" value="${pref.preferredSessionMins}" step="15" min="30" max="180">
          </div>
          <div class="form-group">
            <label class="form-label">Break Duration (mins)</label>
            <input type="number" class="form-input" id="pref-break-mins" value="${pref.breakDurationMins}" step="5" min="5" max="60">
          </div>
        </div>

        <div style="margin-top: 20px; text-align: right;">
          <button class="btn btn-primary btn-sm" id="btn-save-prefs">
            Save Preferences
          </button>
        </div>
      </div>

      <!-- Notifications & System -->
      <div class="card">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Notifications & Device Alerts</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.9rem; font-weight: 600;">Browser & Mobile Push Notifications</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">Receive alert reminders 10 minutes before upcoming lectures and study sessions.</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-test-notif">
            🔔 Test Notification
          </button>
        </div>
      </div>

      <!-- Data Backup & Reset -->
      <div class="card">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: #f43f5e;">Data Management & Reset</h3>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
          Export your schedule data as backup or restore original student demonstration data.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="btn-export-all">
            Export All Data (JSON)
          </button>
          <button class="btn btn-ghost btn-sm" id="btn-reset-data" style="color: #f43f5e;">
            Reset to Demo Defaults
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach listeners
  container.querySelector('#btn-save-prefs').addEventListener('click', () => {
    const userName = container.querySelector('#pref-user-name').value;
    const degree = container.querySelector('#pref-degree').value;
    const collegeStartTime = container.querySelector('#pref-college-start').value;
    const collegeEndTime = container.querySelector('#pref-college-end').value;
    const sleepStartTime = container.querySelector('#pref-sleep-start').value;
    const sleepEndTime = container.querySelector('#pref-sleep-end').value;
    const maxStudyHoursPerDay = Number(container.querySelector('#pref-max-study').value);
    const preferredSessionMins = Number(container.querySelector('#pref-session-mins').value);
    const breakDurationMins = Number(container.querySelector('#pref-break-mins').value);

    store.updatePreferences({
      userName,
      degree,
      collegeStartTime,
      collegeEndTime,
      sleepStartTime,
      sleepEndTime,
      maxStudyHoursPerDay,
      preferredSessionMins,
      breakDurationMins
    });

    notifications.showToast('Preferences saved successfully!', 'success');
  });

  container.querySelector('#btn-test-notif').addEventListener('click', async () => {
    await notifications.requestPermission();
    notifications.sendSystemNotification('StudyFlow AI Reminder', {
      body: 'Your "Python Study Session" begins in 10 minutes.'
    });
    notifications.showToast('Test notification dispatched!', 'info');
  });

  container.querySelector('#btn-export-all').addEventListener('click', () => {
    const json = JSON.stringify(store.getState(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studyflow_backup.json';
    a.click();
    notifications.showToast('Backup exported!', 'success');
  });

  container.querySelector('#btn-reset-data').addEventListener('click', () => {
    if (confirm('Reset all schedule, task, and timetable data to initial defaults?')) {
      store.resetAll();
      notifications.showToast('Data reset to demonstration state', 'info');
    }
  });
}
