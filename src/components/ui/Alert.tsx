import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles: Record<AlertVariant, {
  bg: string;
  border: string;
  text: string;
  icon: React.ReactNode;
}> = {
  info: {
    bg: '#eff6ff',
    border: '#3b82f6',
    text: '#1e40af',
    icon: <FiInfo size={24} />,
  },
  success: {
    bg: '#f0fdf4',
    border: '#22c55e',
    text: '#15803d',
    icon: <FiCheckCircle size={24} />,
  },
  warning: {
    bg: '#fefce8',
    border: '#eab308',
    text: '#a16207',
    icon: <FiAlertTriangle size={24} />,
  },
  error: {
    bg: '#fef2f2',
    border: '#ef4444',
    text: '#dc2626',
    icon: <FiAlertCircle size={24} />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  action,
}) => {
  const style = variantStyles[variant];

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'start',
        position: 'relative',
        marginBottom: '16px',
      }}
      role="alert"
    >
      <div style={{ color: style.border, flexShrink: 0, marginTop: '2px' }}>
        {style.icon}
      </div>

      <div style={{ flex: 1 }}>
        {title && (
          <h4
            style={{
              fontWeight: '600',
              fontSize: '1rem',
              color: style.text,
              marginBottom: '4px',
            }}
          >
            {title}
          </h4>
        )}
        <p style={{ fontSize: '0.9rem', color: style.text, margin: 0 }}>
          {message}
        </p>

        {action && (
          <button
            onClick={action.onClick}
            style={{
              marginTop: '12px',
              padding: '6px 16px',
              backgroundColor: style.border,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: style.text,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Fermer"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
