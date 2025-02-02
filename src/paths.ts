export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    stickers: '/dashboard/stickers',
    overview: '/dashboard/stickers'
  },
  errors: { notFound: '/errors/not-found' },
} as const;
