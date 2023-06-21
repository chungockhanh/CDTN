import { Fragment, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  isMultiple?: boolean
}

export default function InputFile({ onFileChange, isMultiple = false }: Props) {
  const { t } = useTranslation('user')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleUpload = () => {
    fileInputRef.current?.click()
  }
  return (
    <Fragment>
      <input
        className='hidden'
        type='file'
        accept='.jpeg,.jpg,.png'
        ref={fileInputRef}
        onChange={onFileChange}
        onClick={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(event.target as any).value = null
        }}
        multiple={isMultiple}
      />
      <button
        className='flex h-10 items-center justify-end rounded-sm border bg-white px-6 text-sm text-gray-600 shadow-sm'
        type='button'
        onClick={handleUpload}
      >
        {t('profile.choose picture')}
      </button>
    </Fragment>
  )
}
