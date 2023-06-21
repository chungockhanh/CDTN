import { Router } from 'express'
import authMiddleware from '../../middleware/auth.middleware'
import helpersMiddleware from '../../middleware/helpers.middleware'
import { wrapAsync } from '../../utils/response'
import ratingProductController from '../../controllers/ratingProduct.controller'

export const userRatingRouter = Router()

userRatingRouter.post(
  '/',
  authMiddleware.verifyAccessToken,
  wrapAsync(ratingProductController.addRatingProduct)
)

userRatingRouter.post(
  '/check-condition-rating',
  authMiddleware.verifyAccessToken,
  wrapAsync(ratingProductController.checkConditionToRatingProduct)
)

userRatingRouter.put(
  '/:rating_id',
  authMiddleware.verifyAccessToken,
  wrapAsync(ratingProductController.updateRatingById)
)

userRatingRouter.put(
  '/delete/:rating_id',
  authMiddleware.verifyAccessToken,
  wrapAsync(ratingProductController.deleteRatingById)
)
