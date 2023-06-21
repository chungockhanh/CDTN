import commonUserRouter from './common-user.route'
import commonAuthRouter from './common-auth.route'
import commonProductRouter from './common-product.route'
import commonCategoryRouter from './common-category.route'
import commonRatingProductRouter from './commont-rating-product'

const commonRoutes = {
  prefix: '/',
  routes: [
    {
      path: '',
      route: commonUserRouter,
    },
    {
      path: '',
      route: commonAuthRouter,
    },
    {
      path: 'products',
      route: commonProductRouter,
    },
    {
      path: 'categories',
      route: commonCategoryRouter,
    },
    {
      path: 'ratings',
      route: commonRatingProductRouter,
    },
  ],
}

export default commonRoutes
