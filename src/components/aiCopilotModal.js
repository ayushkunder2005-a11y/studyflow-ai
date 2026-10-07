import { store } from '../state/store.js';
import { AIIntentEngine } from '../ai/intentEngine.js';
import { notifications } from '../utils/notifications.js';

export function setupAICopilotModal() {
  const intentEngine = new AIIntentEngine(store);

  let modalOverlay = null;

  function openModal(initialPrompt = '') {
    if (modalOverlay) modalOverlay.remove();

    const state = store.getState();

    modalOverlay = document.createElement('div');
    modalOverlay.className = 'ai-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="ai-dialog-card">
        <!-- Header -->
        <div class="ai-dialog-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="brand-icon" style="width: 32px; height: 32px; font-size: 16px;">⚡</div>
            <div>
              <div style="font-size: 0.95rem; font-weight: 700;">StudyFlow AI Copilot</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">Intelligent Academic Scheduler & Solver</div>
            </div>
          </div>
          <button class="btn-ghost" id="close-ai-dialog" style="padding: 6px; font-size: 1.1rem;">✕</button>
        </div>

        <!-- Chat Stream -->
        <div class="ai-chat-stream" id="ai-messages-container">
          ${state.chatMessages.map(msg => renderChatMessage(msg)).join('')}
        </div>

        <!-- Prompt Suggestions Chips -->
        <div class="prompt-chips-container">
          <button class="prompt-chip chip-btn" data-text="I have college from 9 AM to 4 PM, I want to study Python, mathematics and AI, and my exams are in three weeks.">
            "College 9-4, Python/Math/AI, exams in 3 weeks"
          </button>
          <button class="prompt-chip chip-btn" data-text="Move today's missed study session to another day.">
            "Move today's missed study session"
          </button>
          <button class="prompt-chip chip-btn" data-text="Give me two hours for Python every day.">
            "Give me 2 hours for Python every day"
          </button>
          <button class="prompt-chip chip-btn" data-text="What's the most important thing I need to do today?">
            "What's the most important thing today?"
          </button>
          <button class="prompt-chip chip-btn" data-text="Plan my week.">
            "Plan my week"
          </button>
        </div>

        <!-- Form Input -->
        <form class="ai-input-form" id="ai-chat-form">
          <input type="text" class="ai-input-field" id="ai-prompt-input" 
                 placeholder="Tell AI: 'College 9-4, study Python and AI...', 'Move missed session', 'Plan my week'..." 
                 autocomplete="off" required>
          <button type="submit" class="btn btn-primary" id="ai-submit-btn">
            <span>Send</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Scroll to bottom
    const stream = modalOverlay.querySelector('#ai-messages-container');
    stream.scrollTop = stream.scrollHeight;

    // Listeners
    modalOverlay.querySelector('#close-ai-dialog').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    const form = modalOverlay.querySelector('#ai-chat-form');
    const input = modalOverlay.querySelector('#ai-prompt-input');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      handleUserSubmit(val);
    });

    modalOverlay.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        handleUserSubmit(text);
      });
    });

    // If initial prompt was passed
    if (initialPrompt) {
      handleUserSubmit(initialPrompt);
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.remove();
      modalOverlay = null;
    }
  }

  function handleUserSubmit(userText) {
    // 1. Add user message
    store.addChatMessage('user', userText);
    refreshMessages();

    // 2. Process via AI Intent Engine
    setTimeout(() => {
      const response = intentEngine.processPrompt(userText);
      store.addChatMessage('ai', response.reply, response.diffPayload);
      refreshMessages();
    }, 450);
  }

  function refreshMessages() {
    if (!modalOverlay) return;
    const stream = modalOverlay.querySelector('#ai-messages-container');
    const state = store.getState();
    stream.innerHTML = state.chatMessages.map(msg => renderChatMessage(msg)).join('');
    attachDiffHandlers(stream);
    stream.scrollTop = stream.scrollHeight;
  }

  function attachDiffHandlers(container) {
    container.querySelectorAll('.btn-apply-diff').forEach(btn => {
      btn.addEventListener('click', () => {
        store.applyPendingDiff();
        notifications.showToast('Schedule diff applied to your calendar!', 'success');
        refreshMessages();
        store.setActiveView('calendar');
        closeModal();
      });
    });

    container.querySelectorAll('.btn-discard-diff').forEach(btn => {
      btn.addEventListener('click', () => {
        store.discardPendingDiff();
        notifications.showToast('Schedule changes discarded', 'info');
        refreshMessages();
      });
    });
  }

  function renderChatMessage(msg) {
    const isUser = msg.sender === 'user';
    const state = store.getState();

    let diffHtml = '';
    if (msg.diffPayload) {
      const { addEvents = [], moveEvents = [], summary } = msg.diffPayload;
      const isPending = state.aiPendingDiff !== null;

      diffHtml = `
        <div class="ai-diff-container">
          <div class="diff-title">⚡ Proposed Schedule Changes</div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 8px;">${summary || ''}</p>

          <div class="diff-list">
            ${addEvents.map(e => `
              <div class="diff-item add">
                <span>+ ADD: <strong>${e.title}</strong></span>
                <span>${new Date(e.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(e.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            `).join('')}

            ${moveEvents.map(m => `
              <div class="diff-item move">
                <span>🔄 RESCHEDULE: <strong>${m.title}</strong></span>
                <span>Moved to: ${new Date(m.newStartTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(m.newStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            `).join('')}
          </div>

          ${isPending ? `
            <div class="diff-actions">
              <button class="btn btn-secondary btn-sm btn-discard-diff">Decline</button>
              <button class="btn btn-primary btn-sm btn-apply-diff">✓ Apply Changes to Calendar</button>
            </div>
          ` : `
            <div style="font-size: 0.75rem; color: #34d399; font-weight: 600; text-align: right;">✓ Applied to Calendar</div>
          `}
        </div>
      `;
    }

    return `
      <div class="chat-bubble ${isUser ? 'user' : 'ai'}">
        <div class="chat-avatar ${isUser ? 'user' : 'ai'}">
          ${isUser ? 'AR' : '⚡'}
        </div>
        <div class="chat-text">
          <div>${msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
          ${diffHtml}
        </div>
      </div>
    `;
  }

  // Global listeners to trigger modal
  window.addEventListener('open-ai-modal', () => openModal());
  window.addEventListener('trigger-ai-prompt', (e) => {
    openModal(e.detail?.prompt || '');
  });

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modalOverlay) closeModal();
      else openModal();
    }
  });
}
