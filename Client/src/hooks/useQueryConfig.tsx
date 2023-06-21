import { ProductListConfig } from 'src/types/product.type'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'
import useQueryParams from './useQueryParams'
import { UserListConfig } from 'src/types/user.type'
import { CategoryListConfig } from 'src/types/category.type'
import { PurchaseListConfig } from 'src/types/purchase.type'

export type ProductQueryConfig = {
  [key in keyof ProductListConfig]: string
}

export type UserQueryConfig = {
  [key in keyof UserListConfig]: string
}

export type CategoryQueryConfig = {
  [key in keyof CategoryListConfig]: string
}

export type PurchaseQueryConfig = {
  [key in keyof PurchaseListConfig]: string
}

export function useProductQueryConfig() {
  const queryParams: ProductQueryConfig = useQueryParams()
  const queryConfig: ProductQueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '20',
      sort_by: queryParams.sort_by,
      exclude: queryParams.exclude,
      name: queryParams.name,
      order: queryParams.order,
      price_max: queryParams.price_max,
      price_min: queryParams.price_min,
      rating_filter: queryParams.rating_filter,
      category: queryParams.category
    },
    isUndefined
  )
  return queryConfig
}

export function useUserQueryConfig() {
  const queryParams: UserQueryConfig = useQueryParams()
  const queryConfig: UserQueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit,
      search: queryParams.search
    },
    isUndefined
  )
  return queryConfig
}

export function useCategoryQueryConfig() {
  const queryParams: CategoryQueryConfig = useQueryParams()
  const queryConfig: CategoryQueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit,
      search: queryParams.search
    },
    isUndefined
  )
  return queryConfig
}

export function usePurchaseQueryConfig() {
  const queryParams: PurchaseQueryConfig = useQueryParams()
  const queryConfig: PurchaseQueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '5',
      search: queryParams.search,
      status: queryParams.status
    },
    isUndefined
  )
  return queryConfig
}
