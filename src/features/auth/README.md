/**
 * Auth feature module - README
 * 
 * This module contains all authentication-related logic including:
 * - Login/Register/Logout flows
 * - Session management
 * - Auth guards
 * 
 * Structure:
 * - components/    - Login/Register forms
 * - hooks/         - useAuthMutations for TanStack Query integration
 * - services/      - API calls (authApi.js)
 * - types/         - TypeScript definitions
 * 
 * Usage example:
 * 
 * import { useLoginMutation } from '@/features/auth/hooks/useAuthMutations';
 * import { useAuthStore } from '@/stores/useAuthStore';
 * 
 * function LoginPage() {
 *   const loginMutation = useLoginMutation();
 *   const { user, isAuthenticated } = useAuthStore();
 *   
 *   const handleLogin = async (credentials) => {
 *     await loginMutation.mutateAsync(credentials);
 *   };
 *   
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault();
 *       handleLogin({ email: 'user@example.com', password: 'pass' });
 *     }}>
 *       {loginMutation.isPending && <span>Loading...</span>}
 *       {loginMutation.isError && <span>Error: {loginMutation.error.message}</span>}
 *       <button type="submit">Login</button>
 *     </form>
 *   );
 * }
 */
