import { Request, Response } from 'express'
import {
  METHOD_PAY,
  PAYMENT_STATUS,
  STATUS_PURCHASE,
} from '../constants/purchase'
import { STATUS } from '../constants/status'
import { ProductModel } from '../database/models/product.model'
import { PurchaseModel } from '../database/models/purchase.model'
import { ErrorHandler, responseSuccess } from '../utils/response'
import { handleImageProduct } from './product.controller'
import { cloneDeep } from 'lodash'
import { UserModel } from '../database/models/user.model'
import moment from 'moment'
import { vnPayConfig } from '../constants/config'
import * as querystring from 'qs'
import crypto from 'crypto'

export const addToCart = async (req: Request, res: Response) => {
  const { product_id, buy_count } = req.body
  const product: any = await ProductModel.findById(product_id).lean()
  if (product) {
    if (buy_count > product.quantity) {
      throw new ErrorHandler(
        STATUS.NOT_ACCEPTABLE,
        'Số lượng vượt quá số lượng sản phẩm'
      )
    }
    const purchaseInDb: any = await PurchaseModel.findOne({
      user: req.jwtDecoded.id,
      status: STATUS_PURCHASE.IN_CART,
      product: {
        _id: product_id,
      },
    }).populate({
      path: 'product',
      populate: {
        path: 'category',
      },
    })
    let data
    if (purchaseInDb) {
      data = await PurchaseModel.findOneAndUpdate(
        {
          user: req.jwtDecoded.id,
          status: STATUS_PURCHASE.IN_CART,
          product: {
            _id: product_id,
          },
        },
        {
          buy_count: purchaseInDb.buy_count + buy_count,
          expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          new: true,
        }
      )
        .populate({
          path: 'product',
          populate: {
            path: 'category',
          },
        })
        .lean()
    } else {
      const purchase = {
        user: req.jwtDecoded.id,
        product: product._id,
        buy_count: buy_count,
        price: product.price,
        price_before_discount: product.price_before_discount,
        status: STATUS_PURCHASE.IN_CART,
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
      const addedPurchase = await new PurchaseModel(purchase).save()
      data = await PurchaseModel.findById(addedPurchase._id).populate({
        path: 'product',
        populate: {
          path: 'category',
        },
      })
    }
    const response = {
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
  }
}

export const updatePurchase = async (req: Request, res: Response) => {
  const { product_id, buy_count } = req.body
  const purchaseInDb: any = await PurchaseModel.findOne({
    user: req.jwtDecoded.id,
    status: STATUS_PURCHASE.IN_CART,
    product: {
      _id: product_id,
    },
  })
    .populate({
      path: 'product',
      populate: {
        path: 'category',
      },
    })
    .lean()
  if (purchaseInDb) {
    if (buy_count > purchaseInDb.product.quantity) {
      throw new ErrorHandler(
        STATUS.NOT_ACCEPTABLE,
        'Số lượng vượt quá số lượng sản phẩm'
      )
    }
    const data = await PurchaseModel.findOneAndUpdate(
      {
        user: req.jwtDecoded.id,
        status: STATUS_PURCHASE.IN_CART,
        product: {
          _id: product_id,
        },
      },
      {
        buy_count,
      },
      {
        new: true,
      }
    )
      .populate({
        path: 'product',
        populate: {
          path: 'category',
        },
      })
      .lean()
    const response = {
      message: 'Cập nhật đơn thành công',
      data,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy đơn')
  }
}

export const buyProducts = async (req: Request, res: Response) => {
  const purchases = []
  for (const item of req.body) {
    const product: any = await ProductModel.findById(item.product_id).lean()
    if (product) {
      if (item.buy_count > product.quantity) {
        throw new ErrorHandler(
          STATUS.NOT_ACCEPTABLE,
          'Số lượng mua vượt quá số lượng sản phẩm'
        )
      } else {
        let data = await PurchaseModel.findOneAndUpdate(
          {
            user: req.jwtDecoded.id,
            status: STATUS_PURCHASE.IN_CART,
            product: {
              _id: item.product_id,
            },
          },
          {
            $unset: { expireAt: 1 },
            buy_count: item.buy_count,
            orderId: item.orderId,
            payMethod: item.payMethod,
            status: item.status,
          },
          {
            new: true,
          }
        )
          .populate({
            path: 'product',
            populate: {
              path: 'category',
            },
          })
          .lean()
        if (!data) {
          const purchase = {
            user: req.jwtDecoded.id,
            product: item.product_id,
            buy_count: item.buy_count,
            price: product.price,
            price_before_discount: product.price_before_discount,
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
            orderId: item.orderId,
            payMethod: item.payMethod,
          }
          const addedPurchase = await new PurchaseModel(purchase).save()
          data = await PurchaseModel.findById(addedPurchase._id).populate({
            path: 'product',
            populate: {
              path: 'category',
            },
          })
        }
        purchases.push(data)
      }
    } else {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
    }
  }
  const response = {
    message: 'Mua thành công',
    data: purchases,
  }
  return responseSuccess(res, response)
}

export const getPurchases = async (req: Request, res: Response) => {
  const { status = STATUS_PURCHASE.ALL } = req.query
  const user_id = req.jwtDecoded.id
  let condition: any = {
    user: user_id,
    status: {
      $ne: STATUS_PURCHASE.IN_CART,
    },
  }
  if (Number(status) !== STATUS_PURCHASE.ALL) {
    condition.status = status
  }

  let purchases: any = await PurchaseModel.find(condition)
    .populate({
      path: 'product',
      populate: {
        path: 'category',
      },
    })
    .sort({
      createdAt: -1,
    })
    .lean()
  purchases = purchases.map((purchase) => {
    purchase.product = handleImageProduct(cloneDeep(purchase.product))
    return purchase
  })
  const response = {
    message: 'Lấy đơn mua thành công',
    data: purchases,
  }
  return responseSuccess(res, response)
}

export const deletePurchases = async (req: Request, res: Response) => {
  const purchase_ids = req.body
  const user_id = req.jwtDecoded.id
  const deletedData = await PurchaseModel.deleteMany({
    user: user_id,
    status: STATUS_PURCHASE.IN_CART,
    _id: { $in: purchase_ids },
  })
  return responseSuccess(res, {
    message: `Xoá ${deletedData.deletedCount} đơn thành công`,
    data: { deleted_count: deletedData.deletedCount },
  })
}

export const getAllPurchases = async (req: Request, res: Response) => {
  let {
    status = STATUS_PURCHASE.ALL,
    page = 1,
    limit = 2,
    search,
  } = req.query as {
    [key: string]: string | number
  }

  const productDB: any = await ProductModel.findOne({ name: search }).exec()

  const email = search ? { $regex: search, $options: 'i' } : ''

  const userInDB = await UserModel.findOne({ email: email }).exec()

  page = Number(page)
  limit = Number(limit)

  let condition: any = {
    status: {
      $ne: STATUS_PURCHASE.IN_CART,
    },
  }
  if (Number(status) !== STATUS_PURCHASE.ALL) {
    condition.status = status
  }
  if (search && userInDB && !productDB) {
    condition.user = userInDB?._id
  }
  if (search && productDB && !userInDB) {
    condition.product = productDB?._id
  }

  let [purchases, totalPurchases]: [purchases: any, totalPurchases: any] =
    await Promise.all([
      PurchaseModel.find(condition)
        .skip(page * limit - limit)
        .limit(limit)
        .populate({
          path: 'user',
          select: 'email name',
        })
        .populate({
          path: 'product',
          populate: {
            path: 'category',
          },
        })
        .sort({
          createdAt: -1,
        })
        .lean(),
      PurchaseModel.find(condition).countDocuments().lean(),
    ])
  purchases = purchases.map((purchase) => {
    purchase.product = handleImageProduct(cloneDeep(purchase.product))
    return purchase
  })

  const page_size = Math.ceil(totalPurchases / limit) || 1
  const response = {
    message: 'Lấy danh sách người dùng thành công',
    data: {
      purchases,
      pagination: {
        page,
        limit,
        page_size,
      },
      totalPurchases,
    },
  }

  return responseSuccess(res, response)
}

const updateProductIfDelivered = async (
  productId: string,
  buyCount: number
) => {
  const productDB: any = await ProductModel.findById(productId)
  if (productDB) {
    const updateProduct = await ProductModel.updateOne(
      { _id: productId, quantity: { $gte: buyCount } },
      { $inc: { quantity: -buyCount, sold: buyCount } }
    )
      .select({ __v: 0 })
      .lean()

    if (updateProduct) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

export const updatePurchaseStatus = async (req: Request, res: Response) => {
  let { status } = req.body
  const purchaseDB: any = await PurchaseModel.findById(req.params.purchase_id)
  if (purchaseDB) {
    let updatePurchase: any = null
    if (status === STATUS_PURCHASE.DELIVERED) {
      const productId = purchaseDB.product
      const buyCount = purchaseDB.buy_count
      const updateProductQuantity = await updateProductIfDelivered(
        productId,
        buyCount
      )
      if (updateProductQuantity) {
        updatePurchase = await PurchaseModel.findByIdAndUpdate(
          req.params.purchase_id,
          { status: status, paymentStatus: PAYMENT_STATUS.PAID },
          { new: true }
        )
          .select({ __v: 0 })
          .lean()
      } else {
        throw new ErrorHandler(
          STATUS.BAD_REQUEST,
          'Số lượng mua lớn hơn số lượng sản phẩm'
        )
      }
    } else if (status === STATUS_PURCHASE.IN_PROGRESS) {
      const productId = purchaseDB.product
      const productDB: any = await ProductModel.findById(productId)
      if (productDB) {
        const productQuantity = productDB.quantity
        const buyCount = purchaseDB.buy_count
        if (productQuantity > buyCount) {
          updatePurchase = await PurchaseModel.findByIdAndUpdate(
            req.params.purchase_id,
            { status },
            { new: true }
          )
            .select({ __v: 0 })
            .lean()
        } else {
          throw new ErrorHandler(
            STATUS.BAD_REQUEST,
            'Số lượng mua lớn hơn số lượng sản phẩm'
          )
        }
      }
    } else {
      updatePurchase = await PurchaseModel.findByIdAndUpdate(
        req.params.purchase_id,
        { status },
        { new: true }
      )
        .select({ __v: 0 })
        .lean()
    }
    if (updatePurchase) {
      const response = {
        message: 'Cập nhật hóa đơn thành công',
        data: purchaseDB,
      }
      return responseSuccess(res, response)
    } else {
      throw new ErrorHandler(STATUS.BAD_REQUEST, 'Không tìm thấy hóa đơn')
    }
  }
}

export const getPurchase = async (req: Request, res: Response) => {
  const purchaseDB: any = await PurchaseModel.findById(req.params.purchase_id)
    .populate({
      path: 'user',
      select: 'email name address phone',
    })
    .populate({
      path: 'product',
      populate: {
        path: 'category',
      },
    })
    .lean()
  if (purchaseDB) {
    purchaseDB.product = handleImageProduct(purchaseDB.product)
    const response = {
      message: 'Lấy hóa đơn thành công',
      data: purchaseDB,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Không tìm thấy hóa đơn')
  }
}

export const deletePurchase = async (req: Request, res: Response) => {
  const purchase_id = req.params.purchase_id

  const purchaseDB = await PurchaseModel.findByIdAndDelete(purchase_id).lean()
  if (purchaseDB) {
    return responseSuccess(res, { message: 'Xóa thành công' })
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Không tìm thấy hóa đơn')
  }
}

function sortObject(obj) {
  let sorted = {}
  let str = []
  let key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}

export const createPaymentVnPay = async (req: Request, res: Response) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  let date = new Date()
  let createDate = moment(date).format('YYYYMMDDHHmmss')
  let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  let tmnCode = vnPayConfig.vnp_TmnCode
  let secretKey = vnPayConfig.vnp_HashSecret
  let vnpUrl = vnPayConfig.vnp_Url
  let returnUrl = vnPayConfig.vnp_ReturnUrl
  let orderId = req.body.orderId
  let amount = req.body.amount
  // let bankCode = ''

  let locale = 'vn'
  let currCode = 'VND'
  let vnp_Params = {}
  vnp_Params['vnp_Version'] = '2.1.0'
  vnp_Params['vnp_Command'] = 'pay'
  vnp_Params['vnp_TmnCode'] = tmnCode
  vnp_Params['vnp_Locale'] = locale
  vnp_Params['vnp_CurrCode'] = currCode
  vnp_Params['vnp_TxnRef'] = orderId
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId
  vnp_Params['vnp_OrderType'] = 'other'
  vnp_Params['vnp_Amount'] = amount * 100
  vnp_Params['vnp_ReturnUrl'] = returnUrl
  vnp_Params['vnp_IpAddr'] = ipAddr
  vnp_Params['vnp_CreateDate'] = createDate
  // vnp_Params['vnp_BankCode'] = 'NCB'
  // vnp_Params['vnp_BankCode'] = ''
  // // if (bankCode !== null && bankCode !== '') {
  // //   vnp_Params['vnp_BankCode'] = bankCode
  // // }

  vnp_Params = sortObject(vnp_Params)

  let signData = querystring.stringify(vnp_Params, { encode: false })
  let hmac = crypto.createHmac('sha512', secretKey)
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
  vnp_Params['vnp_SecureHash'] = signed
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })

  const response = {
    message: 'Link thanh toán VnPay',
    data: {
      vnPayURL: vnpUrl,
    },
  }
  return responseSuccess(res, response)
}

export const updatePurchaseStatusByOrderId = async (
  req: Request,
  res: Response
) => {
  const purchasesListByOrderId = await PurchaseModel.find({
    orderId: req.body.orderId,
  })
  if (purchasesListByOrderId) {
    const filter = { orderId: req.body.orderId }
    const purchases = await PurchaseModel.updateMany(filter, {
      status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
      payMethod: METHOD_PAY.BY_VNPAY,
      paymentStatus: PAYMENT_STATUS.PAID,
      $unset: { expireAt: 1 },
    })
    const response = {
      message: 'Cập nhật đơn hàng thành công',
      data: purchases,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy đơn hàng')
  }
}

export const updatePurchasesPaybyVnPay = async (
  req: Request,
  res: Response
) => {
  const purchases = []
  for (const item of req.body) {
    const product: any = await ProductModel.findById(item.product_id).lean()
    if (product) {
      if (item.buy_count > product.quantity) {
        throw new ErrorHandler(
          STATUS.NOT_ACCEPTABLE,
          'Số lượng mua vượt quá số lượng sản phẩm'
        )
      } else {
        let data = await PurchaseModel.findOneAndUpdate(
          {
            user: req.jwtDecoded.id,
            status: STATUS_PURCHASE.IN_CART,
            product: {
              _id: item.product_id,
            },
          },
          {
            buy_count: item.buy_count,
            orderId: item.orderId,
            status: STATUS_PURCHASE.IN_CART,
          },
          {
            new: true,
          }
        )
          .populate({
            path: 'product',
            populate: {
              path: 'category',
            },
          })
          .lean()
        if (!data) {
          const purchase = {
            user: req.jwtDecoded.id,
            product: item.product_id,
            buy_count: item.buy_count,
            price: product.price,
            price_before_discount: product.price_before_discount,
            status: STATUS_PURCHASE.IN_CART,
            orderId: item.orderId,
          }
          const addedPurchase = await new PurchaseModel(purchase).save()
          data = await PurchaseModel.findById(addedPurchase._id).populate({
            path: 'product',
            populate: {
              path: 'category',
            },
          })
        }
        purchases.push(data)
      }
    } else {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
    }
  }
  const response = {
    message: 'Cập nhật thành công',
    data: purchases,
  }
  return responseSuccess(res, response)
}

// remove field orderId
export const removeFieldPurchaseByOrderId = async (
  req: Request,
  res: Response
) => {
  const orderId = req.body.orderId

  const purchasesListByOrderId = await PurchaseModel.find({ orderId })

  if (purchasesListByOrderId) {
    await PurchaseModel.updateMany(
      { orderId },
      {
        $unset: { orderId: 1 },
      }
    )

    const response = {
      message: 'Xóa trường thành công',
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy đơn hàng')
  }
}
