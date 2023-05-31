import { Router } from 'express'
import * as purchaseMiddleware from '../../middleware/purchase.middleware'
import * as purchaseController from '../../controllers/purchase.controller'
import authMiddleware from '../../middleware/auth.middleware'
import helpersMiddleware from '../../middleware/helpers.middleware'
import { wrapAsync } from '../../utils/response'

const adminPurchaseRouter = Router()
adminPurchaseRouter.get(
  '',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  purchaseController.getAllPurchases
)
adminPurchaseRouter.get(
  '/:purchase_id',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.idRule('purchase_id'),
  helpersMiddleware.idValidator,
  wrapAsync(purchaseController.getPurchase)
)
adminPurchaseRouter.put(
  '/status/:purchase_id',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.idRule('purchase_id'),
  helpersMiddleware.idValidator,
  wrapAsync(purchaseController.updatePurchaseStatus)
)
adminPurchaseRouter.delete(
  '/delete/:purchase_id',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.idRule('purchase_id'),
  helpersMiddleware.idValidator,
  wrapAsync(purchaseController.deletePurchase)
)

export default adminPurchaseRouter
