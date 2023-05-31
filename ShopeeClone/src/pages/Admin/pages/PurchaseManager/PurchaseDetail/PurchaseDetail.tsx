import { useMutation, useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import adminApi from 'src/apis/admin.api'
import { purchasesStatus } from 'src/constants/purchase'
import { formatCurrency } from 'src/utils/utils'

export default function PurchaseDetail() {
  const { id } = useParams()

  const { data: purchaseData, refetch } = useQuery({
    queryKey: ['purchaseDetail', id],
    queryFn: () => adminApi.getPurchase(id as string)
  })

  const updatePurchaseStatusMutation = useMutation(adminApi.updatePurchaseStatus)

  const purchaseDetail = purchaseData?.data.data

  const handleChangeStatus = (purchasesId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      const status = Number(event.target.value)
      updatePurchaseStatusMutation.mutate(
        { id: purchasesId, body: { status: status } },
        {
          onSuccess: () => {
            toast.success('Cập nhật trạng tháu đơn hàng thành công', { autoClose: 1500 })
            refetch()
          }
        }
      )
    }
  }

  const convertTimeISO8601ToDate = (timeISO: string) => {
    const date = new Date(timeISO)
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    const formattedTime = formatter.format(date)
    return formattedTime
  }

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Thông tin chi tiết đơn hàng</h1>
      </div>
      {purchaseDetail && (
        <div className='mt-8 flex md:flex-row md:items-start'>
          <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
            <div className='flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>ID hóa đơn</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='pt-3 text-lg text-gray-900'>{purchaseDetail._id}</div>
              </div>
            </div>

            <div className='flex flex-col flex-wrap sm:flex-row'>
              <div className='pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Ngày lập đơn hàng</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='flex pt-3 text-lg capitalize text-gray-900'>
                  {convertTimeISO8601ToDate(purchaseDetail.createdAt)}
                </div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Trạng thái</div>
              <div className='sm:w-[80%] sm:pl-5'>
                {purchaseDetail.status !== purchasesStatus.delivered ? (
                  <div className='mt-4'>
                    <select
                      className={classNames('text-lg font-bold capitalize')}
                      defaultValue={purchaseDetail?.status}
                      onChange={(event) => handleChangeStatus(purchaseDetail._id, event)}
                    >
                      <option value={purchasesStatus.waitForConfirmation}>Chờ xác nhận</option>
                      <option value={purchasesStatus.waitForGetting}>Chờ lấy hàng</option>
                      <option value={purchasesStatus.inProgress}>Đang giao</option>
                      <option value={purchasesStatus.delivered}>Đã giao</option>
                      <option value={purchasesStatus.cancelled}>Đã hủy</option>
                    </select>
                  </div>
                ) : (
                  <div className='pt-3 text-lg font-bold capitalize text-green-600'> Đã giao</div>
                )}
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Tên khách hàng</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='pt-3 text-lg text-gray-900'>{purchaseDetail.user.name}</div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Email</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='pt-3 text-lg text-gray-900'>{purchaseDetail.user.email}</div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Địa chỉ</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='pt-3 text-lg text-gray-900'>{purchaseDetail.user.address}</div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>SĐT</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='pt-3 text-lg text-gray-900'>{purchaseDetail.user.phone}</div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Tên sản phẩm</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='overflow-hidden truncate pt-3 text-lg text-gray-900'>{purchaseDetail.product.name}</div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Ảnh</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='relative mt-4 grid grid-cols-2 gap-2'>
                  <div className='relative w-full pt-[100%]'>
                    <img
                      src={purchaseDetail.product.image}
                      alt='product'
                      className='absolute left-0 top-0 h-full w-full border bg-white object-cover p-1'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Số lượng</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='overflow-hidden truncate pt-3 text-lg text-gray-900'>{purchaseDetail.buy_count}</div>
              </div>
            </div>

            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='truncate pt-3 text-lg capitalize sm:w-[20%] sm:text-right'>Thành tiền</div>
              <div className='sm:w-[80%] sm:pl-5'>
                <div className='overflow-hidden truncate pt-3 text-lg text-gray-900'>
                  {formatCurrency(purchaseDetail.product.price * purchaseDetail.buy_count)}đ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
