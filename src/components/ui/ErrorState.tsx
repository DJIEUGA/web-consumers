import React from 'react';

export interface ErrorStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: number;
  technicalDetails?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon,
  title,
  description,
  status,
  technicalDetails,
  action,
}) => {
  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        borderRadius: '16px',
        border: '2px solid #fecaca',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
          color: '#ef4444',
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#dc2626',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p style={{ color: '#991b1b', marginBottom: '12px' }}>
        {description}
      </p>

      {status && (
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#fee2e2',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '12px',
          }}
        >
          Code d'erreur: {status}
        </div>
      )}

      {technicalDetails && (
        <details
          style={{
            marginTop: '16px',
            marginBottom: '16px',
            textAlign: 'left',
            maxWidth: '500px',
            margin: '16px auto',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#7f1d1d',
              fontWeight: '500',
              padding: '8px',
              backgroundColor: '#fee2e2',
              borderRadius: '6px',
              userSelect: 'none',
            }}
          >
            Détails techniques
          </summary>
          <pre
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#450a0a',
              color: '#fecaca',
              borderRadius: '6px',
              fontSize: '0.75rem',
              overflow: 'auto',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {technicalDetails}
          </pre>
        </details>
      )}

      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '10px 24px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s',
            marginTop: '12px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
