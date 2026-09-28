/**
 * Resolves the primary dashboard route for a given user or user role.
 * Centralizes role-to-path navigation logic used across the application.
 *
 * @param {Object|string} roleOrUser - User object with `role` property, or role string directly
 * @returns {string} Dashboard path ('/admin', '/doctor', or '/patient')
 */
export const getRoleDashboardPath = (roleOrUser) => {
  const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
  if (role === 'admin') return '/admin';
  if (role === 'doctor') return '/doctor';
  return '/patient';
};
