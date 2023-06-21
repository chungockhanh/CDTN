import { Purchase, PurchaseListConfig, PurchaseListStatus, PurchasesList } from 'src/types/purchase.type'
import { SuccessResponse } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = 'purchases'

const purchaseApi = {
  addToCart(body: { product_id: string; buy_count: number }) {
    return http.post<SuccessResponse<Purchase>>(`${URL}/add-to-cart`, body)
  },
  getPurchases(params: { status: PurchaseListStatus }) {
    return http.get<SuccessResponse<Purchase[]>>(`${URL}`, {
      params
    })
  },
  getAllPurchase(params?: PurchaseListConfig) {
    return http.get<SuccessResponse<PurchasesList>>(`${URL}/all`, {
      params
    })
  },
  buyProducts(body: { product_id: string; buy_count: number; orderId: string; payMethod: number; status: number }[]) {
    return http.post<SuccessResponse<Purchase[]>>(`${URL}/buy-products`, body)
  },
  updatePurchase(body: { product_id: string; buy_count: number }) {
    return http.put<SuccessResponse<Purchase>>(`${URL}/update-purchase`, body)
  },
  deletePurchase(purchaseIds: string[]) {
    return http.delete<SuccessResponse<{ deleted_count: number }>>(`${URL}`, {
      data: purchaseIds
    })
  },
  payByVnPay(body: { amount: number; orderId: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.post<any>(`${URL}/create-payment-url`, body)
  },
  updatePurchaseByOrderId(body: { orderId: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.put<any>(`${URL}/update-by-orderId`, body)
  },
  removeFieldByOrderId(body: { orderId: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.put<any>(`${URL}/remove-field-by-orderId`, body)
  },
  addOrderIdToPurchasePayByVnPay(body: { product_id: string; buy_count: number; orderId: string }[]) {
    return http.post<SuccessResponse<Purchase[]>>(`${URL}/update-by-vnpay`, body)
  }
}

export default purchaseApi
