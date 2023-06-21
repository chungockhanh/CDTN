import { Router } from 'express'
import authMiddleware from '../../middleware/auth.middleware'
import helpersMiddleware from '../../middleware/helpers.middleware'
import * as purchaseMiddleware from '../../middleware/purchase.middleware'
import * as purchaseController from '../../controllers/purchase.controller'
import { wrapAsync } from '../../utils/response'

export const userPurchaseRouter = Router()

userPurchaseRouter.post(
  '/buy-products',
  purchaseMiddleware.buyProductsRules(),
  helpersMiddleware.entityValidator,
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.buyProducts)
)

userPurchaseRouter.post(
  '/add-to-cart',
  purchaseMiddleware.addToCartRules(),
  helpersMiddleware.entityValidator,
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.addToCart)
)

userPurchaseRouter.put(
  '/update-purchase',
  purchaseMiddleware.updatePurchaseRules(),
  helpersMiddleware.entityValidator,
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.updatePurchase)
)

userPurchaseRouter.delete(
  '',
  purchaseMiddleware.deletePurchasesRules(),
  helpersMiddleware.entityValidator,
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.deletePurchases)
)

userPurchaseRouter.get(
  '',
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.getPurchases)
)

userPurchaseRouter.get(
  '/all',
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.getAllPurchases)
)

userPurchaseRouter.post(
  '/create-payment-url',
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.createPaymentVnPay)
)

userPurchaseRouter.put(
  '/update-by-orderId',
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.updatePurchaseStatusByOrderId)
)

userPurchaseRouter.post(
  '/update-by-vnpay',
  purchaseMiddleware.buyProductsRules(),
  helpersMiddleware.entityValidator,
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.updatePurchasesPaybyVnPay)
)

userPurchaseRouter.put(
  '/remove-field-by-orderId',
  authMiddleware.verifyAccessToken,
  wrapAsync(purchaseController.removeFieldPurchaseByOrderId)
)
