// Notification & Alert Management

class NotificationManager {
  constructor() {
    this.hasPermission = 'Notification' in window && Notification.permission === 'granted';
    this.toastContainer = null;
    this.initToastContainer();
  }

  initToastContainer() {
    if (typeof document === 'undefined') return;
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      this.showToast('Browser notifications are not supported on this device.', 'info');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      if (this.hasPermission) {
        this.showToast('Browser notifications successfully enabled! 🔔', 'success');
        this.sendSystemNotification('StudyFlow AI', {
          body: 'Notifications are active. You will receive reminders for classes and study sessions!'
        });
      }
      return this.hasPermission;
    } catch (e) {
      console.error('Error requesting notification permission', e);
      return false;
    }
  }

  sendSystemNotification(title, options = {}) {
    if (this.hasPermission && 'Notification' in window) {
      try {
        new Notification(title, {
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚡</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚡</text></svg>',
          ...options
        });
      } catch (e) {
        console.warn('System notification error', e);
      }
    }
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) this.initToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `
      <span style="font-weight: 700; color: var(--primary);">${icon}</span>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    // Audio cue using Web Audio API
    this.playChime(type);

    setTimeout(() => {
      toast.style.transition = 'all 250ms ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  playChime(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
      } else {
        osc.frequency.setValueAtTime(440, now);
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Audio autoplay policy might restrict without interaction
    }
  }
}

export const notifications = new NotificationManager();
