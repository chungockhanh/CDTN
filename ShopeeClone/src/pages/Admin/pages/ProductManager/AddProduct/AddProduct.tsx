import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import adminApi from 'src/apis/admin.api'
import categoryApi from 'src/apis/category.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import InputFile from 'src/components/InputFile'
import { ProductSchema, productSchema as schema } from 'src/utils/rules'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import InputNumber from 'src/components/InputNumber'
import { useNavigate } from 'react-router-dom'
import path from 'src/constants/path'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import config from 'src/constants/config'

type FormData = Pick<ProductSchema, 'name' | 'category' | 'description' | 'quantity' | 'price'>
const productSchema = schema.pick(['name', 'category', 'description', 'quantity', 'price'])

export default function AddProduct() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categoryListData'],
    queryFn: () => {
      return categoryApi.getCategories()
    },
    keepPreviousData: true
  })

  const navigate = useNavigate()

  const [files, setFiles] = useState<FileList>()
  const [file, setFile] = useState<File>()

  const uploadImagesMutation = useMutation(adminApi.uploadImagesProduct)
  const uploadImageMutation = useMutation(adminApi.uploadImageProduct)
  const addProductMutation = useMutation(adminApi.addProduct)

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    control
  } = useForm<FormData>({
    defaultValues: {
      quantity: 1,
      price: 0
    },
    resolver: yupResolver(productSchema)
  })

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  const previewImages = useMemo(() => {
    if (files) {
      const imagesFile = Array.from(files)
      return imagesFile.map((file) => {
        return URL.createObjectURL(file)
      })
    }
    return []
  }, [files])

  const checkDuplicateImages = useMemo(() => {
    let check = false
    if (files && file) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].name === file.name) {
          check = true
        }
      }
    }
    return check
  }, [file, files])

  const onImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = event.target.files?.[0]
    if (fileFromLocal && (fileFromLocal?.size >= config.maxSizeUploadAvatar || !fileFromLocal.type.includes('image'))) {
      toast.error('Dung lượng file tối đa 1MB. Định dạng .JPEG, .JPG, .PNG', {
        autoClose: 3000
      })
    } else {
      setFile(fileFromLocal)
    }
  }

  const onSubImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesFromLocal = event.target.files
    if (filesFromLocal) {
      setFiles(filesFromLocal)
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (file && checkDuplicateImages === false) {
        const ImageForm = new FormData()
        ImageForm.append('image', file)
        const uploadImageRes = await uploadImageMutation.mutateAsync(ImageForm)
        const image = uploadImageRes.data.data
        let images: string[] = []
        if (files) {
          const form = new FormData()
          for (let i = 0; i < files.length; i++) {
            form.append('images', files[i], files[i].name)
          }
          const uploadImagesRes = await uploadImagesMutation.mutateAsync(form)
          images = uploadImagesRes.data.data
        }
        images.unshift(image)
        const body = {
          ...data,
          image: image,
          images: images,
          description: data.description ? data.description : ''
        }
        addProductMutation.mutate(body, {
          onSuccess: () => {
            toast.success('Thêm sản phẩm thành công', { autoClose: 1000 })
            navigate(path.productManganer)
          }
        })
      }
    } catch (error) {
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormData, {
              message: formError[key as keyof FormData] as string,
              type: 'Server'
            })
          })
        }
      }
    }
  })

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>Thêm sản phẩm</h1>
      </div>

      <form className='mt-8 flex flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit}>
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Tên sản phẩm</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                register={register}
                name='name'
                placeholder='Nhập tên sản phẩm'
                errorMessage={errors.name?.message}
              />
            </div>
          </div>

          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Danh mục sản phẩm</div>
            <div className='sm:w-[60%] sm:pl-5'>
              <select
                className='h-10 cursor-pointer rounded-sm border border-black/10 px-3 hover:border-orange'
                defaultValue=''
                {...register('category')}
              >
                <option value='' disabled>
                  Danh mục sản phẩm
                </option>
                {categoriesData?.data.data.map((categoryItem) => {
                  return (
                    <option key={categoryItem._id} value={categoryItem._id} className='bg-white text-black'>
                      {categoryItem.name}
                    </option>
                  )
                })}
              </select>
              <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{errors.category?.message}</div>
            </div>
          </div>

          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Số lượng sản phẩm</div>
            <div className='sm:w-[50%] sm:pl-5'>
              <Controller
                control={control}
                name='quantity'
                render={({ field }) => (
                  <InputNumber
                    classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                    placeholder='Số lượng sản phẩm'
                    errorMessage={errors.quantity?.message}
                    {...field}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Giá</div>
            <div className='sm:w-[50%] sm:pl-5'>
              <Controller
                control={control}
                name='price'
                render={({ field }) => (
                  <InputNumber
                    classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                    placeholder='Số lượng sản phẩm'
                    errorMessage={errors.price?.message}
                    {...field}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Mô tả sản phẩm</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Controller
                name='description'
                control={control}
                render={({ field }) => <ReactQuill {...field} placeholder='Mô tả sản phẩm' theme='snow' />}
              />
            </div>
          </div>

          <div className='mt-8 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Ảnh chính của sản phẩm </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <div className='flex'>
                <InputFile onFileChange={onImageFileChange} isMultiple={false} />
                <button
                  type='button'
                  className='ml-10 flex h-9 items-center rounded-sm bg-red-500 px-5 text-center text-sm text-white hover:bg-red-300'
                  onClick={() => {
                    setFile(undefined)
                  }}
                >
                  Hủy
                </button>
              </div>
              {!file && <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>Sản phẩm này phải có ảnh chính</div>}
              {file && (
                <div className='relative mt-4 grid grid-cols-2 gap-2'>
                  <div className='relative w-full pt-[100%]'>
                    <img
                      src={previewImage}
                      alt='product'
                      className='absolute left-0 top-0 h-full w-full border bg-white object-cover p-1'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='mt-8 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Các ảnh phụ sản phẩm </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <div className='flex'>
                <InputFile onFileChange={onSubImageFileChange} isMultiple={true} />
                <button
                  type='button'
                  className='ml-10 flex h-9 items-center rounded-sm bg-red-500 px-5 text-center text-sm text-white hover:bg-red-300'
                  onClick={() => {
                    setFiles(undefined)
                  }}
                >
                  Hủy
                </button>
              </div>
              <div className='mt-1 text-gray-400'>
                {checkDuplicateImages ? (
                  <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>Có ảnh trùng với ảnh sản phẩm chính</div>
                ) : (
                  <div>Chọn tối thiểu 2 ảnh</div>
                )}
              </div>
              <div className='relative mt-4 grid grid-cols-5 gap-1'>
                {previewImages.length > 0 &&
                  previewImages.map((image) => {
                    return (
                      <div className='relative w-full pt-[100%]' key={image}>
                        <img
                          src={image}
                          alt='product'
                          className='absolute left-0 top-0 h-full w-full border bg-white object-cover p-1'
                        />
                      </div>
                    )
                  })}
              </div>
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
