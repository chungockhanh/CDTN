import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import adminApi from 'src/apis/admin.api'
import productApi from 'src/apis/product.api'
import path from 'src/constants/path'

export default function Dashboard() {
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return adminApi.getUsers()
    }
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      return adminApi.getCategories()
    }
  })

  const { data: productsData } = useQuery({
    queryKey: ['productsAdminDashboard'],
    queryFn: () => {
      return productApi.getProducts()
    }
  })

  const { data: purchasesData } = useQuery({
    queryKey: ['purchasesAdminDashboard'],
    queryFn: () => {
      return adminApi.getPurchases()
    }
  })

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Trang chủ</h1>
      </div>
      <div className='m-3 flex flex-wrap'>
        <div className='w-full p-3 md:w-1/2 xl:w-1/4'>
          <div className='bg-primary rounded-lg bg-orange text-white shadow-md'>
            <div className='overflow-hidden p-4 text-[16px]'>Tổng số người dùng: {usersData?.data.data.totalUsers}</div>
            <div className='flex items-center justify-between border-t border-white px-4 py-2'>
              <Link to={path.userManganer} className='text-sm font-medium text-white'>
                Thông tin chi tiết
              </Link>
              <svg
                className='h-4 w-4 text-white'
                viewBox='0 0 256 512'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M246.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 41.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z' />
              </svg>
            </div>
          </div>
        </div>
        <div className='w-full p-3 md:w-1/2 xl:w-1/4'>
          <div className='bg-primary rounded-lg bg-orange text-white shadow-md'>
            <div className='overflow-hidden p-4 text-[16px]'>
              Danh mục sản phẩm: {categoriesData?.data.data.totalCategories}
            </div>
            <div className='flex items-center justify-between border-t border-white px-4 py-2'>
              <Link to={path.categoryManganer} className='text-sm font-medium text-white'>
                Thông tin chi tiết
              </Link>
              <svg
                className='h-4 w-4 text-white'
                viewBox='0 0 256 512'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M246.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 41.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z' />
              </svg>
            </div>
          </div>
        </div>
        <div className='w-full p-3 md:w-1/2 xl:w-1/4'>
          <div className='bg-primary rounded-lg bg-orange text-white shadow-md'>
            <div className='overflow-hidden p-4 text-[16px]'>
              Tổng số sản phẩm: {productsData?.data.data.totalProducts}
            </div>
            <div className='flex items-center justify-between border-t border-white px-4 py-2'>
              <Link to={path.productManganer} className='text-sm font-medium text-white'>
                Thông tin chi tiết
              </Link>
              <svg
                className='h-4 w-4 text-white'
                viewBox='0 0 256 512'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M246.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 41.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z' />
              </svg>
            </div>
          </div>
        </div>
        <div className='w-full p-3 md:w-1/2 xl:w-1/4'>
          <div className='bg-primary rounded-lg bg-orange text-white shadow-md'>
            <div className='overflow-hidden p-4 text-[16px]'>
              Tổng số đơn hàng: {purchasesData?.data.data.totalPurchases}
            </div>
            <div className='flex items-center justify-between border-t border-white px-4 py-2'>
              <Link to={path.purchaseManganer} className='text-sm font-medium text-white'>
                Thông tin chi tiết
              </Link>
              <svg
                className='h-4 w-4 text-white'
                viewBox='0 0 256 512'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M246.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 41.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z' />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
