import { store } from '../state/store.js';
import { SchedulerSolver } from '../ai/schedulerSolver.js';
import { notifications } from '../utils/notifications.js';

export function renderStudyPlanner(container) {
  const state = store.getState();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Title & Intro -->
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800;">AI Study Planner: Goal to Plan</h1>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Transform high-level academic goals into balanced, actionable daily schedules. The planner takes into account your college lectures, sleep parameters, and exam deadlines.
        </p>
      </div>

      <!-- Goal Setup Form -->
      <div class="card" style="border: 1px solid var(--border-glow); background: var(--bg-surface);">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>🎯</span> Define Academic Goal
        </h3>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label">Target Subject</label>
            <select class="form-select" id="planner-subject">
              ${state.subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Days Until Exam / Milestone</label>
            <input type="number" class="form-input" id="planner-days" value="20" min="1" max="90">
          </div>

          <div class="form-group">
            <label class="form-label">Daily Available Study Hours</label>
            <input type="number" class="form-input" id="planner-daily-hours" value="2.0" step="0.5" min="0.5" max="6">
          </div>
        </div>

        <!-- Preset Goal Chips -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">QUICK PRESET GOALS:</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="prompt-chip preset-btn" data-subj="sub_python" data-days="20" data-hours="2">
              "20 days before Python exam, 2 hours/day"
            </button>
            <button class="prompt-chip preset-btn" data-subj="sub_ai" data-days="14" data-hours="3">
              "14 days before AI Midterm, 3 hours/day"
            </button>
            <button class="prompt-chip preset-btn" data-subj="sub_math" data-days="30" data-hours="1.5">
              "30 days for Discrete Math, 1.5 hours/day"
            </button>
          </div>
        </div>

        <button class="btn btn-gradient" id="btn-generate-plan" style="width: 100%;">
          ⚡ Generate Actionable Study Plan
        </button>
      </div>

      <!-- Generated Plan Results Container -->
      <div id="plan-results-container"></div>
    </div>
  `;

  // Attach Preset Buttons
  container.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelector('#planner-subject').value = btn.getAttribute('data-subj');
      container.querySelector('#planner-days').value = btn.getAttribute('data-days');
      container.querySelector('#planner-daily-hours').value = btn.getAttribute('data-hours');
      triggerPlanGeneration();
    });
  });

  const triggerPlanGeneration = () => {
    const subjectId = container.querySelector('#planner-subject').value;
    const days = Number(container.querySelector('#planner-days').value) || 20;
    const dailyHours = Number(container.querySelector('#planner-daily-hours').value) || 2;

    const subject = state.subjects.find(s => s.id === subjectId) || state.subjects[0];
    const solver = new SchedulerSolver(state.preferences, state.subjects);

    const diff = solver.generateExamSchedule(state.events, {
      subjectsList: [subject.name],
      collegeStart: state.preferences.collegeStartTime,
      collegeEnd: state.preferences.collegeEndTime,
      horizonDays: days,
      dailyTargetHours: dailyHours
    });

    renderPlanResults(container.querySelector('#plan-results-container'), subject, days, dailyHours, diff);
  };

  container.querySelector('#btn-generate-plan').addEventListener('click', triggerPlanGeneration);
}

function renderPlanResults(container, subject, days, dailyHours, diff) {
  const totalStudyHours = (days * dailyHours).toFixed(1);
  const blocksCount = diff.addEvents.length;

  container.innerHTML = `
    <div class="card" style="border: 1px solid var(--border-glow); animation: fadeIn 250ms ease;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
        <div>
          <span class="badge badge-study" style="margin-bottom: 6px;">AI Generated Study Blueprint</span>
          <h2 style="font-size: 1.4rem;">${subject.name}: ${days}-Day Exam Countdown</h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
            Targeting ${totalStudyHours} total study hours slotted cleanly outside your college hours.
          </p>
        </div>

        <button class="btn btn-primary" id="btn-apply-plan">
          ✓ Apply ${blocksCount} Study Blocks to Calendar
        </button>
      </div>

      <!-- Syllabus Pacing Stages -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border-top: 3px solid #3b82f6;">
          <div style="font-size: 0.78rem; font-weight: 700; color: #60a5fa;">STAGE 1: FOUNDATIONS (Days 1–7)</div>
          <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px;">Core Theory & Syntax</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
            Review lecture notes, syntax fundamentals, and algorithmic building blocks.
          </div>
        </div>

        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border-top: 3px solid #10b981;">
          <div style="font-size: 0.78rem; font-weight: 700; color: #34d399;">STAGE 2: DEEP PROBLEM SOLVING (Days 8–15)</div>
          <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px;">Active Recall & Exercises</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
            Complete past paper problems, debug complex cases, and reinforce memory.
          </div>
        </div>

        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border-top: 3px solid #f43f5e;">
          <div style="font-size: 0.78rem; font-weight: 700; color: #fb7185;">STAGE 3: MOCK EXAMS (Days 16–${days})</div>
          <div style="font-size: 0.95rem; font-weight: 600; margin-top: 6px;">Timed Simulations & Review</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
            Full mock tests under exam conditions followed by targeted gap review.
          </div>
        </div>
      </div>

      <!-- Sample Allocated Study Blocks -->
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--text-primary);">Preview of Next Scheduled Study Blocks:</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${diff.addEvents.slice(0, 5).map(e => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.82rem;">
              <span style="font-weight: 600; color: ${subject.color};">${e.title}</span>
              <span style="color: var(--text-secondary);">${new Date(e.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(e.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-apply-plan').addEventListener('click', () => {
    store.setPendingDiff(diff);
    store.applyPendingDiff();
    notifications.showToast(`Success! ${diff.addEvents.length} study blocks added to your calendar!`, 'success');
    store.setActiveView('calendar');
  });
}
