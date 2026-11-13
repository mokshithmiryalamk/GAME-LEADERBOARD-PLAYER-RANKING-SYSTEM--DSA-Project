/**
 * GAME LEADERBOARD - ACCESSIBLE UI MODAL CONTROLLER
 * Handles modal dialog open/close, focus trapping, ESC key dismiss, and backdrop clicks.
 */

(function (window, document) {
  'use strict';

  let activeModal = null;
  let previousFocusedElement = null;

  const Modal = {
    open: function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) {
        console.warn(`Modal element #${modalId} not found.`);
        return;
      }

      // Close any currently active modal
      if (activeModal && activeModal !== modal) {
        this.close(activeModal.id);
      }

      previousFocusedElement = document.activeElement;
      activeModal = modal;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      // Focus the first focusable element or modal container
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        modal.focus();
      }

      // Trigger custom open event if needed
      modal.dispatchEvent(new CustomEvent('modal:opened', { detail: { modalId } }));
    },

    close: function (modalId) {
      const modal = modalId ? document.getElementById(modalId) : activeModal;
      if (!modal) return;

      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');

      if (activeModal === modal) {
        activeModal = null;
      }

      // Restore focus to the element that opened the modal
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
        previousFocusedElement = null;
      }

      modal.dispatchEvent(new CustomEvent('modal:closed', { detail: { modalId: modal.id } }));
    },

    getActiveModal: function () {
      return activeModal;
    },

    init: function () {
      // Global listeners for data-modal-close and backdrop clicks
      document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-modal-close]');
        if (closeBtn) {
          const modal = closeBtn.closest('.modal-overlay');
          if (modal) {
            this.close(modal.id);
          }
        }

        // Click on the backdrop itself (not inside the modal-card)
        if (e.target.classList && e.target.classList.contains('modal-overlay')) {
          this.close(e.target.id);
        }
      });

      // ESC key listener
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) {
          this.close(activeModal.id);
        }

        // Focus trap inside active modal
        if (e.key === 'Tab' && activeModal) {
          const focusables = Array.from(activeModal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )).filter(el => el.offsetParent !== null);

          if (focusables.length === 0) return;

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      });
    }
  };

  window.GameModal = Modal;

  if (document && document.readyState !== 'loading') {
    Modal.init();
  } else if (document) {
    document.addEventListener('DOMContentLoaded', () => Modal.init());
  }

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
