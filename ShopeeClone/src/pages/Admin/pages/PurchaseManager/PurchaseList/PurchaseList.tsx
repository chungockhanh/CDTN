import { useMutation, useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import adminApi from 'src/apis/admin.api'
import Pagination from 'src/components/Pagination'
import path from 'src/constants/path'
import { purchasesStatus } from 'src/constants/purchase'
import { usePurchaseQueryConfig } from 'src/hooks/useQueryConfig'
import useSearchPurchases from 'src/hooks/useSearchPurchases'
import { PurchaseListConfig } from 'src/types/purchase.type'
import { formatCurrency } from 'src/utils/utils'
import FilterByPurchaseStatus from './FilterByPurchaseStatus'
import { Link, useNavigate } from 'react-router-dom'
import Confirm from 'src/components/Confirm'
import { useState } from 'react'

export default function PurchaseList() {
  const queryConfig = usePurchaseQueryConfig()
  const { onSubmitSearch, register } = useSearchPurchases()
  const { data: purchasesData, refetch } = useQuery({
    queryKey: ['purchases', queryConfig],
    queryFn: () => {
      return adminApi.getPurchases(queryConfig as PurchaseListConfig)
    },
    keepPreviousData: true
  })

  const updatePurchaseStatusMutation = useMutation(adminApi.updatePurchaseStatus)

  const deletePurchasesMutation = useMutation(adminApi.deletePurchase)

  const navigate = useNavigate()

  const handleChangeStatus = (purchasesId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      const status = Number(event.target.value)
      updatePurchaseStatusMutation.mutate(
        { id: purchasesId, body: { status: status } },
        {
          onSuccess: () => {
            toast.success('Cập nhật trạng thái đơn hàng thành công', { autoClose: 1500 })
            refetch()
          }
        }
      )
    }
  }

  const handleDB = (id: string) => {
    navigate(`${path.purchaseManganer}/${id}`)
  }

  const [idPurchasesDelete, setIdPurchasesDelete] = useState<null | string>(null)
  const visibleConfirm = idPurchasesDelete !== null
  const showConfirm = (purchasesId: string) => {
    setIdPurchasesDelete(purchasesId)
  }
  const hideConfirm = () => {
    setIdPurchasesDelete(null)
  }

  const handleDelete = () => {
    if (idPurchasesDelete) {
      deletePurchasesMutation.mutate(idPurchasesDelete, {
        onSuccess: (data) => {
          refetch()
          toast.success(data.data.message, {
            autoClose: 1000
          })
        }
      })
      setIdPurchasesDelete(null)
    }
  }

  const handleStatusText = (status: number) => {
    if (status === purchasesStatus.waitForConfirmation) return 'Chờ xác nhận'
    if (status === purchasesStatus.waitForGetting) return 'Chờ lấy hàng'
    if (status === purchasesStatus.inProgress) return 'Đang giao'
    if (status === purchasesStatus.delivered) return 'Đã giao'
    if (status === purchasesStatus.cancelled) return 'Đã hủy'
  }

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Quản lý đơn hàng</h1>
      </div>
      <div className='mt-3 flex flex-col items-start'>
        <form className=' md:w-[50%]' noValidate onSubmit={onSubmitSearch}>
          <div className='flex rounded-sm border-2 border-orange'>
            <input
              type='text'
              className='w-full flex-grow border-none bg-transparent px-3 py-1 text-black outline-none'
              placeholder='Nhập email khách hàng hoặc tên sản phẩm muốn tìm'
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

        <div className='mt-4 flex items-center'>
          <div className='mr-2  text-black'>Theo trạng thái hóa đơn :</div>
          <FilterByPurchaseStatus queryConfig={queryConfig} />
        </div>
      </div>
      <div className='mt-5 overflow-auto'>
        <div className='min-w-[1500px]'>
          <div className='grid grid-cols-12 rounded-sm border border-gray-300 px-9 py-5 text-left text-base capitalize text-black shadow'>
            <div className='col-span-2'>Tên khách hàng</div>
            <div className='col-span-1'>Trạng thái</div>
            <div className='col-span-2 pl-10'>Email khách hàng</div>
            <div className='col-span-2'>Tên sản phẩm</div>
            <div className='col-span-1 pl-3'>Ảnh</div>
            <div className='col-span-1 text-center'>Số lượng</div>
            <div className='col-span-1 text-center'>Thành tiền</div>
            <div className='col-span-2 pl-5'>Thao tác</div>
          </div>
          <div className='my-3 rounded-sm border border-gray-300 p-5 shadow'>
            {purchasesData?.data.data.purchases.map((purchase) => (
              <div
                className='grid cursor-pointer grid-cols-12 items-center rounded-sm border border-gray-300 px-5 py-4 text-left text-sm text-black hover:border-2 hover:border-orange'
                key={purchase._id}
                onDoubleClick={
                  purchase.user?.name
                    ? () => handleDB(purchase._id)
                    : () => {
                        console.log('Người dùng không tồn tại')
                      }
                }
              >
                <div className='col-span-2'>{purchase.user?.name || 'Người dùng đã bị xóa'} </div>
                {purchase.user?.name ? (
                  <div className='col-span-1 flex'>
                    {purchase.status !== purchasesStatus.delivered ? (
                      <select
                        className={classNames('text-[15px] font-bold capitalize')}
                        defaultValue={purchase.status}
                        onChange={(event) => handleChangeStatus(purchase._id, event)}
                      >
                        <option value={purchasesStatus.waitForConfirmation}>Chờ xác nhận</option>
                        <option value={purchasesStatus.waitForGetting}>Chờ lấy hàng</option>
                        <option value={purchasesStatus.inProgress}>Đang giao</option>
                        <option value={purchasesStatus.delivered}>Đã giao</option>
                        <option value={purchasesStatus.cancelled}>Đã hủy</option>
                      </select>
                    ) : (
                      <span className='pl-2 text-center text-[15px] font-bold capitalize text-green-600'> Đã giao</span>
                    )}
                  </div>
                ) : (
                  <span className='pl-2 text-center text-[15px] font-bold capitalize text-red-600'>
                    {handleStatusText(purchase.status)}
                  </span>
                )}

                <div className='col-span-2 pl-[39px]'>{purchase.user?.email || 'Email không tồn tại'}</div>

                <div className='col-span-2 flex-grow overflow-hidden pl-3'>{purchase.product.name}</div>
                <div className='col-span-1 pl-3'>
                  <div className='flex-shrink-0'>
                    <img className='h-20 w-20 object-cover' src={purchase.product.image} alt={purchase.product.name} />
                  </div>
                </div>
                <div className='col-span-1 text-center'>{purchase.buy_count}</div>
                <div className='col-span-1 text-center'>
                  {formatCurrency(purchase.product.price * purchase.buy_count)}đ
                </div>
                <div className='col-span-2 flex items-center pl-5'>
                  <button
                    className='bg-none text-black transition-colors hover:text-orange'
                    onClick={() => showConfirm(purchase._id)}
                  >
                    Xóa
                  </button>
                  <span className='m-1'>|</span>

                  <Link
                    to={`${path.purchaseManganer}/${purchase._id}`}
                    className='bg-none text-black transition-colors hover:text-orange'
                  >
                    Sửa đổi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {purchasesData?.data.data.pagination.page_size && (
        <Pagination
          path={path.purchaseManganer}
          queryConfig={queryConfig}
          pageSize={purchasesData.data.data.pagination.page_size as number}
        />
      )}
      <Confirm visible={visibleConfirm} Delete={handleDelete} Cancel={hideConfirm} />
    </div>
  )
}
