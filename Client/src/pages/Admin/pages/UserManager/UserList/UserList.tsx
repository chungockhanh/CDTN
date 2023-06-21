import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import adminApi from 'src/apis/admin.api'
import Pagination from 'src/components/Pagination'
import { useUserQueryConfig } from 'src/hooks/useQueryConfig'
import { UserListConfig } from 'src/types/user.type'
import path from 'src/constants/path'
import useSearchUsers from 'src/hooks/useSearchUsers'
import { Link } from 'react-router-dom'
import Confirm from 'src/components/Confirm'
import { toast } from 'react-toastify'
import { AppContext } from 'src/contexts/app.context'
import { clearLS } from 'src/utils/auth'

export default function UserList() {
  const { profile } = useContext(AppContext)
  const { onSubmitSearch, register } = useSearchUsers()
  const queryConfig = useUserQueryConfig()
  const { data: usersData, refetch } = useQuery({
    queryKey: ['users', queryConfig],
    queryFn: () => {
      return adminApi.getUsers(queryConfig as UserListConfig)
    },
    keepPreviousData: true
  })
  const deleteUserMutation = useMutation(adminApi.deleteUser)
  const [idUserDelete, setIdUserDelete] = useState<null | string>(null)
  const visibleConfirm = idUserDelete !== null
  const showConfirm = (userId: string) => {
    setIdUserDelete(userId)
  }
  const hideConfirm = () => {
    setIdUserDelete(null)
  }

  const handleDelete = () => {
    if (idUserDelete) {
      deleteUserMutation.mutate(idUserDelete, {
        onSuccess: (data) => {
          refetch()
          toast.success(data.data.message, {
            autoClose: 1000
          })
          if (idUserDelete === profile?._id) {
            clearLS()
          }
        }
      })
      setIdUserDelete(null)
    }
  }
  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Quản lý người dùng</h1>
      </div>
      <div className='mt-3 flex items-center justify-between '>
        <form className=' md:w-[50%]' onSubmit={onSubmitSearch} noValidate>
          <div className='flex rounded-sm border-2 border-orange'>
            <input
              type='text'
              className='w-full flex-grow border-none bg-transparent px-3 py-1 text-black outline-none'
              placeholder='Nhập email người dùng muốn tìm'
              {...register('search')}
            />
            <button className='flex-shrink-0 rounded-sm bg-orange px-8 py-2 hover:opacity-90'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-5 w-5 stroke-white'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                />
              </svg>
            </button>
          </div>
        </form>
        <Link
          to={`${path.userManganer}/add`}
          type='button'
          className='mb-2 mr-2 rounded-lg bg-orange px-5 py-2.5 text-sm font-medium text-white hover:bg-orange/80 '
        >
          Thêm người dùng
        </Link>
      </div>
      <div className='mt-4 overflow-auto'>
        <div className='min-w-[900px]'>
          <div className='grid grid-cols-12 rounded-sm border border-gray-300 px-9 py-5 text-left text-base capitalize text-black shadow'>
            <div className='col-span-3'>ID</div>
            <div className='col-span-3 pl-1'>Email</div>
            <div className='col-span-3 pl-1'>Tên</div>
            <div className='col-span-1'>Quyền</div>
            <div className='col-span-2 pl-5'>Thao tác</div>
          </div>
          <div className='my-3 rounded-sm border border-gray-300 p-5 shadow'>
            {usersData?.data.data.users.map((user) => (
              <div
                className='grid cursor-pointer grid-cols-12 items-center rounded-sm border border-gray-300 px-5 py-4 text-left text-sm text-black hover:border-2 hover:border-orange'
                key={user._id}
              >
                <div className='col-span-3 truncate'>{user._id}</div>
                <div className='col-span-3 truncate pl-1'>{user.email}</div>
                <div className='col-span-3 pl-1'>{user.name}</div>
                <div className='col-span-1'>{user.roles[0]}</div>
                <div className='col-span-2 flex justify-between px-5 py-0'>
                  <button
                    className='m-0 bg-none text-black transition-colors hover:text-orange'
                    onClick={() => showConfirm(user._id)}
                  >
                    Xóa
                  </button>
                  <span className='m-0'>|</span>

                  <Link
                    to={`${path.userManganer}/${user._id}`}
                    className='m-0 bg-none text-black transition-colors hover:text-orange'
                  >
                    Sửa đổi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {usersData?.data.data.pagination.page_size && (
        <Pagination
          path={path.userManganer}
          queryConfig={queryConfig}
          pageSize={usersData.data.data.pagination.page_size as number}
        />
      )}
      <Confirm
        visible={visibleConfirm}
        Delete={handleDelete}
        Cancel={hideConfirm}
        message={idUserDelete === profile?._id ? 'Bạn đang đăng nhập bằng tài khoản này' : ''}
      />
    </div>
  )
}
