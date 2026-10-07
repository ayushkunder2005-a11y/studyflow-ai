import { store } from '../state/store.js';
import { notifications } from '../utils/notifications.js';
import { formatTime, formatDate } from '../utils/dateUtils.js';

export function setupEventModals() {
  // Listen for open create event modal
  window.addEventListener('open-create-event-modal', (e) => {
    const defaultDate = e.detail?.defaultDate || new Date().toISOString();
    showCreateEventModal(defaultDate);
  });

  // Listen for event inspection
  window.addEventListener('inspect-event', (e) => {
    const id = e.detail?.id;
    if (id) showInspectEventModal(id);
  });
}

function showCreateEventModal(defaultDateIso) {
  const state = store.getState();
  const d = new Date(defaultDateIso);
  const dateStr = d.toISOString().split('T')[0];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 style="font-size: 1.15rem;">Schedule New Calendar Block</h3>
        <button class="btn-ghost" id="close-evt-modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Event Title</label>
          <input type="text" class="form-input" id="evt-title" placeholder="e.g. Python Study Session, Physics Lab" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Event Type</label>
            <select class="form-select" id="evt-type">
              <option value="study_session" selected>Study Session</option>
              <option value="college_class">College Class / Lecture</option>
              <option value="exam">Official Exam / Test</option>
              <option value="break">Rest / Break</option>
              <option value="personal">Personal / Extracurricular</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <select class="form-select" id="evt-subject">
              <option value="">None / General</option>
              ${state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" class="form-input" id="evt-date" value="${dateStr}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input type="time" class="form-input" id="evt-start" value="17:00">
          </div>
          <div class="form-group">
            <label class="form-label">End Time</label>
            <input type="time" class="form-input" id="evt-end" value="18:30">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Location / Room (Optional)</label>
          <input type="text" class="form-input" id="evt-location" placeholder="e.g. Lab 1, Library Study Room 3">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="cancel-evt-modal">Cancel</button>
        <button class="btn btn-primary btn-sm" id="save-evt-modal">Save Event</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-evt-modal').addEventListener('click', close);
  overlay.querySelector('#cancel-evt-modal').addEventListener('click', close);

  overlay.querySelector('#save-evt-modal').addEventListener('click', () => {
    const title = overlay.querySelector('#evt-title').value.trim();
    if (!title) {
      alert('Please provide an event title');
      return;
    }
    const eventType = overlay.querySelector('#evt-type').value;
    const subjectId = overlay.querySelector('#evt-subject').value || null;
    const date = overlay.querySelector('#evt-date').value;
    const start = overlay.querySelector('#evt-start').value;
    const end = overlay.querySelector('#evt-end').value;
    const location = overlay.querySelector('#evt-location').value.trim();

    const startDateTime = new Date(`${date}T${start}:00`).toISOString();
    const endDateTime = new Date(`${date}T${end}:00`).toISOString();

    store.addEvent({
      title,
      eventType,
      subjectId,
      startTime: startDateTime,
      endTime: endDateTime,
      location,
      isFixed: eventType === 'college_class' || eventType === 'exam'
    });

    notifications.showToast('Event scheduled on calendar!', 'success');
    close();
  });
}

function showInspectEventModal(eventId) {
  const state = store.getState();
  const evt = state.events.find(e => e.id === eventId);
  if (!evt) return;

  const sub = state.subjects.find(s => s.id === evt.subjectId) || { name: 'General', color: '#6366f1' };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${evt.eventType === 'college_class' ? 'badge-class' : (evt.eventType === 'exam' ? 'badge-exam' : 'badge-study')}">
            ${evt.eventType.replace('_', ' ')}
          </span>
          <span style="font-size: 0.8rem; color: ${sub.color}; font-weight: 600;">● ${sub.name}</span>
        </div>
        <button class="btn-ghost" id="close-inspect-modal">✕</button>
      </div>

      <div class="modal-body">
        <h2 style="font-size: 1.4rem; font-weight: 700;">${evt.title}</h2>
        
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; color: var(--text-secondary); margin-top: 8px;">
          <div>📅 <strong>Date:</strong> ${formatDate(evt.startTime)}</div>
          <div>🕒 <strong>Time:</strong> ${formatTime(evt.startTime)} – ${formatTime(evt.endTime)}</div>
          ${evt.location ? `<div>📍 <strong>Location:</strong> ${evt.location}</div>` : ''}
          ${evt.notes ? `<div>📝 <strong>Notes:</strong> ${evt.notes}</div>` : ''}
          <div>⚡ <strong>Type:</strong> ${evt.isFixed ? 'Fixed Commitment (Protected by AI)' : 'Flexible Study Session'}</div>
        </div>
      </div>

      <div class="modal-footer" style="justify-content: space-between;">
        <button class="btn btn-ghost btn-sm" id="btn-delete-inspected" style="color: #f43f5e;">
          Delete Event
        </button>

        <div style="display: flex; gap: 8px;">
          ${evt.eventType === 'study_session' ? `
            <button class="btn btn-secondary btn-sm" id="btn-reschedule-inspected">
              🔄 Reschedule with AI
            </button>
          ` : ''}
          ${evt.status !== 'completed' ? `
            <button class="btn btn-primary btn-sm" id="btn-complete-inspected">
              ✓ Mark Complete
            </button>
          ` : `
            <span style="color: #34d399; font-size: 0.85rem; font-weight: 600; align-self: center;">✓ Completed</span>
          `}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-inspect-modal').addEventListener('click', close);

  overlay.querySelector('#btn-delete-inspected')?.addEventListener('click', () => {
    store.deleteEvent(evt.id);
    notifications.showToast('Event removed', 'info');
    close();
  });

  overlay.querySelector('#btn-complete-inspected')?.addEventListener('click', () => {
    store.markEventStatus(evt.id, 'completed');
    notifications.showToast('Event marked completed!', 'success');
    close();
  });

  overlay.querySelector('#btn-reschedule-inspected')?.addEventListener('click', () => {
    close();
    window.dispatchEvent(new CustomEvent('trigger-ai-prompt', {
      detail: { prompt: `I missed today's ${evt.title}. Please reschedule it.` }
    }));
  });
}
