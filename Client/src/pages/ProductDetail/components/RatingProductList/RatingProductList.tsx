import { useMutation, useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { useContext, useEffect, useState } from 'react'
import ratingsProductApi from 'src/apis/ratingProduct.api'
import Button from 'src/components/Button'
import ProductRating from 'src/components/ProductRating'
import { RatingProductListConfig } from 'src/types/ratingProduct.type'
import { getAvatarURL } from 'src/utils/utils'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import classNames from 'classnames'
import { AppContext } from 'src/contexts/app.context'
import { conditionForRating } from 'src/constants/rating'
import Confirm from 'src/components/Confirm'
import { useTranslation } from 'react-i18next'
import { locales } from 'src/i18n/i18n'

interface Props {
  productId: string
}

const RANGE = 2

export default function RatingProductList({ productId }: Props) {
  const { t, i18n } = useTranslation('ratingProduct')
  const { profile } = useContext(AppContext)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(1)
  const [showFormRating, setShowFormRating] = useState(false)
  const [page, setPage] = useState(1)
  const [conditionRating, setConditionRating] = useState<number | null>(null)
  const [ratingId, setRatingId] = useState('')
  const [visible, setVisible] = useState(false)

  const queryRatingsProductConfig: RatingProductListConfig = {
    page: page,
    limit: 5,
    product_id: productId
  }

  const { data: ratingsProductData, refetch: ratingRefech } = useQuery({
    queryKey: ['ratingsProduct', productId],
    queryFn: () => ratingsProductApi.getAllRatings(queryRatingsProductConfig)
  })

  const checkConditionForRating = useMutation(ratingsProductApi.checkConditionForRating)

  useEffect(() => {
    if (page >= 1) {
      ratingRefech()
    }
  }, [page, ratingRefech])

  useEffect(
    () => {
      checkConditionForRating.mutate(
        { product_id: productId },
        {
          onSuccess: (data) => {
            setConditionRating(data.data.data.conditionForRating)
            if (conditionRating === conditionForRating.UPDATE) {
              if (data.data.data.ratingProduct) {
                setComment(data.data.data.ratingProduct.comment)
                setRating(Number(data.data.data.ratingProduct.rating))
                setRatingId(data.data.data.ratingProduct._id)
              }
            }
          }
        }
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const currentLanguage = locales[i18n.language as keyof typeof locales] === 'English' ? 'en-EN' : 'vi-VN'

  const addRatingMutation = useMutation(ratingsProductApi.addRatingProduct)

  const updateRatingMutation = useMutation(ratingsProductApi.updateRatingProduct)

  const deleteRatingMutation = useMutation(ratingsProductApi.deleteRatingProduct)

  const pageSize = ratingsProductData?.data.data.pagination.page_size as number

  const convertTimeISO8601ToDate = (timeISO: string) => {
    const date = new Date(timeISO)
    const formatter = new Intl.DateTimeFormat(currentLanguage, {
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

  const handleCommentChange = (value: string) => {
    setComment(value)
  }

  const handleMouseEnter = (index: number) => {
    setRating(index)
  }

  // const handleMouseLeave = () => {
  //   setRating(0)
  // }

  // const handleClick = (index: number) => {
  //   setRating(index)
  // }

  const handleWith = (order: number) => {
    if (order <= rating) {
      return '100%'
    }
    if (order > rating && order - rating < 1) {
      return (rating - Math.floor(rating)) * 100 + '%'
    }
    return '0%'
  }

  const handleAddRating = () => {
    if (productId) {
      const body = {
        product_id: productId,
        comment: comment,
        rating: rating
      }
      addRatingMutation.mutate(body, {
        onSuccess: () => {
          window.location.reload()
        }
      })
    }
  }

  const handleUpdateRating = () => {
    if (productId && ratingId) {
      const body = {
        product_id: productId,
        comment: comment,
        rating: rating
      }
      updateRatingMutation.mutate(
        { id: ratingId, body: body },
        {
          onSuccess: () => {
            window.location.reload()
          }
        }
      )
    }
  }

  const handleDeleteRating = () => {
    if (productId && ratingId) {
      const body = {
        product_id: productId,
        rating: rating
      }
      deleteRatingMutation.mutate(
        { id: ratingId, body: body },
        {
          onSuccess: () => {
            setVisible(false)
            window.location.reload()
          }
        }
      )
    }
  }

  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = false
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span key={index} className='mx-2 flex  items-center rounded border bg-white px-3 py-2 shadow-sm'>
            ...
          </span>
        )
      }
      return null
    }

    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <span key={index} className='mx-2 flex  items-center rounded border bg-white px-3 py-2 shadow-sm'>
            ...
          </span>
        )
      }
      return null
    }

    return Array(pageSize)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        // console.log(pageNumber, page + RANGE)
        if (page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
          return renderDotAfter(index)
        } else if (page > RANGE * 2 + 1 && page < pageSize - RANGE * 2) {
          if (pageNumber < page - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index)
          } else if (pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
            return renderDotAfter(index)
          }
        } else if (page >= pageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < page - RANGE) {
          return renderDotBefore(index)
        }
        return (
          <Button
            key={index}
            className={classNames('mx-2 flex cursor-pointer items-center rounded border bg-white px-3 py-2 shadow-sm', {
              'border-cyan-500': pageNumber === page,
              'border-transparent': pageNumber !== page
            })}
            onClick={() => {
              setPage(pageNumber)
            }}
          >
            {pageNumber}
          </Button>
        )
      })
  }

  const handleViewRatingDetail = () => {
    checkConditionForRating.mutate(
      { product_id: productId },
      {
        onSuccess: (data) => {
          setConditionRating(data.data.data.conditionForRating)
          if (conditionRating === conditionForRating.UPDATE) {
            if (data.data.data.ratingProduct) {
              setComment(data.data.data.ratingProduct.comment)
              setRating(Number(data.data.data.ratingProduct.rating))
              setRatingId(data.data.data.ratingProduct._id)
            }
          }
        }
      }
    )
    setShowFormRating(true)
  }

  return (
    <div className='container'>
      <div className=' bg-white p-4 shadow'>
        <div className='flex items-center justify-between rounded bg-gray-100 p-4 '>
          <div className='text-lg capitalize text-slate-700'>{t('ratingProduct')}</div>
          {!showFormRating && profile && conditionRating === conditionForRating.ADD && (
            <Button
              onClick={() => setShowFormRating(true)}
              className='rounded-lg bg-orange px-5 py-2.5 text-sm font-medium text-white hover:bg-orange/80 '
            >
              {t('addReview')}
            </Button>
          )}
          {!showFormRating && profile && conditionRating === conditionForRating.UPDATE && (
            <Button
              onClick={handleViewRatingDetail}
              className='rounded-lg bg-orange px-5 py-2.5 text-sm font-medium text-white hover:bg-orange/80 '
            >
              {t('viewYourReview')}
            </Button>
          )}
        </div>

        {showFormRating && (
          <div className='rounded-sm border border-t-0'>
            <div className='flex flex-col pt-5 sm:flex-row'>
              <div className='ml-4 pt-3 capitalize sm:w-[10%] sm:text-left'>{t('comment')}:</div>
              <div className='w-[80%] md:ml-[-3%]'>
                <ReactQuill value={comment} onChange={handleCommentChange} placeholder={'Nhận xét của bạn ...'} />
              </div>
            </div>
            <div className='flex flex-col pt-5 sm:flex-row md:items-center'>
              <div className='ml-4 capitalize sm:w-[10%] sm:text-left'>{t('rating')}:</div>
              <div className='sm: flex w-[80%] md:ml-[-3%]'>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      className='relative'
                      key={index}
                      onMouseEnter={() => {
                        handleMouseEnter(index + 1)
                      }}
                      // onMouseLeave={handleMouseLeave}
                      // tabIndex={0}
                      // role='button'
                      // onClick={() => handleClick(index + 1)}
                      // aria-hidden='true'
                    >
                      <div
                        className='absolute left-0 top-0 h-full overflow-hidden'
                        style={{ width: handleWith(index + 1) }}
                      >
                        <svg
                          enableBackground='new 0 0 15 15'
                          viewBox='0 0 15 15'
                          x={0}
                          y={0}
                          className='h-6 w-6 fill-yellow-300 text-yellow-300'
                        >
                          <polygon
                            points='7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeMiterlimit={10}
                          />
                        </svg>
                      </div>
                      <svg
                        enableBackground='new 0 0 15 15'
                        viewBox='0 0 15 15'
                        x={0}
                        y={0}
                        className='text-gray h-6 w-6 fill-gray-300'
                      >
                        <polygon
                          points='7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeMiterlimit={10}
                        />
                      </svg>
                    </div>
                  ))}
              </div>
            </div>
            <div className='mb-3 flex flex-row pt-5'>
              {conditionRating === conditionForRating.ADD && (
                <Button
                  onClick={handleAddRating}
                  className='ml-4 rounded-lg bg-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-orange/80 '
                >
                  {t('save')}
                </Button>
              )}
              {conditionRating === conditionForRating.UPDATE && (
                <div>
                  <Button
                    onClick={handleUpdateRating}
                    className='ml-4 rounded-lg bg-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-orange/80 '
                  >
                    {t('update')}
                  </Button>

                  <Button
                    onClick={() => {
                      setVisible(true)
                    }}
                    className='ml-4 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-400/80 '
                  >
                    {t('delete')}
                  </Button>
                </div>
              )}
              <Button
                onClick={() => {
                  setShowFormRating(false), setRating(1), setComment('')
                }}
                className='ml-4 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-400/80 '
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}

        <div className='mx-1 mb-4'>
          {ratingsProductData?.data.data.ratings.map((rating) => (
            <div className='flex border-b py-4 pl-5' key={rating._id}>
              <div className='mr-2.5 w-10 text-center'>
                <div className='h-10 w-10'>
                  <img
                    src={getAvatarURL(rating.user_id.avatar)}
                    alt='avatar'
                    className='h-full w-full rounded-full object-cover'
                  />
                </div>
              </div>
              <div className='flex-col'>
                <div className='text-opacity-87 text-xs text-black'>
                  {rating.user_id.name ? rating.user_id.name : 'User'}
                </div>
                <div className='my-1'>
                  <ProductRating
                    rating={Number(rating.rating)}
                    activeClassname='fill-yellow-300 text-yellow-300 h-4 w-4'
                    nonActiveClassname='fill-gray-300 text-gray h-4 w-4'
                  />
                </div>
                <div className='mb-3 mt-2 text-xs text-gray-500'>{convertTimeISO8601ToDate(rating.updatedAt)}</div>
                <div className='text-opacity-87 break-word relative my-2 box-border whitespace-pre-wrap text-base leading-5 text-black'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(rating.comment)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-6 flex flex-wrap justify-end'>
          {page === 1 ? (
            <span className='mx-2 cursor-not-allowed rounded border bg-white/60 px-3 py-2  shadow-sm'>Prev</span>
          ) : (
            <Button
              className='mx-2 cursor-pointer rounded border bg-white px-3 py-2  shadow-sm'
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
          )}

          {renderPagination()}
          {page === pageSize ? (
            <span className='mx-2 cursor-not-allowed rounded border bg-white/60 px-3 py-2  shadow-sm'>Next</span>
          ) : (
            <Button
              className='mx-2 cursor-pointer rounded border bg-white px-3 py-2  shadow-sm'
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          )}
        </div>
      </div>
      <Confirm visible={visible} Delete={handleDeleteRating} Cancel={() => setVisible(false)} />
    </div>
  )
}
