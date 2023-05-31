import { createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constants/path'
import { ProductQueryConfig } from 'src/hooks/useQueryConfig'
import { Category } from 'src/types/category.type'
import { ProductListConfig } from 'src/types/product.type'

interface Props {
  queryConfig: ProductQueryConfig
  categories: Category[]
}

export default function FindByCategory({ queryConfig, categories }: Props) {
  const navigate = useNavigate()
  const { category, name } = queryConfig
  const handleChangeCategory = (categoryIdValue: Exclude<ProductListConfig['category'], undefined>) => {
    if (categoryIdValue === '') {
      if (name) {
        navigate({
          pathname: path.productManganer,
          search: createSearchParams({
            name: name
          }).toString()
        })
      } else {
        navigate({
          pathname: path.productManganer
        })
      }
    } else {
      navigate({
        pathname: path.productManganer,
        search: createSearchParams({
          ...queryConfig,
          page: '1',
          category: categoryIdValue
        }).toString()
      })
    }
  }

  return (
    <select
      className={'h-8 bg-orange px-4 text-left text-sm capitalize text-white outline-none hover:bg-orange/80'}
      value={category || ''}
      onChange={(event) =>
        handleChangeCategory(event.target.value as Exclude<ProductListConfig['category'], undefined>)
      }
    >
      <option value='' className='bg-white text-black'>
        Tất cả
      </option>
      {categories.map((categoryItem) => {
        return (
          <option key={categoryItem._id} value={categoryItem._id} className='bg-white text-black'>
            {categoryItem.name}
          </option>
        )
      })}
    </select>
  )
}
