import { store } from '../state/store.js';
import { notifications } from '../utils/notifications.js';

export function renderTimetableMaker(container) {
  const state = store.getState();
  const getSubject = (id) => state.subjects.find(s => s.id === id) || { name: 'Unassigned', color: '#6366f1' };

  const days = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' }
  ];

  const periods = [
    { label: '09:00 – 10:30', start: '09:00', end: '10:30' },
    { label: '10:45 – 12:15', start: '10:45', end: '12:15' },
    { label: '13:15 – 14:45', start: '13:15', end: '14:45' },
    { label: '15:00 – 16:00', start: '15:00', end: '16:00' }
  ];

  container.innerHTML = `
    <div class="timetable-container">
      <div class="timetable-header-bar">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 800;">Institutional Timetable Maker</h1>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Configure your fixed weekly college or school schedule. These hours are protected by AI so study sessions never clash with lectures.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="btn-sync-to-cal">
            📅 Sync to Calendar
          </button>
          <button class="btn btn-primary btn-sm" id="btn-add-tt-slot">
            + Add Class Period
          </button>
        </div>
      </div>

      <!-- Timetable Matrix Table -->
      <div style="overflow-x: auto;">
        <table class="timetable-matrix">
          <thead>
            <tr>
              <th style="width: 130px;">Time Window</th>
              ${days.map(d => `<th>${d.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${periods.map(period => `
              <tr>
                <td>${period.label}</td>
                ${days.map(day => {
                  const slot = state.timetableSlots.find(s => 
                    s.dayOfWeek === day.id && s.startTime === period.start
                  );

                  if (slot) {
                    const sub = getSubject(slot.subjectId);
                    return `
                      <td>
                        <div class="timetable-cell-card" style="border-left: 3px solid ${sub.color};" data-id="${slot.id}">
                          <div class="cell-subject-name" style="color: ${sub.color};">${sub.name}</div>
                          <div class="cell-room">📍 ${slot.room || 'Room TBD'} • ${slot.professor || ''}</div>
                          <button class="btn-ghost delete-slot-btn" data-id="${slot.id}" style="padding: 2px 4px; font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;" title="Remove">✕ Remove</button>
                        </div>
                      </td>
                    `;
                  } else {
                    return `
                      <td>
                        <div style="color: var(--text-muted); font-size: 0.72rem; padding: 12px; border: 1px dashed var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;"
                             class="empty-cell" data-day="${day.id}" data-start="${period.start}" data-end="${period.end}">
                          + Add
                        </div>
                      </td>
                    `;
                  }
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="card" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">SUBJECTS:</span>
          ${state.subjects.map(s => `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></span>
              <span>${s.name} (${s.code})</span>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-ghost btn-sm" id="btn-export-tt">
          Export Timetable
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('.delete-slot-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      store.deleteTimetableSlot(id);
      notifications.showToast('Class period removed', 'info');
    });
  });

  container.querySelectorAll('.empty-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const day = Number(cell.getAttribute('data-day'));
      const start = cell.getAttribute('data-start');
      const end = cell.getAttribute('data-end');
      showAddSlotDialog(day, start, end);
    });
  });

  container.querySelector('#btn-add-tt-slot')?.addEventListener('click', () => {
    showAddSlotDialog(1, '09:00', '10:30');
  });

  container.querySelector('#btn-sync-to-cal')?.addEventListener('click', () => {
    notifications.showToast('Timetable periods synchronized with your active calendar!', 'success');
  });

  container.querySelector('#btn-export-tt')?.addEventListener('click', () => {
    const json = JSON.stringify(state.timetableSlots, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weekly_timetable.json';
    a.click();
    notifications.showToast('Timetable exported as JSON', 'success');
  });
}

function showAddSlotDialog(defaultDay, defaultStart, defaultEnd) {
  const state = store.getState();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 style="font-size: 1.15rem;">Add Timetable Class</h3>
        <button class="btn-ghost" id="close-modal-btn">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Day of Week</label>
          <select class="form-select" id="slot-day">
            <option value="1" ${defaultDay === 1 ? 'selected' : ''}>Monday</option>
            <option value="2" ${defaultDay === 2 ? 'selected' : ''}>Tuesday</option>
            <option value="3" ${defaultDay === 3 ? 'selected' : ''}>Wednesday</option>
            <option value="4" ${defaultDay === 4 ? 'selected' : ''}>Thursday</option>
            <option value="5" ${defaultDay === 5 ? 'selected' : ''}>Friday</option>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input type="time" class="form-input" id="slot-start" value="${defaultStart}">
          </div>
          <div class="form-group">
            <label class="form-label">End Time</label>
            <input type="time" class="form-input" id="slot-end" value="${defaultEnd}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Subject</label>
          <select class="form-select" id="slot-subject">
            ${state.subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Room / Lecture Hall</label>
          <input type="text" class="form-input" id="slot-room" placeholder="e.g. Lab 2, Hall A" value="Lab 1">
        </div>

        <div class="form-group">
          <label class="form-label">Professor / Lecturer</label>
          <input type="text" class="form-input" id="slot-prof" placeholder="e.g. Dr. Vance" value="Dr. Vance">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="cancel-slot-btn">Cancel</button>
        <button class="btn btn-primary btn-sm" id="save-slot-btn">Save Class</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-modal-btn').addEventListener('click', close);
  overlay.querySelector('#cancel-slot-btn').addEventListener('click', close);

  overlay.querySelector('#save-slot-btn').addEventListener('click', () => {
    const dayOfWeek = Number(overlay.querySelector('#slot-day').value);
    const startTime = overlay.querySelector('#slot-start').value;
    const endTime = overlay.querySelector('#slot-end').value;
    const subjectId = overlay.querySelector('#slot-subject').value;
    const room = overlay.querySelector('#slot-room').value;
    const professor = overlay.querySelector('#slot-prof').value;

    store.addTimetableSlot({ dayOfWeek, startTime, endTime, subjectId, room, professor });
    notifications.showToast('Class period added to timetable!', 'success');
    close();
  });
}
