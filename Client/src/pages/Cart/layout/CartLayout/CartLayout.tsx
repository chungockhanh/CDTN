import ExtraHeader from 'src/components/ExtraHeader'
import Footer from 'src/components/Footer'
import { useTranslation } from 'react-i18next'

interface Props {
  children?: React.ReactNode
}

export default function CartLayout({ children }: Props) {
  const { t } = useTranslation('cart')
  return (
    <div>
      <ExtraHeader headerName={t('header name')} />
      {children}
      <Footer />
    </div>
  )
}
