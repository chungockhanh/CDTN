import { Request, Response } from 'express'
import { responseSuccess, ErrorHandler } from '../utils/response'
import { RatingProductModel } from '../database/models/rating-product'
import { STATUS } from '../constants/status'
import { PAYMENT_STATUS, STATUS_PURCHASE } from '../constants/purchase'
import { PurchaseModel } from '../database/models/purchase.model'
import { ProductModel } from '../database/models/product.model'

export const CONDITION_FOR_RATING = {
  FAIL: 0,
  ADD: 1,
  UPDATE: 2,
}

const updateRatingProduct = async (
  product_id: string,
  user_id: string,
  rating: number
) => {
  const filterForRating = {
    product_id: product_id,
  }
  const ratingProductDB: any = await RatingProductModel.find(
    filterForRating
  ).exec()
  const productDB: any = await ProductModel.find({ _id: product_id })
  if (productDB) {
    const rating5 = ratingProductDB.filter((rating) => rating.rating === 5)
    const rating4 = ratingProductDB.filter((rating) => rating.rating === 4)
    const rating3 = ratingProductDB.filter((rating) => rating.rating === 3)
    const rating2 = ratingProductDB.filter((rating) => rating.rating === 2)
    const rating1 = ratingProductDB.filter((rating) => rating.rating === 1)

    let newRatingPoint =
      (rating5.length * 5 +
        rating4.length * 4 +
        rating3.length * 3 +
        rating2.length * 2 +
        rating1.length * 1) /
      (rating5.length +
        rating4.length +
        rating3.length +
        rating2.length +
        rating1.length)

    if (isNaN(newRatingPoint)) {
      newRatingPoint = 0
    } else {
      newRatingPoint.toFixed(1)
    }

    const updateProductDB = await ProductModel.findOneAndUpdate(
      { _id: product_id },
      { rating: newRatingPoint }
    )
    if (updateProductDB) {
      //   console.log(updateProductDB)
      return true
    } else {
      return false
    }
  }
  return false
}

const addRatingProduct = async (req: Request, res: Response) => {
  const { comment, rating, product_id } = req.body
  const ratingProduct = {
    user_id: req.jwtDecoded.id,
    product_id: product_id,
    comment: comment,
    rating: rating,
  }
  if (Number(rating) < 0 || Number(rating) > 5) {
    throw new ErrorHandler(422, 'rating nằm trong khoảng từ 1 đến 5')
  }
  const addedRatingProduct = await new RatingProductModel(ratingProduct).save()
  if (addedRatingProduct) {
    if (updateRatingProduct(product_id, req.jwtDecoded.id, rating)) {
      const response = {
        message: 'Thêm đánh giá và cập nhật rating thành công',
      }
      return responseSuccess(res, response)
    } else {
      throw new ErrorHandler(
        STATUS.NOT_FOUND,
        'Cập nhật rating không thành công'
      )
    }
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Thêm đánh giá không thành công')
  }
}

const checkConditionToRatingProduct = async (req: Request, res: Response) => {
  const { product_id } = req.body
  const filter = {
    user: req.jwtDecoded.id,
    product: product_id,
    paymentStatus: PAYMENT_STATUS.PAID,
    status: STATUS_PURCHASE.DELIVERED,
  }

  const purchase = await PurchaseModel.findOne(filter).exec()
  if (purchase) {
    const filterForRating = {
      user_id: filter.user,
      product_id: filter.product,
    }
    const ratingProductDB = await RatingProductModel.findOne(
      filterForRating
    ).exec()
    if (ratingProductDB) {
      const response = {
        message: 'Có thể cập nhật đánh giá sản phẩm',
        data: {
          conditionForRating: CONDITION_FOR_RATING.UPDATE,
          ratingProduct: ratingProductDB,
        },
      }
      return responseSuccess(res, response)
    } else {
      const response = {
        message: 'Có thể thêm đánh giá sản phẩm',
        data: {
          conditionForRating: CONDITION_FOR_RATING.ADD,
        },
      }
      return responseSuccess(res, response)
    }
  } else {
    const response = {
      message: 'Không thể đánh giá do chưa mua sản phẩm',
      data: {
        conditionForRating: CONDITION_FOR_RATING.FAIL,
      },
    }
    return responseSuccess(res, response)
  }
}

const getAllRatings = async (req: Request, res: Response) => {
  let {
    page = 1,
    limit = 10,
    product_id,
  } = req.query as {
    [key: string]: string | number
  }

  page = Number(page)
  limit = Number(limit)
  let condition: any = {}
  if (product_id) {
    condition.product_id = product_id
  }

  let [ratings, totalRatings]: [ratings: any, totalRatings: any] =
    await Promise.all([
      RatingProductModel.find(condition)
        .skip(page * limit - limit)
        .limit(limit)
        .sort({
          updatedAt: -1,
        })
        .select({ __v: 0 })
        .populate({
          path: 'user_id',
          select: 'name avatar',
        })
        .lean(),
      RatingProductModel.find(condition).countDocuments().lean(),
    ])
  const page_size = Math.ceil(totalRatings / limit) || 1
  const response = {
    message: 'Lấy danh sách đánh giá sản phẩm thành công',
    data: {
      ratings,
      pagination: {
        page,
        limit,
        page_size,
      },
      totalRatings,
    },
  }
  return responseSuccess(res, response)
}

const updateRatingById = async (req: Request, res: Response) => {
  const { comment, rating, product_id } = req.body
  const ratingId = req.params.rating_id
  const ratingDB = await RatingProductModel.findByIdAndUpdate(ratingId, {
    comment: comment,
    rating: rating,
  })
  if (ratingDB) {
    if (updateRatingProduct(product_id, req.jwtDecoded.id, rating)) {
      const response = {
        message: 'Cập nhật đánh giá và cập nhật rating thành công',
      }
      return responseSuccess(res, response)
    } else {
      throw new ErrorHandler(
        STATUS.NOT_FOUND,
        'Cập nhật rating không thành công'
      )
    }
  } else {
    throw new ErrorHandler(
      STATUS.NOT_FOUND,
      'Cập nhật đánh giá không thành công'
    )
  }
}

const deleteRatingById = async (req: Request, res: Response) => {
  const { rating, product_id } = req.body
  const ratingId = req.params.rating_id
  const ratingDB = await RatingProductModel.findByIdAndDelete(ratingId)
  if (ratingDB) {
    if (updateRatingProduct(product_id, req.jwtDecoded.id, rating)) {
      const response = {
        message: 'Xóa đánh giá và cập nhật rating thành công',
      }
      return responseSuccess(res, response)
    } else {
      throw new ErrorHandler(
        STATUS.NOT_FOUND,
        'Cập nhật rating không thành công'
      )
    }
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Xóa đánh giá không thành công')
  }
}

const ratingProductController = {
  addRatingProduct,
  getAllRatings,
  checkConditionToRatingProduct,
  updateRatingById,
  deleteRatingById,
}

export default ratingProductController
