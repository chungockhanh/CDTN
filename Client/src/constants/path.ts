const path = {
  home: '/',
  user: '/user',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchase: '/user/purchase',
  admin: '/admin',
  userManganer: '/admin/users',
  productManganer: '/admin/products',
  categoryManganer: '/admin/categories',
  purchaseManganer: '/admin/purchases',
  login: '/login',
  register: '/register',
  logout: '/logout',
  id: ':id',
  cart: '/cart',
  paymentNotification: '/payment'
} as const

export default path
