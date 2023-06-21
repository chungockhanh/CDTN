import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import adminApi from 'src/apis/admin.api'
import Button from 'src/components/Button'
import DateSelect from 'src/components/DateSelect'
import Input from 'src/components/Input'
import InputNumber from 'src/components/InputNumber'
import { AppContext } from 'src/contexts/app.context'
import { ErrorResponse } from 'src/types/utils.type'
import { clearLS, setProfileToLS } from 'src/utils/auth'
import { UserSchema, userSchema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'

type FormData = Pick<UserSchema, 'email' | 'name' | 'address' | 'phone' | 'date_of_birth' | 'roles' | 'password'>
type FormDataError = Omit<FormData, 'date_of_birth' | 'roles'> & {
  date_of_birth?: string
}

const editUserSchema = userSchema.pick(['email', 'name', 'address', 'phone', 'date_of_birth', 'roles'])

export default function UpdateUser() {
  const { profile } = useContext(AppContext)
  const { id } = useParams()
  const { data: userData } = useQuery({
    queryKey: ['user', id],
    queryFn: () => adminApi.getUser(id as string)
  })
  const updateUserMutation = useMutation(adminApi.updateUser)

  const userInfor = userData?.data.data

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    setError
  } = useForm<FormData>({
    defaultValues: {
      phone: '',
      address: '',
      password: '',
      date_of_birth: new Date(1930, 0, 1)
    },
    resolver: yupResolver(editUserSchema)
  })

  useEffect(() => {
    if (userInfor) {
      setValue('email', userInfor.email)
      setValue('name', userInfor.name as string)
      setValue('phone', userInfor.phone as string)
      setValue('address', userInfor.address as string)
      setValue('roles', userInfor.roles)
      setValue('date_of_birth', userInfor.date_of_birth ? new Date(userInfor.date_of_birth) : new Date(1930, 0, 1))
    }
  }, [userInfor, setValue])

  const onSubmit = handleSubmit((data) => {
    if (id) {
      if (data.password === '') {
        delete data.password
      }
      const body = {
        ...data,
        roles: data.roles as string[],
        date_of_birth: data.date_of_birth?.toISOString()
      }
      updateUserMutation.mutate(
        { id: id, body: body },
        {
          onSuccess: (data) => {
            toast.success('Cập nhật thông tin người dùng thành công', { autoClose: 1500 })
            if (id === profile?._id) {
              if (data.data.data.roles[0] === 'User') {
                clearLS()
                toast.error('Đăng nhập để tiếp tục', { autoClose: 1500 })
              }
              setProfileToLS(data.data.data)
            }
          },
          onError: (error) => {
            if (isAxiosUnprocessableEntityError<ErrorResponse<FormDataError>>(error)) {
              const formError = error.response?.data.data
              if (formError) {
                Object.keys(formError).forEach((key) => {
                  setError(key as keyof FormDataError, {
                    message: formError[key as keyof FormDataError],
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

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Thông tin chi tiết của người dùng</h1>
      </div>
      <form className='mt-8 flex w-[70%] flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit} noValidate>
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          <div className='flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Email</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
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
                register={register}
                name='name'
                placeholder='Tên'
                errorMessage={errors.name?.message}
              />
            </div>
          </div>

          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Nhập mật khẩu mới</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative '
                register={register}
                name='password'
                type='password'
                placeholder='Nhập mật khẩu mới'
                errorMessage={errors.password?.message}
                autoComplete='on'
              />
            </div>
          </div>

          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Số điện thoại</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Controller
                control={control}
                name='phone'
                render={({ field }) => (
                  <InputNumber
                    classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                    placeholder='Số điện thoại'
                    errorMessage={errors.phone?.message}
                    {...field}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Địa chỉ</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                register={register}
                name='address'
                placeholder='Địa chỉ'
                errorMessage={errors.address?.message}
              />
            </div>
          </div>
          <Controller
            control={control}
            name='date_of_birth'
            render={({ field }) => (
              <DateSelect errorMessage={errors.date_of_birth?.message} onChange={field.onChange} value={field.value} />
            )}
          />
          <div className='mt-4 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Quyền</div>
            <div className='sm:w-[80%] sm:pl-5'>
              {id === profile?._id && (
                <div className='pt-3 text-left text-red-500'>
                  Lưu ý: Bạn đang đăng nhập bằng tài khoản này, nếu chuyển sang quyền User bạn sẽ bị đăng xuất khỏi
                  trang
                </div>
              )}
              <select
                className='mt-3 h-10 w-[25%] cursor-pointer rounded-sm border border-black/10 px-3 hover:border-orange'
                {...register('roles', { required: true })}
                defaultValue={userInfor?.roles[0]}
                multiple
              >
                <option value='User'>User</option>
                <option value='Admin'>Admin</option>
              </select>
            </div>
          </div>
          <div className='mt-4 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right' />
            <div className='sm:w-[80%] sm:pl-5'>
              <Button
                className='flex h-9 items-center rounded-sm bg-orange px-5 text-center text-sm text-white hover:bg-orange/80'
                type='submit'
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
