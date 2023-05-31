import { Request, Response } from 'express'
import { responseSuccess, ErrorHandler } from '../utils/response'
import { STATUS } from '../constants/status'
import { CategoryModel } from '../database/models/category.model'
import { ProductModel } from '../database/models/product.model'

const addCategory = async (req: Request, res: Response) => {
  const name: string = req.body.name
  const categoryInDB = await CategoryModel.findOne({ name }).lean()
  if (categoryInDB) {
    throw new ErrorHandler(STATUS.UNPROCESSABLE_ENTITY, {
      categoryName: 'Tên danh mục sản phẩm đã tồn tại',
    })
  }
  const categoryAdd = await new CategoryModel({ name }).save()
  const response = {
    message: 'Tạo Category thành công',
    data: categoryAdd.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        return ret
      },
    }),
  }
  return responseSuccess(res, response)
}

const getCategories = async (req: Request, res: Response) => {
  if (req.jwtDecoded && req.jwtDecoded.roles[0] === 'Admin') {
    let {
      page = 1,
      limit = 10,
      search,
    } = req.query as {
      [key: string]: string | number
    }

    page = Number(page)
    limit = Number(limit)
    let condition: any = {}
    if (search) {
      condition.name = { $regex: search, $options: 'i' }
    }

    let [categories, totalCategories]: [categories: any, totalCategories: any] =
      await Promise.all([
        CategoryModel.find(condition)
          .skip(page * limit - limit)
          .limit(limit)
          .select({ __v: 0 })
          .lean(),
        CategoryModel.find(condition).countDocuments().lean(),
      ])
    const page_size = Math.ceil(totalCategories / limit) || 1
    const response = {
      message: 'Lấy categories thành công',
      data: {
        categories,
        pagination: {
          page,
          limit,
          page_size,
        },
        totalCategories,
      },
    }
    return responseSuccess(res, response)
  } else {
    const { exclude } = req.query
    let condition = exclude ? { _id: { $ne: exclude } } : {}
    const categories = await CategoryModel.find(condition)
      .select({ __v: 0 })
      .lean()
    const response = {
      message: 'Lấy categories thành công',
      data: categories,
    }
    return responseSuccess(res, response)
  }
}

const getCategory = async (req: Request, res: Response) => {
  const categoryDB = await CategoryModel.findById(req.params.category_id)
    .select({ __v: 0 })
    .lean()
  if (categoryDB) {
    const response = {
      message: 'Lấy category thành công',
      data: categoryDB,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Không tìm thấy Category')
  }
}

const updateCategory = async (req: Request, res: Response) => {
  const { name } = req.body
  const categoryInDB = await CategoryModel.findOne({ name }).lean()
  if (categoryInDB && categoryInDB._id.toString() !== req.params.category_id) {
    throw new ErrorHandler(STATUS.UNPROCESSABLE_ENTITY, {
      categoryName: 'Tên danh mục sản phẩm đã tồn tại',
    })
  }
  const categoryDB = await CategoryModel.findByIdAndUpdate(
    req.params.category_id,
    { name },
    { new: true }
  )
    .select({ __v: 0 })
    .lean()
  if (categoryDB) {
    const response = {
      message: 'Cập nhật category thành công',
      data: categoryDB,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Không tìm thấy Category')
  }
}

const deleteCategory = async (req: Request, res: Response) => {
  const category_id = req.params.category_id

  const products = await ProductModel.find({ category: category_id }).lean()

  if (products.length > 0) {
    // Nếu có sản phẩm thuộc về category này, không cho phép xóa
    throw new ErrorHandler(
      STATUS.CONFLICT,
      'Không thể xóa category này vì nó còn chứa sản phẩm'
    )
  }

  const categoryDB = await CategoryModel.findByIdAndDelete(category_id).lean()
  if (categoryDB) {
    return responseSuccess(res, { message: 'Xóa thành công' })
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Không tìm thấy Category')
  }
}

const categoryController = {
  addCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
}

export default categoryController
