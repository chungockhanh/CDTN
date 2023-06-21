import { Fragment } from 'react'
import AdminSideNav from '../../components/AdminSideNav'
import ExtraHeader from 'src/components/ExtraHeader'
import Footer from 'src/components/Footer'

interface Props {
  children?: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <Fragment>
      <ExtraHeader headerName='Trang quản lý' searchBarActive={false} activeChangeLang={false} />
      <div className='bg-neutral-100 py-16 text-sm text-gray-600'>
        <div className='container'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
            <div className='md:col-span-3 lg:col-span-2'>
              <AdminSideNav />
            </div>
            <div className='md:col-span-9 lg:col-span-10'>{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </Fragment>
  )
}
