import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { schema, Schema } from 'src/utils/rules'
import { createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constants/path'
import { useCategoryQueryConfig } from './useQueryConfig'

type FormData = Pick<Schema, 'search'>

const searchSchema = schema.pick(['search'])

export default function useSearchPurchases() {
  const queryConfig = useCategoryQueryConfig()

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      search: ''
    },
    resolver: yupResolver(searchSchema)
  })
  const navigate = useNavigate()

  const onSubmitSearch = handleSubmit((data) => {
    const config = {
      ...queryConfig,
      search: data.search
    }
    navigate({
      pathname: path.purchaseManganer,
      search: createSearchParams(config).toString()
    })
  })
  return { onSubmitSearch, register }
}
