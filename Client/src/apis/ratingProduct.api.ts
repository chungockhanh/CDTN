import {
  ConditionForRating,
  RatingProduct,
  RatingProductList,
  RatingProductListConfig
} from 'src/types/ratingProduct.type'
import { SuccessResponse } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/ratings'

const ratingsProductApi = {
  getAllRatings(params: RatingProductListConfig) {
    return http.get<SuccessResponse<RatingProductList>>(`${URL}`, {
      params
    })
  },
  addRatingProduct(body: { product_id: string; comment: string; rating: number }) {
    return http.post<SuccessResponse<RatingProduct>>(`${URL}`, body)
  },
  checkConditionForRating(body: { product_id: string }) {
    return http.post<SuccessResponse<ConditionForRating>>(`${URL}/check-condition-rating`, body)
  },
  updateRatingProduct({ id, body }: { id: string; body: { product_id: string; comment: string; rating: number } }) {
    return http.put<SuccessResponse<RatingProduct>>(`${URL}/${id}`, body)
  },
  deleteRatingProduct({ id, body }: { id: string; body: { product_id: string; rating: number } }) {
    return http.put<SuccessResponse<RatingProduct>>(`${URL}/delete/${id}`, body)
  }
}

export default ratingsProductApi
