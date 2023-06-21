import { Product } from './product.type'

export type PurchaseStatus = -1 | 1 | 2 | 3 | 4 | 5

export type PurchaseListStatus = PurchaseStatus | 0

export interface Purchase {
  _id: string
  buy_count: number
  price: number
  price_before_discount: number
  status: PurchaseStatus
  user: string
  product: Product
  createdAt: string
  updatedAt: string
  orderId: string
  payMethod?: number
  paymentStatus?: number
}

export interface PurchaseWithUserDetail extends Omit<Purchase, 'user'> {
  user: {
    email?: string
    name?: string
    address?: string
    phone?: string
  }
}

export interface PurchasesList {
  purchases: PurchaseWithUserDetail[]
  pagination: {
    page: number
    limit: number
    page_size: number
  }
  totalPurchases: number
}

export interface ExtendedPurchase extends Purchase {
  disabled: boolean
  checked: boolean
}

export interface PurchaseListConfig {
  page?: number | string
  limit?: number | string
  search?: number | string
  status?: number | string
}
