export interface RatingProduct {
  _id: string
  user_id: string
  product_id: string
  comment: string
  rating: string
  createdAt: string
  updatedAt: string
}

export interface RatingProductWithUserDetail extends Omit<RatingProduct, 'user_id'> {
  user_id: {
    name?: string
    avatar?: string
  }
}

export interface RatingProductList {
  ratings: RatingProductWithUserDetail[]
  pagination: {
    page: number
    limit: number
    page_size: number
  }
  totalRatings: number
}

export interface RatingProductListConfig {
  page?: number | string
  limit?: number | string
  product_id?: number | string
}

export interface ConditionForRating {
  conditionForRating: number
  ratingProduct?: RatingProduct
}
