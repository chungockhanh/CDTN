import { Category, CategoryList, CategoryListConfig } from 'src/types/category.type'
import { Product, ProductImg } from 'src/types/product.type'
import { Purchase, PurchaseListConfig, PurchaseWithUserDetail, PurchasesList } from 'src/types/purchase.type'
import { User, UserList, UserListConfig } from 'src/types/user.type'
import { SuccessResponse } from 'src/types/utils.type'
import http from 'src/utils/http'

interface BodyAddUser {
  email: string
  name: string
  password: string
  roles: string[]
}

interface BodyUpdateUser {
  roles?: string[]
  email?: string
  name?: string
  date_of_birth?: string
  address?: string
  phone?: string
}

interface BodyAddProduct {
  name: string
  category: string
  images: string[]
  image: string
  description: string
  quantity: number
  price: number
}

interface BodyUpdateProduct extends BodyAddProduct {
  rating?: number
  price_before_discount?: number
}

interface bodyUpdatePurchaseStatus {
  status: number
}

interface updateUserFuncParam {
  id: string
  body: BodyUpdateUser
}

interface updateProductFuncParam {
  id: string
  body: BodyUpdateProduct
}

interface updateCategoryFuncParam {
  id: string
  body: Omit<Category, '_id'>
}

interface updatePurchaseStatusFuncParam {
  id: string
  body: bodyUpdatePurchaseStatus
}

const URL = 'admin'
const adminApi = {
  addUser(body: BodyAddUser) {
    return http.post<SuccessResponse<User>>(`${URL}/users`, body)
  },
  getUsers(params?: UserListConfig) {
    return http.get<SuccessResponse<UserList>>(`${URL}/users`, {
      params
    })
  },
  getUser(userId: string) {
    return http.get<SuccessResponse<User>>(`${URL}/users/${userId}`)
  },
  updateUser({ id, body }: updateUserFuncParam) {
    return http.put<SuccessResponse<User>>(`${URL}/users/${id}`, body)
  },
  deleteUser(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.delete<SuccessResponse<any>>(`${URL}/users/delete/${userId}`)
  },
  addCategory({ name }: { name: string }) {
    return http.post<SuccessResponse<Category>>(`${URL}/categories/`, { name })
  },
  getCategories(params?: CategoryListConfig) {
    return http.get<SuccessResponse<CategoryList>>(`${URL}/categories/`, {
      params
    })
  },
  getCategory(categotyId: string) {
    return http.get<SuccessResponse<Category>>(`${URL}/categories/${categotyId}`)
  },
  updateCategory({ id, body }: updateCategoryFuncParam) {
    return http.put<SuccessResponse<User>>(`${URL}/categories/${id}`, body)
  },
  deleteCategory(categotyId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.delete<SuccessResponse<any>>(`${URL}/categories/delete/${categotyId}`)
  },
  uploadImageProduct(body: FormData) {
    return http.post<SuccessResponse<string>>(`${URL}/products/upload-image`, body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadImagesProduct(body: FormData) {
    return http.post<SuccessResponse<string[]>>(`${URL}/products/upload-images`, body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  addProduct(body: BodyAddProduct) {
    return http.post<SuccessResponse<Product>>(`${URL}/products`, body)
  },
  deleteProduct(productId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.delete<SuccessResponse<any>>(`${URL}/products/delete/${productId}`)
  },
  deleteProductImg(productId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.delete<SuccessResponse<any>>(`${URL}/products/delete/image/${productId}`)
  },
  deleteProductImgs(productId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.delete<SuccessResponse<any>>(`${URL}/products/delete/images/${productId}`)
  },
  getProductDetail(id: string) {
    return http.get<SuccessResponse<Product>>(`${URL}/products/${id}`)
  },
  getAllImageProduct(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.get<SuccessResponse<ProductImg>>(`${URL}/products/images/${id}`)
  },
  updateProduct({ id, body }: updateProductFuncParam) {
    return http.put<SuccessResponse<Product>>(`${URL}/products/${id}`, body)
  },
  getPurchases(params?: PurchaseListConfig) {
    return http.get<SuccessResponse<PurchasesList>>(`${URL}/purchases/`, {
      params
    })
  },
  updatePurchaseStatus({ id, body }: updatePurchaseStatusFuncParam) {
    return http.put<SuccessResponse<Purchase>>(`${URL}/purchases/status/${id}`, body)
  },
  getPurchase(purchaseId: string) {
    return http.get<SuccessResponse<PurchaseWithUserDetail>>(`${URL}/purchases/${purchaseId}`)
  },
  deletePurchase(purchaseId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return http.delete<SuccessResponse<any>>(`${URL}/purchases/delete/${purchaseId}`)
  }
}

export default adminApi
