import { store } from '../state/store.js';
import { formatDate, formatTime } from '../utils/dateUtils.js';
import { notifications } from '../utils/notifications.js';

export function renderTaskManager(container) {
  const state = store.getState();
  const getSubject = (id) => state.subjects.find(s => s.id === id) || { name: 'General', color: '#6366f1' };

  // Task filter state stored in window or component scope
  const currentFilter = window.taskFilterSubject || 'all';

  const filteredTasks = state.tasks.filter(t => {
    if (currentFilter === 'all') return true;
    return t.subjectId === currentFilter;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  container.innerHTML = `
    <div class="task-manager-container">
      <!-- Header & Filter Bar -->
      <div class="task-filter-bar">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 800;">Academic Task & Project Manager</h1>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Assignments, homework, and term milestones. Auto-schedule study sessions before deadlines.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <!-- Filter by Subject -->
          <select class="form-select" id="task-subject-filter" style="width: 180px;">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>All Subjects</option>
            ${state.subjects.map(s => `
              <option value="${s.id}" ${currentFilter === s.id ? 'selected' : ''}>${s.name}</option>
            `).join('')}
          </select>

          <!-- New Task Action -->
          <button class="btn btn-primary btn-sm" id="btn-create-task-modal">
            + New Task / Assignment
          </button>
        </div>
      </div>

      <!-- Kanban Columns -->
      <div class="kanban-board">
        <!-- Column 1: To Do -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <div class="column-title-group">
              <span style="color: #9ca3af;">●</span>
              <span>To Do</span>
            </div>
            <span class="badge">${todoTasks.length}</span>
          </div>

          <div class="column-card-list" data-status="todo">
            ${todoTasks.map(t => renderTaskCard(t, getSubject)).join('')}
          </div>
        </div>

        <!-- Column 2: In Progress -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <div class="column-title-group">
              <span style="color: #3b82f6;">●</span>
              <span>In Progress</span>
            </div>
            <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${inProgressTasks.length}</span>
          </div>

          <div class="column-card-list" data-status="in_progress">
            ${inProgressTasks.map(t => renderTaskCard(t, getSubject)).join('')}
          </div>
        </div>

        <!-- Column 3: Completed -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <div class="column-title-group">
              <span style="color: #10b981;">●</span>
              <span>Completed</span>
            </div>
            <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">${completedTasks.length}</span>
          </div>

          <div class="column-card-list" data-status="completed">
            ${completedTasks.map(t => renderTaskCard(t, getSubject)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Filter change
  container.querySelector('#task-subject-filter').addEventListener('change', (e) => {
    window.taskFilterSubject = e.target.value;
    renderTaskManager(container);
  });

  // Open task creator modal
  container.querySelector('#btn-create-task-modal').addEventListener('click', () => {
    showCreateTaskDialog();
  });

  // Attach status change and delete buttons
  container.querySelectorAll('.task-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const newStatus = btn.getAttribute('data-next');
      store.updateTask(id, { status: newStatus });
      notifications.showToast(`Task moved to ${newStatus.replace('_', ' ')}!`, 'success');
    });
  });

  container.querySelectorAll('.task-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      store.deleteTask(id);
      notifications.showToast('Task removed', 'info');
    });
  });

  // Subtask checkbox toggling
  container.querySelectorAll('.subtask-check').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const taskId = chk.getAttribute('data-task');
      const subtaskId = chk.getAttribute('data-sub');
      store.toggleSubtask(taskId, subtaskId);
    });
  });

  // Auto-schedule task prep
  container.querySelectorAll('.auto-schedule-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        window.dispatchEvent(new CustomEvent('trigger-ai-prompt', {
          detail: { prompt: `Auto-schedule 2 study sessions for my assignment "${task.title}" before ${task.dueDate}.` }
        }));
      }
    });
  });
}

function renderTaskCard(task, getSubject) {
  const sub = getSubject(task.subjectId);
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

  return `
    <div class="kanban-task-card" data-id="${task.id}">
      <div class="task-card-header">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 0.72rem; color: ${sub.color}; font-weight: 600;">● ${sub.name}</span>
          <div class="task-title" style="${task.status === 'completed' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${task.title}</div>
        </div>
        <span class="badge priority-${task.priority}">${task.priority}</span>
      </div>

      ${task.description ? `<p style="font-size: 0.78rem; color: var(--text-secondary);">${task.description}</p>` : ''}

      ${totalSubtasks > 0 ? `
        <div style="background: var(--bg-surface); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 6px;">
          <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>Subtasks (${completedSubtasks}/${totalSubtasks})</span>
          </div>
          ${task.subtasks.map(st => `
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer;">
              <input type="checkbox" class="subtask-check" data-task="${task.id}" data-sub="${st.id}" ${st.completed ? 'checked' : ''}>
              <span style="${st.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${st.title}</span>
            </label>
          `).join('')}
        </div>
      ` : ''}

      <div class="task-card-footer">
        <div>
          <span>📅 Due: ${task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
          ${task.estimatedMinutes ? ` • ⏱ ${task.estimatedMinutes}m` : ''}
        </div>

        <div style="display: flex; gap: 4px;">
          ${task.status !== 'completed' ? `
            <button class="btn btn-secondary btn-sm auto-schedule-btn" data-id="${task.id}" title="Auto-Schedule study session with AI">
              ⚡ Slot
            </button>
            <button class="btn btn-primary btn-sm task-status-btn" data-id="${task.id}" data-next="${task.status === 'todo' ? 'in_progress' : 'completed'}">
              ${task.status === 'todo' ? 'Start →' : '✓ Done'}
            </button>
          ` : `
            <button class="btn btn-ghost btn-sm task-status-btn" data-id="${task.id}" data-next="todo">
              ↩ Reopen
            </button>
          `}
          <button class="btn btn-ghost btn-sm task-delete-btn" data-id="${task.id}" title="Delete task">✕</button>
        </div>
      </div>
    </div>
  `;
}

function showCreateTaskDialog() {
  const state = store.getState();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 style="font-size: 1.15rem;">Create Academic Task / Assignment</h3>
        <button class="btn-ghost" id="close-task-modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Task Title</label>
          <input type="text" class="form-input" id="new-task-title" placeholder="e.g. Implement A* Search Algorithm in Python" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Subject</label>
            <select class="form-select" id="new-task-subject">
              ${state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="form-select" id="new-task-priority">
              <option value="urgent">Urgent</option>
              <option value="high" selected>High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" class="form-input" id="new-task-due-date" value="${new Date(Date.now() + 86400000*3).toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label class="form-label">Estimated Duration (mins)</label>
            <input type="number" class="form-input" id="new-task-duration" value="90" min="15" step="15">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description / Instructions</label>
          <textarea class="form-textarea" id="new-task-desc" rows="3" placeholder="Key submission instructions, topics, or rubric notes..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="cancel-task-btn">Cancel</button>
        <button class="btn btn-primary btn-sm" id="save-task-btn">Create Task</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-task-modal').addEventListener('click', close);
  overlay.querySelector('#cancel-task-btn').addEventListener('click', close);

  overlay.querySelector('#save-task-btn').addEventListener('click', () => {
    const title = overlay.querySelector('#new-task-title').value.trim();
    if (!title) {
      alert('Please provide a task title');
      return;
    }

    const subjectId = overlay.querySelector('#new-task-subject').value;
    const priority = overlay.querySelector('#new-task-priority').value;
    const dueDate = overlay.querySelector('#new-task-due-date').value;
    const estimatedMinutes = Number(overlay.querySelector('#new-task-duration').value) || 60;
    const description = overlay.querySelector('#new-task-desc').value.trim();

    store.addTask({
      title,
      subjectId,
      priority,
      dueDate,
      dueTime: '23:59',
      estimatedMinutes,
      description,
      taskType: 'assignment'
    });

    notifications.showToast('Academic task created successfully!', 'success');
    close();
  });
}
