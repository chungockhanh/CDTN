import { Fragment } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmProps {
  visible: boolean
  Delete: () => void
  Cancel: () => void
  message?: string
}
const root = document.getElementById('root') as HTMLElement

export default function Confirm({ visible, Delete, Cancel, message }: ConfirmProps) {
  const handleDelete = () => {
    Delete()
  }

  const handleCancel = () => {
    Cancel()
  }

  return createPortal(
    <Fragment>
      {visible && (
        <div className='fixed inset-0 z-10 flex items-center justify-center overflow-y-scroll bg-black/30'>
          <div className='relative max-h-full w-full max-w-md'>
            <div className='relative rounded-lg bg-white shadow dark:bg-gray-700'>
              <div className='p-6 text-center'>
                <svg
                  aria-hidden='true'
                  className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <h3 className='mb-5 text-lg font-normal text-gray-500'>{message}</h3>
                <h3 className='mb-5 text-lg font-normal text-gray-500'>Bạn có chắc chắn muốn xóa ?</h3>
                <button
                  type='button'
                  className='rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800  '
                  onClick={handleDelete}
                >
                  Xóa
                </button>
                <span className='px-9 py-0' />
                <button
                  type='button'
                  className='rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  onClick={handleCancel}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>,
    root
  )
}
