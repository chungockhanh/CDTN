import { userPurchaseRouter } from './purchase.route'
import { userRatingRouter } from './rating.route'
import { userUserRouter } from './user-user.route'

const userRoutes = {
  prefix: '/',
  routes: [
    {
      path: 'user',
      route: userUserRouter,
    },
    {
      path: 'purchases',
      route: userPurchaseRouter,
    },
    {
      path: 'ratings',
      route: userRatingRouter,
    },
  ],
}

export default userRoutes
