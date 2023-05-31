import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import adminApi from 'src/apis/admin.api'
import categoryApi from 'src/apis/category.api'
import productApi from 'src/apis/product.api'
import Pagination from 'src/components/Pagination'
import path from 'src/constants/path'
import { useProductQueryConfig } from 'src/hooks/useQueryConfig'
import useSearchProducts from 'src/hooks/useSearchProducts'
import { ProductListConfig } from 'src/types/product.type'
import FindByCategory from './FindByCateGory'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Confirm from 'src/components/Confirm'
import { formatCurrency, formatNumberToSocialStyle } from 'src/utils/utils'

export default function ProductListAdmin() {
  const { onSubmitSearch, register } = useSearchProducts(path.productManganer)
  const queryConfig = useProductQueryConfig()
  const navigate = useNavigate()
  const { data: productsData, refetch } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    }
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['category'],
    queryFn: () => {
      return categoryApi.getCategories()
    }
  })

  const deleteProductMutation = useMutation(adminApi.deleteProduct)

  const [idProductDelete, setIdProductDelete] = useState<null | string>(null)
  const visibleConfirm = idProductDelete !== null
  const showConfirm = (ProductId: string) => {
    setIdProductDelete(ProductId)
  }
  const hideConfirm = () => {
    setIdProductDelete(null)
  }

  const handleDelete = () => {
    if (idProductDelete) {
      deleteProductMutation.mutate(idProductDelete, {
        onSuccess: (data) => {
          refetch()
          toast.success(data.data.message, {
            autoClose: 1000
          })
        }
      })
      setIdProductDelete(null)
    }
  }

  const handleDB = (id: string) => {
    navigate(`${path.productManganer}/${id}`)
  }

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Quản lý sản phẩm</h1>
      </div>
      <div className='mt-3 flex items-center justify-between '>
        <form className=' md:w-[50%]' onSubmit={onSubmitSearch} noValidate>
          <div className='flex rounded-sm border-2 border-orange'>
            <input
              type='text'
              className='w-full flex-grow border-none bg-transparent px-3 py-1 text-black outline-none'
              placeholder='Nhập tên sản phẩm muốn tìm'
              {...register('name')}
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
          to={`${path.productManganer}/add`}
          type='button'
          className='mb-2 mr-2 rounded-lg bg-orange px-5 py-2.5 text-sm font-medium text-white hover:bg-orange/80 '
        >
          Thêm sản phẩm
        </Link>
      </div>
      <div className='mt-3 flex items-center justify-start'>
        <div className='mr-2  text-black'>Theo danh sách sản phẩm :</div>
        <FindByCategory queryConfig={queryConfig} categories={categoriesData?.data.data || []} />
      </div>
      <div className='mt-5 h-[600px] overflow-auto'>
        <div className='min-w-[1250px]'>
          <div className='sticky top-0 z-10 grid grid-cols-12 gap-2 rounded-sm border border-gray-300 bg-white px-9 py-5 text-left text-base capitalize text-black shadow'>
            <div className='col-span-1 text-center'>Ảnh</div>
            <div className='col-span-3 pl-3'>Tên</div>
            <div className='col-span-1 text-center'>Lượt xem</div>
            <div className='col-span-2 text-center'>Danh mục sản phẩm</div>
            <div className='col-span-1 text-center'>Số lượng</div>
            <div className='col-span-1 text-center'>Giá gốc</div>
            <div className='col-span-1 text-center'>Giá</div>
            <div className='col-span-1 text-center'>Bán</div>
            <div className='col-span-1'>Thao tác</div>
          </div>
          <div className='my-3 rounded-sm border border-gray-300 p-5 shadow'>
            {productsData?.data.data.products.map((product) => (
              <div
                className='grid cursor-pointer grid-cols-12 items-center gap-2 rounded-sm border border-gray-300 px-5 py-4 text-left text-sm text-black hover:border-2 hover:border-orange'
                key={product._id}
                onDoubleClick={() => handleDB(product._id)}
              >
                <div className='col-span-1'>
                  <div className='flex-shrink-0'>
                    <img className='h-20 w-20 object-cover' src={product.image} alt={product.name} />
                  </div>
                </div>
                <div className='col-span-3 flex-grow overflow-hidden pl-3'>{product.name}</div>
                <div className='col-span-1 text-center'>{formatNumberToSocialStyle(product.view)}</div>
                <div className='col-span-2 text-center'>{product.category.name}</div>
                <div className='col-span-1 text-center'>{product.quantity}</div>
                <div className='col-span-1 text-center'>{formatCurrency(product.price_before_discount)}đ</div>
                <div className='col-span-1 text-center'>{formatCurrency(product.price)}đ</div>
                <div className='col-span-1 text-center'>{product.sold}</div>
                <div className='col-span-1'>
                  <button
                    className='bg-none text-black transition-colors hover:text-orange'
                    onClick={() => showConfirm(product._id)}
                  >
                    Xóa
                  </button>
                  <span className='mx-1'>|</span>

                  <Link
                    to={`${path.productManganer}/${product._id}`}
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
      {productsData?.data.data.pagination.page_size && (
        <Pagination
          path={path.productManganer}
          queryConfig={queryConfig}
          pageSize={productsData.data.data.pagination.page_size}
        />
      )}
      <Confirm visible={visibleConfirm} Delete={handleDelete} Cancel={hideConfirm} />
    </div>
  )
}
