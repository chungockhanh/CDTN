import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { createSearchParams, Link } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import path from 'src/constants/path'
import { payStatus, purchasesStatus } from 'src/constants/purchase'
import useQueryParams from 'src/hooks/useQueryParams'
import { PurchaseListConfig } from 'src/types/purchase.type'
import { formatCurrency } from 'src/utils/utils'
import { locales } from 'src/i18n/i18n'
import { useTranslation } from 'react-i18next'
import { usePurchaseQueryConfig } from 'src/hooks/useQueryConfig'
import Pagination from 'src/components/Pagination'

const purchaseTabsVI = [
  { status: purchasesStatus.all, name: 'Tất cả' },
  { status: purchasesStatus.waitForConfirmation, name: 'Chờ xác nhận' },
  { status: purchasesStatus.waitForGetting, name: 'Chờ lấy hàng' },
  { status: purchasesStatus.inProgress, name: 'Đang giao' },
  { status: purchasesStatus.delivered, name: 'Đã giao' },
  { status: purchasesStatus.cancelled, name: 'Đã hủy' }
]

const purchaseTabsEN = [
  { status: purchasesStatus.all, name: 'All' },
  { status: purchasesStatus.waitForConfirmation, name: 'Wait for confirmation' },
  { status: purchasesStatus.waitForGetting, name: 'Waiting for the goods' },
  { status: purchasesStatus.inProgress, name: 'Delivering' },
  { status: purchasesStatus.delivered, name: 'Delivered' },
  { status: purchasesStatus.cancelled, name: 'Đã hủy' }
]

export default function HistoryPurchase() {
  const { i18n, t } = useTranslation('user')
  const currentLanguage = locales[i18n.language as keyof typeof locales]
  const queryParams: { status?: string } = useQueryParams()
  const status: number = Number(queryParams.status) || purchasesStatus.all

  const convertTimeISO8601ToDate = (timeISO: string) => {
    const date = new Date(timeISO)
    const lng = currentLanguage === 'English' ? 'en-EN' : 'vi-VN'
    const formatter = new Intl.DateTimeFormat(lng, {
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

  // const { data: purchasesInCartData } = useQuery({
  //   queryKey: ['purchases', { status }],
  //   queryFn: () => purchaseApi.getPurchases({ status: status as PurchaseListStatus })
  // })
  const queryConfig = usePurchaseQueryConfig()
  const { data: purchasesData } = useQuery({
    queryKey: ['purchases', queryConfig],
    queryFn: () => purchaseApi.getAllPurchase(queryConfig as PurchaseListConfig),
    keepPreviousData: true
  })

  const purchasesInCart = purchasesData?.data.data.purchases

  const purchaseTabs = currentLanguage === 'English' ? purchaseTabsEN : purchaseTabsVI

  const purchaseTabsLink = purchaseTabs.map((tab) => (
    <Link
      key={tab.status}
      to={{
        pathname: path.historyPurchase,
        search: createSearchParams({
          status: String(tab.status)
        }).toString()
      }}
      className={classNames('flex flex-1 items-center justify-center border-b-2 bg-white py-4 text-center', {
        'border-b-orange text-orange': status === tab.status,
        'border-b-black/10 text-gray-900': status !== tab.status
      })}
    >
      {tab.name}
    </Link>
  ))

  return (
    <div>
      <div className='overflow-x-auto'>
        <div className='min-w-[700px]'>
          <div className='sticky top-0 flex rounded-t-sm shadow-sm'>{purchaseTabsLink}</div>
          <div>
            {purchasesInCart?.map((purchase) => (
              <div key={purchase._id} className='mt-4 rounded-sm border-black/10 bg-white p-6 text-gray-800 shadow-sm'>
                <Link to={`${path.home}${purchase.product._id}`} className='flex'>
                  <div className='flex-shrink-0'>
                    <img className='h-20 w-20 object-cover' src={purchase.product.image} alt={purchase.product.name} />
                  </div>
                  <div className='ml-3 flex-grow overflow-hidden'>
                    <div className='truncate'>{purchase.product.name}</div>
                    <div className='mt-3'>x{purchase.buy_count}</div>
                  </div>
                  <div className='ml-3 flex-shrink-0'>
                    {purchase.product.price_before_discount > 0 && (
                      <span className='truncate text-gray-500 line-through'>
                        ₫{formatCurrency(purchase.product.price_before_discount)}
                      </span>
                    )}
                    <span className='ml-2 truncate text-orange'>₫{formatCurrency(purchase.product.price)}</span>
                  </div>
                </Link>
                <div className='mt-3 flex justify-start'>
                  <div>
                    <span>{t('historyPurchase.purchaseDate')}:</span>
                    <span className='ml-2'>{convertTimeISO8601ToDate(purchase.updatedAt)}</span>
                  </div>
                </div>
                <div className='mt-2 flex justify-start'>
                  <div>
                    <span>{t('historyPurchase.pay')}:</span>
                    <span className='ml-2 uppercase'>
                      {purchase.paymentStatus === payStatus.PAID
                        ? t('historyPurchase.paid')
                        : t('historyPurchase.unpaid')}
                    </span>
                  </div>
                </div>
                <div className='flex justify-end'>
                  <div>
                    <span className='text-[17px]'>{t('historyPurchase.totalPrice')}:</span>
                    <span className='ml-4 text-xl text-orange'>
                      ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {purchasesData?.data.data.pagination.page_size && purchasesData.data.data.pagination.page_size > 1 && (
        <Pagination
          path={path.historyPurchase}
          queryConfig={queryConfig}
          pageSize={purchasesData.data.data.pagination.page_size as number}
        />
      )}
    </div>
  )
}
