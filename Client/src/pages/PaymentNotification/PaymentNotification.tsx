import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import path from 'src/constants/path'
import { useTranslation } from 'react-i18next'

export default function PaymentNotification() {
  const { t } = useTranslation('paymentNoti')
  const updatePurchaseByOrderId = useMutation(purchaseApi.updatePurchaseByOrderId)
  const removeFieldFromPurchaseByOrderId = useMutation(purchaseApi.removeFieldByOrderId)
  const [message, setMessage] = useState<string>('')

  const searchParams = new URLSearchParams(window.location.search)
  const checkStatusVnPay = searchParams.get('vnp_ResponseCode') === '00'
  const orderId = searchParams.get('vnp_TxnRef')

  useEffect(() => {
    if (checkStatusVnPay === true) {
      setMessage(t('paymentSuccess'))
      updatePurchaseByOrderId.mutate({ orderId: orderId as string })
    } else {
      removeFieldFromPurchaseByOrderId.mutate({ orderId: orderId as string })
      setMessage(t('paymentFail'))
      console.log(message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center'>
      <h1 className='mt-[-15%] text-center text-6xl font-extrabold tracking-widest text-gray-900'>{message}</h1>
      <div className='mt-5 flex'>
        <button className='mt-5'>
          <Link
            to={path.cart}
            className='active:text-orange-500 group relative inline-block text-sm font-medium text-white focus:outline-none focus:ring'
          >
            <span className='absolute inset-0 translate-x-0.5 translate-y-0.5 bg-orange transition-transform group-hover:translate-x-0 group-hover:translate-y-0' />
            <span className='relative block border border-current px-8 py-3'>
              <span>{t('goToCart')}</span>
            </span>
          </Link>
        </button>
        <span className='mx-10'></span>
        {message !== t('paymentSuccess') ? (
          <button className='mt-5'>
            <Link
              to='/'
              className='active:text-orange-500 group relative inline-block text-sm font-medium text-white focus:outline-none focus:ring'
            >
              <span className='absolute inset-0 translate-x-0.5 translate-y-0.5 bg-orange transition-transform group-hover:translate-x-0 group-hover:translate-y-0' />
              <span className='relative block border border-current px-8 py-3'>
                <span>{t('goToHomePage')}</span>
              </span>
            </Link>
          </button>
        ) : (
          <button className='mt-5'>
            <Link
              to={path.historyPurchase}
              className='active:text-orange-500 group relative inline-block text-sm font-medium text-white focus:outline-none focus:ring'
            >
              <span className='absolute inset-0 translate-x-0.5 translate-y-0.5 bg-orange transition-transform group-hover:translate-x-0 group-hover:translate-y-0' />
              <span className='relative block border border-current px-8 py-3'>
                <span>{t('goToPurchaseManager')}</span>
              </span>
            </Link>
          </button>
        )}
      </div>
    </div>
  )
}
