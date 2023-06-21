import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import adminApi from 'src/apis/admin.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import { Schema, schema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import { toast } from 'react-toastify'
import path from 'src/constants/path'
import { useEffect } from 'react'

type FormData = Pick<Schema, 'categoryName'>
const categorySchema = schema.pick(['categoryName'])

export default function AddUpdateCategory() {
  const addCategoryMatch = useMatch('/admin/categories/add')
  const isAdd = Boolean(addCategoryMatch)
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue
  } = useForm<FormData>({
    resolver: yupResolver(categorySchema)
  })

  const { data: categoryData } = useQuery({
    enabled: !isAdd,
    queryKey: ['category'],
    queryFn: () => {
      return adminApi.getCategory(id as string)
    }
  })

  useEffect(() => {
    if (!isAdd && categoryData) {
      setValue('categoryName', categoryData.data.data.name)
    }
  }, [categoryData, isAdd, setValue])

  const navigate = useNavigate()

  const addCategoryMutation = useMutation(adminApi.addCategory)

  const updateCategoryMutation = useMutation(adminApi.updateCategory)

  const onSubmit = handleSubmit((data) => {
    if (isAdd) {
      addCategoryMutation.mutate(
        { name: data.categoryName },
        {
          onSuccess: () => {
            toast.success('Thêm danh mục sản phẩm thành công', { autoClose: 1000 })
            navigate(path.categoryManganer)
          },
          onError: (error) => {
            if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
              const formError = error.response?.data.data
              if (formError) {
                Object.keys(formError).forEach((key) => {
                  setError(key as keyof FormData, {
                    message: formError[key as keyof FormData],
                    type: 'Server'
                  })
                })
              }
            }
          }
        }
      )
    } else {
      const body = { name: data.categoryName }
      updateCategoryMutation.mutate(
        { id: id as string, body: body },
        {
          onSuccess: () => {
            toast.success('Cập nhật danh mục sản phẩm thành công', { autoClose: 1000 })
            navigate(path.categoryManganer)
          },
          onError: (error) => {
            if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
              const formError = error.response?.data.data
              if (formError) {
                Object.keys(formError).forEach((key) => {
                  setError(key as keyof FormData, {
                    message: formError[key as keyof FormData],
                    type: 'Server'
                  })
                })
              }
            }
          }
        }
      )
    }
  })

  const { id } = useParams()

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>
          {isAdd ? 'Thêm danh mục sản phẩm' : 'Sửa đổi danh mục sản phấm'}
        </h1>
      </div>
      <form className='mr-auto mt-8 max-w-2xl' onSubmit={onSubmit}>
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Tên</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative '
                register={register}
                name='categoryName'
                placeholder='Tên'
                errorMessage={errors.categoryName?.message}
              />
            </div>
          </div>
        </div>
        <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
          <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right' />
          <div className='sm:w-[80%] sm:pl-5'>
            <Button
              className='flex h-9 items-center rounded-sm bg-orange px-5 text-center text-sm text-white hover:bg-orange/80'
              type='submit'
            >
              {isAdd ? 'Thêm' : 'Lưu'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
