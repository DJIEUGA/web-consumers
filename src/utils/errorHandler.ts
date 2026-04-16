/**
 * Error Handler Utilities
 * Parse and format API errors for better UX
 */

export interface ApiError {
  success: boolean;
  message: string;
  status?: number;
  errors?: string[];
}

export interface ParsedError {
  title: string;
  message: string;
  status?: number;
  details?: string[];
}

/**
 * Extract meaningful error information from various error formats
 */
export const parseApiError = (error: unknown): ParsedError => {
  // Default error
  const defaultError: ParsedError = {
    title: 'Erreur de chargement',
    message: 'Une erreur est survenue. Veuillez réessayer.',
  };

  // Handle null/undefined
  if (!error) {
    return defaultError;
  }

  // Handle Error instances
  if (error instanceof Error) {
    // Try to parse error message as JSON (in case it's stringified)
    try {
      const parsed = JSON.parse(error.message);
      if (typeof parsed === 'object') {
        return parseApiError(parsed);
      }
    } catch {
      // Not JSON, use as is
    }

    return {
      title: 'Erreur',
      message: error.message || defaultError.message,
    };
  }

  // Handle API error response (axios error with response.data)
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Check for axios error structure
    if (err.response?.data) {
      return parseApiError(err.response.data);
    }

    // Check for our API error format
    if ('success' in err || 'message' in err || 'status' in err) {
      const apiError = err as Partial<ApiError>;
      
      return {
        title: getErrorTitle(apiError.status),
        message: apiError.message || defaultError.message,
        status: apiError.status,
        details: apiError.errors,
      };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      return parseApiError(parsed);
    } catch {
      return {
        title: 'Erreur',
        message: error,
      };
    }
  }

  return defaultError;
};

/**
 * Get a user-friendly title based on status code
 */
const getErrorTitle = (status?: number): string => {
  if (!status) return 'Erreur';

  if (status >= 500) {
    return 'Erreur serveur';
  }

  if (status === 404) {
    return 'Ressource introuvable';
  }

  if (status === 403) {
    return 'Accès refusé';
  }

  if (status === 401) {
    return 'Non autorisé';
  }

  if (status >= 400) {
    return 'Erreur de requête';
  }

  return 'Erreur';
};

/**
 * Get a user-friendly description based on status code
 */
export const getErrorDescription = (status?: number): string => {
  if (!status) return 'Veuillez réessayer ultérieurement.';

  if (status >= 500) {
    return 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques instants.';
  }

  if (status === 404) {
    return 'La ressource demandée est introuvable.';
  }

  if (status === 403) {
    return 'Vous n\'avez pas les permissions nécessaires.';
  }

  if (status === 401) {
    return 'Vous devez être connecté pour accéder à cette ressource.';
  }

  if (status >= 400) {
    return 'La requête contient des informations invalides.';
  }

  return 'Veuillez réessayer ultérieurement.';
};

/**
 * Format error for display in UI
 */
export const formatErrorMessage = (error: unknown): string => {
  const parsed = parseApiError(error);
  
  let message = parsed.message;
  
  if (parsed.status) {
    message += ` (Code: ${parsed.status})`;
  }
  
  if (parsed.details && parsed.details.length > 0) {
    message += `\n• ${parsed.details.join('\n• ')}`;
  }
  
  return message;
};
