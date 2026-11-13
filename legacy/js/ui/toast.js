/**
 * GAME LEADERBOARD - UI TOAST NOTIFICATION COMPONENT
 * Lightweight, accessible notification toast system with Competitive Arcade styling.
 */

(function (window, document) {
  'use strict';

  let toastContainer = null;

  function ensureContainer() {
    if (!toastContainer) {
      toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('role', 'region');
        toastContainer.setAttribute('aria-label', 'System notifications');
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  const Toast = {
    show: function (message, type = 'info', duration = 3500) {
      const container = ensureContainer();

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.setAttribute('role', 'status');

      let icon = 'ℹ️';
      if (type === 'success') icon = '✓';
      if (type === 'error') icon = '✕';
      if (type === 'warning') icon = '⚠️';

      toast.innerHTML = `
        <span class="toast__icon" aria-hidden="true">${icon}</span>
        <span class="toast__message">${message}</span>
        <button type="button" class="toast__close" aria-label="Dismiss notification">&times;</button>
      `;

      const closeBtn = toast.querySelector('.toast__close');
      let dismissTimeout = null;

      const dismiss = () => {
        if (dismissTimeout) clearTimeout(dismissTimeout);
        toast.classList.add('toast--hiding');
        toast.addEventListener('animationend', () => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, { once: true });
      };

      closeBtn.addEventListener('click', dismiss);

      if (duration > 0) {
        dismissTimeout = setTimeout(dismiss, duration);
      }

      container.appendChild(toast);
      return toast;
    },

    success: function (message, duration = 3500) {
      return this.show(message, 'success', duration);
    },

    error: function (message, duration = 4500) {
      return this.show(message, 'error', duration);
    },

    warning: function (message, duration = 4000) {
      return this.show(message, 'warning', duration);
    },

    info: function (message, duration = 3500) {
      return this.show(message, 'info', duration);
    }
  };

  window.GameToast = Toast;

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
