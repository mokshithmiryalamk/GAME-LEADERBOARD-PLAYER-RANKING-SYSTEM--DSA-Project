import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay is-open"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        opacity: 1,
        visibility: 'visible',
      }}
      onClick={onCancel}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: 'var(--color-surface, #12161A)',
          border: '1px solid var(--color-border, #2A323D)',
          borderRadius: '12px',
          maxWidth: '480px',
          width: '100%',
          padding: '1.5rem',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: '0 0 0.75rem 0',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            color: isDanger ? 'var(--color-danger, #ff4757)' : 'var(--color-text-main, #F1F5F9)',
          }}
        >
          {title}
        </h3>
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-muted, #94A3B8)', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn--outline"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? 'btn btn--danger' : 'btn btn--primary'}
            style={isDanger ? { backgroundColor: '#ff4757', color: '#fff', border: 'none' } : {}}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
