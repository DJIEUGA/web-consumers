/**
 * Visual Test Component for Error States
 * Use this to preview different error displays
 */

import React, { useState } from 'react';
import { ErrorState, EmptyState } from '@/components/ui';
import { FiAlertCircle, FiUsers } from 'react-icons/fi';

export const ErrorStateDemo = () => {
  const [selectedError, setSelectedError] = useState<string>('500');

  const errorExamples = {
    '500': {
      title: 'Erreur serveur',
      description: 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques instants.',
      status: 500,
      technicalDetails: JSON.stringify(
        {
          success: false,
          message: 'Network error occurred',
          status: 500,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
    },
    '404': {
      title: 'Ressource introuvable',
      description: 'La ressource demandée est introuvable.',
      status: 404,
      technicalDetails: JSON.stringify(
        {
          success: false,
          message: 'Profile not found',
          status: 404,
          path: '/api/v1/profiles/123456',
        },
        null,
        2
      ),
    },
    '401': {
      title: 'Non autorisé',
      description: 'Vous devez être connecté pour accéder à cette ressource.',
      status: 401,
      technicalDetails: JSON.stringify(
        {
          success: false,
          message: 'Authentication required',
          status: 401,
        },
        null,
        2
      ),
    },
    '400': {
      title: 'Erreur de requête',
      description: 'La requête contient des informations invalides.',
      status: 400,
      technicalDetails: JSON.stringify(
        {
          success: false,
          message: 'Validation failed',
          status: 400,
          errors: ['Email format is invalid', 'Password is too short'],
        },
        null,
        2
      ),
    },
  };

  const currentError = errorExamples[selectedError as keyof typeof errorExamples];

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '2rem', fontWeight: 'bold' }}>
        Error State Preview
      </h1>

      {/* Selector */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          Select Error Type:
        </label>
        <select
          value={selectedError}
          onChange={(e) => setSelectedError(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            fontSize: '0.9rem',
          }}
        >
          <option value="500">500 - Server Error</option>
          <option value="404">404 - Not Found</option>
          <option value="401">401 - Unauthorized</option>
          <option value="400">400 - Bad Request</option>
        </select>
      </div>

      {/* Error Display */}
      <div style={{ marginBottom: '48px' }}>
        <h2
          style={{
            marginBottom: '16px',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#dc2626',
          }}
        >
          Error State Component:
        </h2>
        <ErrorState
          icon={<FiAlertCircle size={48} />}
          title={currentError.title}
          description={currentError.description}
          status={currentError.status}
          technicalDetails={currentError.technicalDetails}
          action={{
            label: 'Réessayer',
            onClick: () => alert('Reload triggered!'),
          }}
        />
      </div>

      {/* Empty State for comparison */}
      <div>
        <h2
          style={{
            marginBottom: '16px',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
          }}
        >
          Empty State Component (for comparison):
        </h2>
        <EmptyState
          icon={<FiUsers size={48} />}
          title="Aucun professionnel trouvé"
          description="Essayez de modifier vos critères de recherche ou explorez d'autres catégories."
          action={{
            label: 'Réinitialiser les filtres',
            onClick: () => alert('Filters reset!'),
          }}
        />
      </div>

      {/* Code Example */}
      <div style={{ marginTop: '48px' }}>
        <h2
          style={{
            marginBottom: '16px',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          Code Example:
        </h2>
        <pre
          style={{
            backgroundColor: '#1f2937',
            color: '#f3f4f6',
            padding: '20px',
            borderRadius: '12px',
            overflow: 'auto',
            fontSize: '0.875rem',
          }}
        >
          {`<ErrorState
  icon={<FiAlertCircle size={48} />}
  title="${currentError.title}"
  description="${currentError.description}"
  status={${currentError.status}}
  technicalDetails={JSON.stringify(error, null, 2)}
  action={{
    label: 'Réessayer',
    onClick: () => window.location.reload()
  }}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default ErrorStateDemo;
