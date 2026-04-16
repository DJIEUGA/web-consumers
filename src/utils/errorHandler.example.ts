/**
 * Example usage of Error Handling utilities
 * Demonstrates how errors are parsed and displayed
 */

import { parseApiError, getErrorDescription } from './errorHandler';

// ==================== EXAMPLE 1: Network Error ====================
const networkError = {
  success: false,
  message: 'Network error occurred',
  status: 500,
};

console.log('Example 1 - Network Error:');
console.log('Input:', networkError);
console.log('Parsed:', parseApiError(networkError));
// Output:
// {
//   title: "Erreur serveur",
//   message: "Network error occurred",
//   status: 500
// }

// ==================== EXAMPLE 2: Not Found Error ====================
const notFoundError = {
  success: false,
  message: 'Profile not found',
  status: 404,
};

console.log('\nExample 2 - Not Found:');
console.log('Input:', notFoundError);
console.log('Parsed:', parseApiError(notFoundError));
// Output:
// {
//   title: "Ressource introuvable",
//   message: "Profile not found",
//   status: 404
// }

// ==================== EXAMPLE 3: Validation Error ====================
const validationError = {
  success: false,
  message: 'Invalid request data',
  status: 400,
  errors: ['Email is required', 'Password must be at least 8 characters'],
};

console.log('\nExample 3 - Validation Error:');
console.log('Input:', validationError);
console.log('Parsed:', parseApiError(validationError));
// Output:
// {
//   title: "Erreur de requête",
//   message: "Invalid request data",
//   status: 400,
//   details: ["Email is required", "Password must be at least 8 characters"]
// }

// ==================== EXAMPLE 4: Axios Error ====================
const axiosError = {
  response: {
    data: {
      success: false,
      message: 'Unauthorized access',
      status: 401,
    },
  },
};

console.log('\nExample 4 - Axios Error:');
console.log('Input:', axiosError);
console.log('Parsed:', parseApiError(axiosError));
// Output:
// {
//   title: "Non autorisé",
//   message: "Unauthorized access",
//   status: 401
// }

// ==================== EXAMPLE 5: Error Instance ====================
const errorInstance = new Error('Connection timeout');

console.log('\nExample 5 - Error Instance:');
console.log('Input:', errorInstance);
console.log('Parsed:', parseApiError(errorInstance));
// Output:
// {
//   title: "Erreur",
//   message: "Connection timeout"
// }

// ==================== EXAMPLE 6: String Error ====================
const stringError = '{"success":false,"message":"Server maintenance","status":503}';

console.log('\nExample 6 - String Error (JSON):');
console.log('Input:', stringError);
console.log('Parsed:', parseApiError(stringError));
// Output:
// {
//   title: "Erreur serveur",
//   message: "Server maintenance",
//   status: 503
// }

// ==================== EXAMPLE 7: Get Error Description ====================
console.log('\nExample 7 - Error Descriptions:');
console.log('500:', getErrorDescription(500));
// "Le serveur rencontre des difficultés. Veuillez réessayer dans quelques instants."

console.log('404:', getErrorDescription(404));
// "La ressource demandée est introuvable."

console.log('403:', getErrorDescription(403));
// "Vous n'avez pas les permissions nécessaires."

console.log('401:', getErrorDescription(401));
// "Vous devez être connecté pour accéder à cette ressource."

console.log('400:', getErrorDescription(400));
// "La requête contient des informations invalides."
