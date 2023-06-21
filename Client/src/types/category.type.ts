export interface Category {
  _id: string
  name: string
}

export interface CategoryList {
  categories: Category[]
  pagination: {
    page: number
    limit: number
    page_size: number
  }
  totalCategories: number
}

export interface CategoryListConfig {
  page?: number | string
  limit?: number | string
  search?: number | string
}
