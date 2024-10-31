export const auth = {
  landingPad: '/auth/landing-pad',
  login: '/auth/login',
  logout: '/auth/logout',
};

export const connections = {
  list: '/connections/list',
};

export const product = {
  details: '/product/:productId',
};

export const user = {
  profile: '/user/profile',
};

export const chats = {
  base: '/chats',
  active: (userId: string) => `/chat/active/${userId}`,
  history: (userId: string, recieverId: string) => `/chat/history/${userId}/${recieverId}`,
};

export const homepage = '/welcome';
