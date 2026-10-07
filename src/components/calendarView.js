import { store } from '../state/store.js';
import { formatTime, formatDate, formatDayAndDate, getWeekDays, isSameDay, isToday } from '../utils/dateUtils.js';

export function renderCalendarView(container) {
  const state = store.getState();
  const currentMode = state.calendarMode; // 'day', 'week', 'month', 'agenda'
  const selectedDate = new Date(state.selectedDate);

  const getSubject = (id) => state.subjects.find(s => s.id === id) || { name: 'General', color: '#6366f1' };

  container.innerHTML = `
    <div class="calendar-view-container">
      <!-- Toolbar -->
      <div class="calendar-toolbar">
        <div class="calendar-nav-group">
          <button class="btn btn-secondary btn-sm" id="cal-btn-today">Today</button>
          <button class="header-btn" id="cal-btn-prev" title="Previous">◀</button>
          <button class="header-btn" id="cal-btn-next" title="Next">▶</button>
          <h2 style="font-size: 1.25rem; font-weight: 700; margin-left: 8px;" id="cal-current-label">
            ${formatDate(selectedDate)}
          </h2>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- View Modes -->
          <div class="calendar-view-tabs">
            <button class="view-tab ${currentMode === 'day' ? 'active' : ''}" data-mode="day">Day</button>
            <button class="view-tab ${currentMode === 'week' ? 'active' : ''}" data-mode="week">Week</button>
            <button class="view-tab ${currentMode === 'month' ? 'active' : ''}" data-mode="month">Month</button>
            <button class="view-tab ${currentMode === 'agenda' ? 'active' : ''}" data-mode="agenda">Agenda</button>
          </div>

          <!-- Add Event Action -->
          <button class="btn btn-primary btn-sm" id="cal-btn-add">
            + New Event
          </button>
        </div>
      </div>

      <!-- Main Calendar Display Container -->
      <div id="calendar-mode-content"></div>
    </div>
  `;

  // Render the specific view mode
  const modeContainer = container.querySelector('#calendar-mode-content');
  if (currentMode === 'week') {
    renderWeekView(modeContainer, selectedDate, state.events, getSubject);
  } else if (currentMode === 'day') {
    renderDayView(modeContainer, selectedDate, state.events, getSubject);
  } else if (currentMode === 'month') {
    renderMonthView(modeContainer, selectedDate, state.events, getSubject);
  } else {
    renderAgendaView(modeContainer, selectedDate, state.events, getSubject);
  }

  // Attach toolbar listeners
  container.querySelector('#cal-btn-today')?.addEventListener('click', () => {
    store.setSelectedDate(new Date().toISOString());
  });

  container.querySelector('#cal-btn-prev')?.addEventListener('click', () => {
    const d = new Date(selectedDate);
    if (currentMode === 'day') d.setDate(d.getDate() - 1);
    else if (currentMode === 'week') d.setDate(d.getDate() - 7);
    else if (currentMode === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    store.setSelectedDate(d.toISOString());
  });

  container.querySelector('#cal-btn-next')?.addEventListener('click', () => {
    const d = new Date(selectedDate);
    if (currentMode === 'day') d.setDate(d.getDate() + 1);
    else if (currentMode === 'week') d.setDate(d.getDate() + 7);
    else if (currentMode === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    store.setSelectedDate(d.toISOString());
  });

  container.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.getAttribute('data-mode');
      store.setCalendarMode(mode);
    });
  });

  container.querySelector('#cal-btn-add')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-create-event-modal', {
      detail: { defaultDate: selectedDate.toISOString() }
    }));
  });
}

function renderWeekView(container, referenceDate, events, getSubject) {
  const weekDays = getWeekDays(referenceDate);

  // Time hours: 08:00 to 22:00 (15 hours)
  const hours = [];
  for (let h = 8; h <= 22; h++) {
    hours.push(h);
  }

  container.innerHTML = `
    <div class="week-grid-container">
      <!-- Header Row (Days) -->
      <div class="week-grid-header">
        <div style="padding: 12px 8px; text-align: center; color: var(--text-muted); font-size: 0.72rem;">GMT</div>
        ${weekDays.map(day => `
          <div class="day-header-cell ${isToday(day) ? 'today' : ''}">
            <div class="day-name">${day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="day-number">${day.getDate()}</div>
          </div>
        `).join('')}
      </div>

      <!-- Time Gutter & Columns -->
      <div class="week-grid-body">
        <!-- Time Gutter -->
        <div class="time-gutter">
          ${hours.map(h => `
            <div class="time-gutter-slot">${h === 12 ? '12 PM' : (h > 12 ? `${h-12} PM` : `${h} AM`)}</div>
          `).join('')}
        </div>

        <!-- 7 Day Columns -->
        ${weekDays.map(day => {
          const dayEvents = events.filter(e => isSameDay(e.startTime, day));

          return `
            <div class="day-column" data-date="${day.toISOString()}">
              ${hours.map(() => `<div class="hour-row-guide"></div>`).join('')}

              ${dayEvents.map(evt => {
                const start = new Date(evt.startTime);
                const end = new Date(evt.endTime);

                const startHour = start.getHours() + (start.getMinutes() / 60);
                const endHour = end.getHours() + (end.getMinutes() / 60);
                
                // Calculate position relative to 8:00 AM (hour index 8)
                const top = Math.max(0, (startHour - 8) * 60);
                const height = Math.max(28, (endHour - startHour) * 60);

                let blockClass = 'event-block-study';
                if (evt.eventType === 'college_class') blockClass = 'event-block-college';
                if (evt.eventType === 'exam') blockClass = 'event-block-exam';

                const sub = getSubject(evt.subjectId);

                return `
                  <div class="grid-event-block ${blockClass}" 
                       style="top: ${top}px; height: ${height}px;" 
                       title="${evt.title} (${formatTime(evt.startTime)} - ${formatTime(evt.endTime)})"
                       data-id="${evt.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <span style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${evt.title}</span>
                    </div>
                    <div style="font-size: 0.68rem; opacity: 0.9;">
                      ${formatTime(evt.startTime)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach event click inspection
  container.querySelectorAll('.grid-event-block').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      window.dispatchEvent(new CustomEvent('inspect-event', { detail: { id } }));
    });
  });
}

function renderDayView(container, date, events, getSubject) {
  const dayEvents = events.filter(e => isSameDay(e.startTime, date))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  container.innerHTML = `
    <div class="card">
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 1.25rem;">Schedule for ${formatDayAndDate(date)}</h3>
        <span class="badge badge-class">${dayEvents.length} Sessions</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${dayEvents.length > 0 ? dayEvents.map(evt => {
          const sub = getSubject(evt.subjectId);
          return `
            <div class="timeline-event-card" style="border-left-color: ${sub.color || 'var(--primary)'};">
              <div class="event-left">
                <div class="event-time-col">
                  <div class="event-time">${formatTime(evt.startTime)}</div>
                  <div class="event-duration">${formatTime(evt.endTime)}</div>
                </div>
                <div class="event-info">
                  <div class="event-name">${evt.title}</div>
                  <div class="event-meta">
                    <span style="color: ${sub.color};">● ${sub.name}</span>
                    ${evt.location ? `<span>📍 ${evt.location}</span>` : ''}
                    <span class="badge">${evt.eventType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div class="event-actions">
                <button class="btn btn-secondary btn-sm delete-evt-btn" data-id="${evt.id}">Delete</button>
              </div>
            </div>
          `;
        }).join('') : `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            No scheduled events for this day. Click "+ New Event" or use AI Copilot!
          </div>
        `}
      </div>
    </div>
  `;

  container.querySelectorAll('.delete-evt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      store.deleteEvent(id);
    });
  });
}

function renderMonthView(container, referenceDate, events, getSubject) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startingDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0

  const days = [];
  for (let i = 0; i < startingDayIndex; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  container.innerHTML = `
    <div class="card" style="padding: 16px;">
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 8px;">
        ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `
          <div style="text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); padding: 8px;">${d}</div>
        `).join('')}
      </div>

      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
        ${days.map(d => {
          if (!d) return `<div style="min-height: 90px; background: rgba(0,0,0,0.05); border-radius: var(--radius-sm);"></div>`;
          const dayEvents = events.filter(e => isSameDay(e.startTime, d));
          const isCurrent = isToday(d);

          return `
            <div style="min-height: 90px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 6px; display: flex; flex-direction: column; gap: 4px; cursor: pointer;" 
                 class="month-cell" data-date="${d.toISOString()}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 700; ${isCurrent ? 'color: var(--primary);' : ''}">${d.getDate()}</span>
                ${dayEvents.length > 0 ? `<span style="font-size: 0.68rem; color: var(--text-muted);">${dayEvents.length}</span>` : ''}
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
                ${dayEvents.slice(0, 2).map(e => `
                  <div style="font-size: 0.68rem; padding: 2px 4px; border-radius: 3px; background: var(--primary-light); color: #c7d2fe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${e.title}
                  </div>
                `).join('')}
                ${dayEvents.length > 2 ? `<div style="font-size: 0.65rem; color: var(--text-muted);">+${dayEvents.length - 2} more</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.month-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const d = cell.getAttribute('data-date');
      store.setSelectedDate(d);
      store.setCalendarMode('day');
    });
  });
}

function renderAgendaView(container, referenceDate, events, getSubject) {
  // Sort events chronologically starting from today
  const sorted = [...events].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  container.innerHTML = `
    <div class="card">
      <h3 style="font-size: 1.25rem; margin-bottom: 20px;">Upcoming Schedule Agenda</h3>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${sorted.map(evt => {
          const sub = getSubject(evt.subjectId);
          return `
            <div class="timeline-event-card">
              <div class="event-left">
                <div class="event-time-col">
                  <div class="event-time">${formatDate(evt.startTime)}</div>
                  <div class="event-duration">${formatTime(evt.startTime)} - ${formatTime(evt.endTime)}</div>
                </div>
                <div class="event-info">
                  <div class="event-name">${evt.title}</div>
                  <div class="event-meta">
                    <span style="color: ${sub.color};">● ${sub.name}</span>
                    <span class="badge ${evt.eventType === 'exam' ? 'badge-exam' : (evt.eventType === 'college_class' ? 'badge-class' : 'badge-study')}">
                      ${evt.eventType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
