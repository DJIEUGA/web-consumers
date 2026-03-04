import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '16px',
        border: '2px dashed #e5e7eb',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
          color: '#9ca3af',
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p style={{ color: '#6b7280', marginBottom: action ? '24px' : '0' }}>
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '10px 24px',
            backgroundColor: '#2cc0c3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.border = '1px solid #2cc0c3';
            e.currentTarget.style.color = '#2cc0c3';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2cc0c3';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.border = 'none';
            e.currentTarget.style.color = '#fff';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
