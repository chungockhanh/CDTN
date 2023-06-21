import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import adminApi from 'src/apis/admin.api'
import Pagination from 'src/components/Pagination'
import path from 'src/constants/path'
import { Link } from 'react-router-dom'
import Confirm from 'src/components/Confirm'
import { toast } from 'react-toastify'
import useSearchCategories from 'src/hooks/useSearchCategories'
import { useCategoryQueryConfig } from 'src/hooks/useQueryConfig'
import { CategoryListConfig } from 'src/types/category.type'

export default function CategoryList() {
  const { onSubmitSearch, register } = useSearchCategories()
  const queryConfig = useCategoryQueryConfig()
  const { data: categoriesData, refetch } = useQuery({
    queryKey: ['categories', queryConfig],
    queryFn: () => {
      return adminApi.getCategories(queryConfig as CategoryListConfig)
    },
    keepPreviousData: true
  })

  const deleteCategoryMutation = useMutation(adminApi.deleteCategory)
  const [idCategoryDelete, setIdCategoryDelete] = useState<null | string>(null)
  const visibleConfirm = idCategoryDelete !== null
  const showConfirm = (categoryId: string) => {
    setIdCategoryDelete(categoryId)
  }
  const hideConfirm = () => {
    setIdCategoryDelete(null)
  }

  const handleDelete = () => {
    if (idCategoryDelete) {
      deleteCategoryMutation.mutate(idCategoryDelete, {
        onSuccess: (data) => {
          refetch()
          toast.success(data.data.message, {
            autoClose: 1000
          })
        }
      })
      setIdCategoryDelete(null)
    }
  }
  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Quản lý danh mục sản phẩm</h1>
      </div>
      <div className='mt-3 flex items-center justify-between '>
        <form className=' md:w-[50%]' onSubmit={onSubmitSearch} noValidate>
          <div className='flex rounded-sm border-2 border-orange'>
            <input
              type='text'
              className='w-full flex-grow border-none bg-transparent px-3 py-1 text-black outline-none'
              placeholder='Nhập tên danh mục sản phẩm muốn tìm'
              {...register('search')}
            />
            <button className='flex-shrink-0 rounded-sm bg-orange px-8 py-2 hover:opacity-90'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-5 w-5 stroke-white'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                />
              </svg>
            </button>
          </div>
        </form>
        <Link
          to={`${path.categoryManganer}/add`}
          type='button'
          className='mb-2 mr-2 rounded-lg bg-orange px-5 py-2.5 text-sm font-medium text-white hover:bg-orange/80 '
        >
          Thêm danh mục sản phẩm
        </Link>
      </div>
      <div className='mt-4 overflow-auto'>
        <div className='min-w-[900px]'>
          <div className='grid grid-cols-5 rounded-sm border border-gray-300 px-9 py-5 text-left text-base capitalize text-black shadow'>
            <div className='col-span-3'>Tên</div>
            <div className='col-span-2'>Thao tác</div>
          </div>
          <div className='my-3 rounded-sm border border-gray-300 p-5 shadow'>
            {categoriesData?.data.data.categories.map((category) => (
              <div
                className='grid cursor-pointer grid-cols-5 items-center rounded-sm border border-gray-300 px-5 py-4 text-left text-sm text-black hover:border-2 hover:border-orange'
                key={category._id}
              >
                <div className='col-span-3 truncate'>{category.name}</div>
                <div className='col-span-2'>
                  <button
                    className='bg-none text-black transition-colors hover:text-orange'
                    onClick={() => showConfirm(category._id)}
                  >
                    Xóa
                  </button>
                  <span className='mx-1'>|</span>

                  <Link
                    to={`${path.categoryManganer}/${category._id}`}
                    className='m-0 bg-none text-black transition-colors hover:text-orange'
                  >
                    Sửa đổi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {categoriesData?.data.data.pagination.page_size && (
        <Pagination
          path={path.categoryManganer}
          queryConfig={queryConfig}
          pageSize={categoriesData.data.data.pagination.page_size}
        />
      )}
      <Confirm visible={visibleConfirm} Delete={handleDelete} Cancel={hideConfirm} />
    </div>
  )
}
