import { createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constants/path'
import { purchasesStatus } from 'src/constants/purchase'
import { PurchaseQueryConfig } from 'src/hooks/useQueryConfig'
import { PurchaseListConfig } from 'src/types/purchase.type'

interface Props {
  queryConfig: PurchaseQueryConfig
}

export default function FilterByPurchaseStatus({ queryConfig }: Props) {
  const navigate = useNavigate()
  const { status } = queryConfig
  const handleChangeCategory = (status: Exclude<PurchaseListConfig['status'], undefined>) => {
    if (status === '') {
      navigate({
        pathname: path.purchaseManganer
      })
    } else {
      navigate({
        pathname: path.purchaseManganer,
        search: createSearchParams({
          ...queryConfig,
          page: '1',
          status: status as string
        }).toString()
      })
    }
  }

  return (
    <select
      className={'h-8 bg-orange px-4 text-left text-sm capitalize text-white outline-none hover:bg-orange/80'}
      value={status || ''}
      onChange={(event) => handleChangeCategory(event.target.value as Exclude<PurchaseListConfig['status'], undefined>)}
    >
      <option value='' className='bg-white text-black'>
        Tất cả
      </option>
      <option className='bg-white text-black' value={purchasesStatus.waitForConfirmation}>
        Chờ xác nhận
      </option>
      <option className='bg-white text-black' value={purchasesStatus.waitForGetting}>
        Chờ lấy hàng
      </option>
      <option className='bg-white text-black' value={purchasesStatus.inProgress}>
        Đang giao
      </option>
      <option className='bg-white text-black' value={purchasesStatus.delivered}>
        Đã giao
      </option>
      <option className='bg-white text-black' value={purchasesStatus.cancelled}>
        Đã hủy
      </option>
    </select>
  )
}
