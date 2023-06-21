import { useMutation, useQuery } from '@tanstack/react-query'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import Button from 'src/components/Button'
import QuantityController from 'src/components/QuantityController'
import path from 'src/constants/path'
import { payMethod as payBy, purchasesStatus } from 'src/constants/purchase'
import { Purchase } from 'src/types/purchase.type'
import { formatCurrency } from 'src/utils/utils'
import { produce } from 'immer'
import { keyBy } from 'lodash'
import { toast } from 'react-toastify'
import { AppContext } from 'src/contexts/app.context'
import noproduct from 'src/assets/images/no-product.png'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default function Cart() {
  const { t } = useTranslation('cart')
  const { profile } = useContext(AppContext)
  const [payMethod, setPayMethod] = useState<number>(payBy.byCash)
  const navigate = useNavigate()
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const { data: purchaseInCartData, refetch } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: () => purchaseApi.getPurchases({ status: purchasesStatus.inCart })
  })

  const payByVnPay = useMutation(purchaseApi.payByVnPay)

  const updatePurchaseMutation = useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onSuccess: () => {
      refetch()
    }
  })

  const buyProductsMutation = useMutation({
    mutationFn: purchaseApi.buyProducts
  })

  const addOrderIdToPurchaseVnPay = useMutation(purchaseApi.addOrderIdToPurchasePayByVnPay)

  const deletePurchasesMutation = useMutation({
    mutationFn: purchaseApi.deletePurchase,
    onSuccess: () => {
      refetch()
      toast.success(t('delete success'), {
        autoClose: 1500
      })
    }
  })
  const location = useLocation()

  const choosenPurchaseIdFromLocation = (location.state as { purchaseId: string } | null)?.purchaseId
  const purchasesInCart = purchaseInCartData?.data.data
  const isAllChecked = useMemo(() => extendedPurchases.every((purchase) => purchase.checked), [extendedPurchases])
  const checkedPurchases = useMemo(() => extendedPurchases.filter((purchase) => purchase.checked), [extendedPurchases])
  const checkedPurchasesCount = checkedPurchases.length
  const totalCheckedPurchasePrice = useMemo(
    () =>
      checkedPurchases.reduce((result, current) => {
        return result + current.product.price * current.buy_count
      }, 0),
    [checkedPurchases]
  )

  const totalCheckedPurchaseSavingPrice = useMemo(
    () =>
      checkedPurchases.reduce((result, current) => {
        if (current.product.price_before_discount > 0) {
          return result + (current.product.price_before_discount - current.product.price) * current.buy_count
        }
        return result + 0
      }, 0),
    [checkedPurchases]
  )

  useEffect(() => {
    setExtendedPurchases((prev) => {
      const extendedPurchasesObject = keyBy(prev, '_id')
      return (
        purchasesInCart?.map((purchase) => {
          const isChoosenPurchaseFromLocation = choosenPurchaseIdFromLocation === purchase._id
          // console.log(purchase._id)
          // console.log(choosenPurchaseIdFromLocation)
          return {
            ...purchase,
            disabled: false,
            checked: isChoosenPurchaseFromLocation || Boolean(extendedPurchasesObject[purchase._id]?.checked)
          }
        }) || []
      )
    })
  }, [purchasesInCart, choosenPurchaseIdFromLocation, setExtendedPurchases])

  useEffect(() => {
    return () => {
      history.replaceState(null, '')
    }
  }, [])

  const handleCheck = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].checked = event.target.checked
      })
    )
  }

  const handleCheckAll = () => {
    setExtendedPurchases((prev) =>
      prev.map((purchase) => ({
        ...purchase,
        checked: !isAllChecked
      }))
    )
  }

  const handleQuantity = (purchaseIndex: number, value: number, enable: boolean) => {
    if (enable) {
      const purchase = extendedPurchases[purchaseIndex]
      setExtendedPurchases(
        produce((draft) => {
          draft[purchaseIndex].disabled = true
        })
      )
      updatePurchaseMutation.mutate({ product_id: purchase.product._id, buy_count: value })
    }
  }

  const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].buy_count = value
      })
    )
  }

  const handleDelete = (purchaseIndex: number) => () => {
    const purchaseId = extendedPurchases[purchaseIndex]._id
    deletePurchasesMutation.mutate([purchaseId])
  }

  const handleDeleteManyPurchases = () => {
    const purchasesId = checkedPurchases.map((purchase) => purchase._id)
    deletePurchasesMutation.mutate(purchasesId)
  }

  const handleBuyProducts = () => {
    if (profile) {
      if (profile.address && profile.phone) {
        const date = new Date()
        const orderId = moment(date).format('DDHHmmss') + profile._id
        if (checkedPurchases.length > 0) {
          if (payMethod === payBy.byVnPay) {
            const bodyVnPay = {
              amount: totalCheckedPurchasePrice,
              orderId: orderId
            }

            payByVnPay.mutate(bodyVnPay, {
              onSuccess: (data) => {
                const body = checkedPurchases.map((purchase) => ({
                  product_id: purchase.product._id,
                  buy_count: purchase.buy_count,
                  orderId: orderId
                }))
                addOrderIdToPurchaseVnPay.mutate(body)
                const linkPay = data.data.data.vnPayURL
                window.location.href = linkPay
              }
            })
          } else if (payMethod === payBy.byCash) {
            const body = checkedPurchases.map((purchase) => ({
              product_id: purchase.product._id,
              buy_count: purchase.buy_count,
              orderId: orderId,
              payMethod: payBy.byCash,
              status: purchasesStatus.waitForConfirmation
            }))
            buyProductsMutation.mutate(body, {
              onSuccess: () => {
                toast.success(t('orderSuccess'))
                refetch()
              },
              onError: () => {
                toast.error(t('orderFail'))
              }
            })
          }
        }
      } else {
        toast.error(t('buy error'))
        navigate(`${path.profile}`)
      }
    }
  }

  return (
    <div className='bg-neutral-100 py-16'>
      <div className='container'>
        {extendedPurchases.length > 0 ? (
          <Fragment>
            <div className='overflow-auto'>
              <div className='min-w-[1000px]'>
                <div className='grid grid-cols-12 rounded-sm bg-white px-9 py-5 text-sm capitalize text-gray-500 shadow'>
                  <div className='col-span-6 bg-white'>
                    <div className='flex items-center'>
                      <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                        <input
                          type='checkbox'
                          className='h-5 w-5 accent-orange'
                          checked={isAllChecked}
                          onChange={handleCheckAll}
                        />
                      </div>
                      <div className='flex-grow text-black'>{t('product')}</div>
                    </div>
                  </div>
                  <div className='col-span-6'>
                    <div className='grid grid-cols-5 text-center'>
                      <div className='col-span-2'>{t('unit price')}</div>
                      <div className='col-span-1'>{t('quantity')}</div>
                      <div className='col-span-1'>{t('price')}</div>
                      <div className='col-span-1'>{t('action')}</div>
                    </div>
                  </div>
                </div>
                {extendedPurchases.length > 0 && (
                  <div className='my-3 rounded-sm bg-white p-5 shadow'>
                    {extendedPurchases.map((purchase, index) => (
                      <div
                        key={purchase._id}
                        className='mt-5 grid grid-cols-12 items-center rounded-sm border border-gray-200 bg-white px-5 py-4 text-center text-sm text-gray-500 first:mt-0'
                      >
                        <div className='col-span-6'>
                          <div className='flex'>
                            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                              <input
                                type='checkbox'
                                className='h-5 w-5 accent-orange'
                                checked={purchase.checked}
                                onChange={handleCheck(index)}
                              />
                            </div>
                            <div className='flex-grow'>
                              <div className='flex'>
                                <Link className='h-20 w-20 flex-shrink-0' to={`${path.home}${purchase.product._id}`}>
                                  <img src={purchase.product.image} alt={purchase.product.name} />
                                </Link>
                                <div className='flew-grow px-2 pb-2 pt-1'>
                                  <Link className='line-clamp-2 text-left' to={`${path.home}${purchase.product._id}`}>
                                    {purchase.product.name}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='col-span-6'>
                          <div className='grid grid-cols-5 items-center'>
                            <div className='col-span-2'>
                              <div className='flex items-center justify-center'>
                                {purchase.product.price_before_discount > 0 && (
                                  <span className='text-gray-300 line-through'>
                                    ₫{formatCurrency(purchase.product.price_before_discount)}
                                  </span>
                                )}
                                <span className='ml-3'>₫{formatCurrency(purchase.product.price)}</span>
                              </div>
                            </div>
                            <div className='col-span-1'>
                              <QuantityController
                                max={purchase.product.quantity}
                                value={purchase.buy_count}
                                onIncrease={(value) => handleQuantity(index, value, value <= purchase.product.quantity)}
                                onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                                classNameWrapper='flex items-center'
                                onType={handleTypeQuantity(index)}
                                onFocusOut={(value) =>
                                  handleQuantity(
                                    index,
                                    value,
                                    value >= 1 &&
                                      value <= purchase.product.quantity &&
                                      value !== (purchasesInCart as Purchase[])[index].buy_count
                                  )
                                }
                                disabled={purchase.disabled}
                              />
                            </div>
                            <div className='col-span-1'>
                              <span className='text-orange'>
                                ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
                              </span>
                            </div>
                            <div className='col-span-1'>
                              <button
                                onClick={handleDelete(index)}
                                className='bg-none text-black transition-colors hover:text-orange'
                              >
                                {t('delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className='sticky bottom-0 z-10 mt-8 rounded-sm border border-gray-100 bg-white p-5 shadow'>
              <div className='flex flex-col sm:flex-row sm:items-center'>
                <div className='flex items-center'>
                  <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                    <input
                      type='checkbox'
                      className='h-5 w-5 accent-orange'
                      checked={isAllChecked}
                      onChange={handleCheckAll}
                    />
                    <button className='mx-3 border-none bg-none'>
                      {t('select all')} ({extendedPurchases.length})
                    </button>
                    <button onClick={handleDeleteManyPurchases} className='mx-3 border-none bg-none hover:text-orange'>
                      {t('delete')}
                    </button>
                  </div>
                </div>
                <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center'>
                  <div>
                    <div className='flex items-center sm:justify-end'>
                      <div>
                        {t('total payment')} ({checkedPurchasesCount} {t('product')}):
                      </div>
                      <div className='ml-2 text-2xl text-orange'>₫{formatCurrency(totalCheckedPurchasePrice)}</div>
                    </div>
                    <div className='flex items-center text-sm sm:justify-end'>
                      <div className='text-gray-500'>{t('save money')}:</div>
                      <div className='ml-6 text-orange'>₫{formatCurrency(totalCheckedPurchaseSavingPrice)}</div>
                    </div>
                  </div>
                  <Button
                    className='mt-5 flex h-10 w-52 items-center justify-center bg-red-500 text-sm uppercase text-white hover:bg-red-600 sm:ml-4 sm:mt-0'
                    onClick={handleBuyProducts}
                    disabled={buyProductsMutation.isLoading}
                  >
                    {t('purchase')}
                  </Button>
                </div>
              </div>
              <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
                <div className='pt-3 capitalize sm:w-[20%] sm:text-left'>Phương thức thanh toán:</div>
                <div className='flex flex-col pt-3 lg:ml-[-30px]'>
                  <div className='flex items-center'>
                    <input
                      defaultChecked
                      type='radio'
                      id='pay-by-cash'
                      name='default-radio'
                      className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600'
                      onClick={() => setPayMethod(payBy.byCash)}
                    />
                    <label htmlFor='pay-by-cash' className='ml-2 text-sm font-medium text-gray-900'>
                      {t('payByCash')}
                    </label>
                  </div>

                  <div className='mt-2 flex items-center'>
                    <input
                      type='radio'
                      id='pay-by-vnpay'
                      name='default-radio'
                      className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600'
                      onClick={() => setPayMethod(payBy.byVnPay)}
                    />
                    <label htmlFor='pay-by-vnpay' className='ml-2 text-sm font-medium text-gray-900'>
                      {t('payByVnPay')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2 text-sm font-bold text-gray-500'>{t('note')}</div>
          </Fragment>
        ) : (
          <div className='text-center'>
            <img src={noproduct} alt='no purchase' className='mx-auto h-24 w-24' />
            <div className='mt-5 font-bold text-gray-400'>{t('cart empty')}</div>
            <div className='mt-5 text-center'>
              <Link
                to={path.home}
                className=' rounded-sm bg-orange px-10 py-2  uppercase text-white transition-all hover:bg-orange/80'
              >
                {t('buy now')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
