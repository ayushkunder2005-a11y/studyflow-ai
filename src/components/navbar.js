import { store } from '../state/store.js';
import { notifications } from '../utils/notifications.js';

export function renderNavbar(container) {
  const state = store.getState();
  const theme = state.theme;

  container.innerHTML = `
    <div class="header-left">
      <button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Toggle Navigation">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div class="header-search" id="cmd-k-trigger" title="Press Cmd+K or Ctrl+K to open AI Copilot">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>Ask AI or search schedule...</span>
        <span class="kbd-shortcut">⌘K</span>
      </div>
    </div>

    <div class="header-right">
      <!-- Install Mobile App Button -->
      <button class="btn btn-secondary btn-sm" id="install-pwa-btn" title="Use as Mobile App without Chrome URL bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        <span>Use on Mobile</span>
      </button>

      <!-- Quick AI Trigger -->
      <button class="btn btn-gradient btn-sm" id="header-ai-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        <span>Ask AI</span>
      </button>

      <!-- Notifications -->
      <button class="header-btn" id="notifications-btn" title="Enable / Test Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span class="notification-badge"></span>
      </button>

      <!-- Theme Switcher -->
      <button class="header-btn" id="theme-toggle-btn" title="Toggle Light/Dark Theme">
        ${theme === 'dark' 
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        }
      </button>

      <!-- User Profile Badge -->
      <div class="user-profile-badge" id="profile-btn" title="Alex Rivers — B.S. Computer Science">
        <div class="user-avatar">AR</div>
        <span class="user-name">Alex R.</span>
      </div>
    </div>
  `;

  // Event Listeners
  document.getElementById('install-pwa-btn').addEventListener('click', () => {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          notifications.showToast('Installing StudyFlow AI to home screen...', 'success');
        }
        window.deferredInstallPrompt = null;
      });
    } else {
      showMobileInstallGuideModal();
    }
  });

  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    store.toggleTheme();
  });

  document.getElementById('cmd-k-trigger').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-ai-modal'));
  });

  document.getElementById('header-ai-btn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-ai-modal'));
  });

  document.getElementById('notifications-btn').addEventListener('click', async () => {
    await notifications.requestPermission();
  });

  document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  });

  document.getElementById('profile-btn').addEventListener('click', () => {
    store.setActiveView('settings');
  });
}

export function showMobileInstallGuideModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="brand-icon" style="width: 32px; height: 32px; font-size: 16px;">📱</div>
          <div>
            <h3 style="font-size: 1.15rem;">How to Use as a Mobile App (No Chrome UI)</h3>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Standalone Progressive Web App (PWA)</div>
          </div>
        </div>
        <button class="btn-ghost" id="close-guide-modal">✕</button>
      </div>
      <div class="modal-body" style="gap: 20px;">
        <!-- Step 1: Open on phone -->
        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.85rem; font-weight: 700; color: #818cf8; margin-bottom: 6px;">
            STEP 1: Open this Live HTTPS Link on your phone
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px;">
            Works over any network (Wi-Fi or Mobile Data). Secure HTTPS enabled:
          </p>
          <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.95rem; color: #34d399; font-weight: 600; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(16, 185, 129, 0.3);">
            <a href="https://brain-conservation-chapter-sons.trycloudflare.com" target="_blank" style="color: #34d399; text-decoration: none;">https://brain-conservation-chapter-sons.trycloudflare.com</a>
            <span style="font-size: 0.7rem; color: #818cf8;">● Cloudflare Live</span>
          </div>
        </div>

        <!-- Step 2: Install Android -->
        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.85rem; font-weight: 700; color: #34d399; margin-bottom: 6px;">
            📱 On Android (Chrome / Brave / Edge)
          </div>
          <ol style="font-size: 0.82rem; color: var(--text-secondary); padding-left: 20px; line-height: 1.6;">
            <li>Tap the <strong>three dots (⋮)</strong> menu in the top-right corner of Chrome.</li>
            <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
            <li>Tap <strong>"Install"</strong>.</li>
            <li>✨ <em>Result:</em> An independent app icon appears on your phone's home screen and app drawer. Tapping it opens <strong>StudyFlow AI in full-screen standalone mode without any Chrome URL bar or browser tabs!</strong></li>
          </ol>
        </div>

        <!-- Step 3: Install iPhone -->
        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.85rem; font-weight: 700; color: #60a5fa; margin-bottom: 6px;">
            🍎 On iPhone / iPad (Safari)
          </div>
          <ol style="font-size: 0.82rem; color: var(--text-secondary); padding-left: 20px; line-height: 1.6;">
            <li>Open the link in Safari, then tap the <strong>Share</strong> button (box with an arrow pointing up at the bottom).</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
            <li>Tap <strong>"Add"</strong> in the top-right.</li>
            <li>✨ <em>Result:</em> Opens as a dedicated standalone iOS app with no Safari browser bars!</li>
          </ol>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary btn-sm" id="got-it-btn">Got it!</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-guide-modal').addEventListener('click', close);
  overlay.querySelector('#got-it-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}
