import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { omit } from 'lodash'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import adminApi from 'src/apis/admin.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import path from 'src/constants/path'
import { ErrorResponse } from 'src/types/utils.type'
import { Schema, schema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'

type FormData = Pick<Schema, 'email' | 'userName' | 'password' | 'confirm_password' | 'roles'>
const userSchema = schema.pick(['email', 'userName', 'password', 'confirm_password', 'roles'])

export default function AddUser() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError
  } = useForm<FormData>({
    defaultValues: {
      password: '',
      confirm_password: '',
      roles: ['User']
    },
    resolver: yupResolver(userSchema)
  })

  const addUserMutation = useMutation(adminApi.addUser)

  const navigate = useNavigate()

  const onSubmit = handleSubmit((data) => {
    const roles = data.roles as string[]
    const name = data.userName
    const body = {
      ...omit(data, ['confirm_password']),
      name,
      roles
    }
    addUserMutation.mutate(body, {
      onSuccess: () => {
        toast.success('Thêm người dùng mới thành công', { autoClose: 1000 })
        navigate(path.userManganer)
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError<ErrorResponse<Omit<FormData, 'confirm_password'>>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              if (Array.isArray(key)) {
                setError('roles', {
                  message: formError.roles[0] as string
                })
              } else {
                setError(key as keyof Omit<FormData, 'confirm_password' | 'roles'>, {
                  message: formError[key as keyof Omit<FormData, 'confirm_password' | 'roles'>],
                  type: 'Server'
                })
              }
            })
          }
        }
      }
    })
  })

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Thêm người dùng</h1>
      </div>
      <form className='mr-auto mt-8 max-w-2xl' onSubmit={onSubmit} noValidate>
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Email</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative '
                register={register}
                name='email'
                placeholder='Email'
                errorMessage={errors.email?.message}
              />
            </div>
          </div>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Tên</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative '
                register={register}
                name='userName'
                placeholder='Tên'
                errorMessage={errors.userName?.message}
              />
            </div>
          </div>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Mật khẩu</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative '
                register={register}
                name='password'
                type='password'
                placeholder='Mật khẩu'
                errorMessage={errors.password?.message}
                autoComplete='on'
              />
            </div>
          </div>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Nhập lại mật khẩu</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative '
                register={register}
                name='confirm_password'
                type='password'
                placeholder='Nhập lại mật khẩu'
                errorMessage={errors.confirm_password?.message}
                autoComplete='on'
              />
            </div>
          </div>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Quyền</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <select
                className='h-10 w-[25%] cursor-pointer rounded-sm border border-black/10 px-3 hover:border-orange'
                {...register('roles', { required: true })}
                defaultValue={['User']}
                multiple
              >
                <option value='User'>User</option>
                <option value='Admin'>Admin</option>
              </select>
            </div>
          </div>
          <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right' />
            <div className='sm:w-[80%] sm:pl-5'>
              <Button
                className='flex h-9 items-center rounded-sm bg-orange px-5 text-center text-sm text-white hover:bg-orange/80'
                type='submit'
              >
                Thêm
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
