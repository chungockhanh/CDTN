import { Router } from 'express'
import helpersMiddleware from '../../middleware/helpers.middleware'
import { wrapAsync } from '../../utils/response'
import ratingProductController from '../../controllers/ratingProduct.controller'

const commonRatingProductRouter = Router()
commonRatingProductRouter.get(
  '/',
  helpersMiddleware.entityValidator,
  wrapAsync(ratingProductController.getAllRatings)
)

export default commonRatingProductRouter
