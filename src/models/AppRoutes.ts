export const AppRoutes = {
  login: '/login',
  register: '/register',
  confirmAccount: '/confirm-account',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  private: {
    root: '/app',
    dashboard: 'dashboard',
    transactions: 'transactions',
    profile: 'profile',
    admin: {
      root: 'admin',
      dashboard: 'dashboard',
      logs: 'logs',
      audit: 'audit',
      users: 'users',
      categories: 'categories',
    },
  }
}