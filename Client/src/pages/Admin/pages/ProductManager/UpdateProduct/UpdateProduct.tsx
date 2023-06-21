// 1 nùi code chưa tách

import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
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
import { useNavigate, useParams } from 'react-router-dom'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import config from 'src/constants/config'
import path from 'src/constants/path'

type FormDataProduct = Pick<
  ProductSchema,
  'name' | 'category' | 'description' | 'quantity' | 'price' | 'price_before_discount'
>
const productSchema = schema.pick(['name', 'category', 'description', 'quantity', 'price', 'price_before_discount'])

export default function UpdateProduct() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categoriyForUpdateProduct'],
    queryFn: () => {
      return categoryApi.getCategories()
    },
    keepPreviousData: true
  })

  const { id } = useParams()

  const { data: productDetailData } = useQuery({
    queryKey: ['product', id],
    queryFn: () => adminApi.getProductDetail(id as string),
    staleTime: 2 * 60 * 1000
  })

  const { data: productImageData } = useQuery({
    queryKey: ['productImg', id],
    queryFn: () => adminApi.getAllImageProduct(id as string)
  })

  const productDetail = productDetailData?.data.data

  const navigate = useNavigate()

  const [files, setFiles] = useState<FileList>()
  const [file, setFile] = useState<File>()

  const uploadImagesMutation = useMutation(adminApi.uploadImagesProduct)
  const uploadImageMutation = useMutation(adminApi.uploadImageProduct)
  const deleteImagesMutation = useMutation(adminApi.deleteProductImgs)
  const deleteImageMutation = useMutation(adminApi.deleteProductImg)
  const updateProductMutation = useMutation(adminApi.updateProduct)

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
    control
  } = useForm<FormDataProduct>({
    defaultValues: {
      quantity: 1,
      price: 0,
      price_before_discount: 0
    },
    resolver: yupResolver(productSchema)
  })

  useEffect(() => {
    if (productDetail) {
      setValue('name', productDetail.name)
      setValue('category', productDetail.category._id)
      setValue('quantity', productDetail.quantity)
      productDetail.price_before_discount > 0
        ? setValue('price_before_discount', productDetail.price_before_discount)
        : setValue('price_before_discount', 0)
      setValue('price', productDetail.price)
      setValue('description', productDetail.description)
    }
  }, [productDetail, setValue])

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : productDetailData?.data.data.image
  }, [file, productDetailData])

  const previewImages = useMemo(() => {
    if (files) {
      const imagesFile = Array.from(files)
      return imagesFile.map((file) => {
        return URL.createObjectURL(file)
      })
    } else {
      if (productDetailData) {
        const images = productDetailData.data.data.images
        const index = images.indexOf(productDetailData.data.data.image)
        if (index > -1) {
          images.splice(index, 1)
        }

        return images
      }
      return []
    }
  }, [files, productDetailData])

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

  const ImgForm = (fileData: File | FileList) => {
    const form = new FormData()
    if (fileData instanceof FileList) {
      for (let i = 0; i < fileData.length; i++) {
        form.append('images', fileData[i], fileData[i].name)
      }
    } else {
      form.append('image', fileData)
    }
    return form
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (productImageData) {
        let image = productImageData.data.data.image
        let images = productImageData.data.data.images
        if (checkDuplicateImages === false) {
          if (file && files) {
            deleteImageMutation.mutate(id as string)
            deleteImagesMutation.mutate(id as string)
            const uploadImageRes = await uploadImageMutation.mutateAsync(ImgForm(file))
            const uploadImagesRes = await uploadImagesMutation.mutateAsync(ImgForm(files))
            image = uploadImageRes.data.data
            images = uploadImagesRes.data.data
            images.unshift(image)
          } else if (file && !files) {
            const index = images.findIndex((img) => img === image)
            if (index > -1) {
              images.splice(index, 1)
            }
            deleteImageMutation.mutate(id as string)
            const uploadImageRes = await uploadImageMutation.mutateAsync(ImgForm(file))
            image = uploadImageRes.data.data
            images.unshift(image)
          } else if (file === undefined && files) {
            deleteImagesMutation.mutate(id as string)
            const uploadImagesRes = await uploadImagesMutation.mutateAsync(ImgForm(files))
            images = uploadImagesRes.data.data
            if (image) {
              images.unshift(image)
            }
          }
        }
        const body = {
          ...data,
          image: image,
          images: images,
          description: data.description ? data.description : ''
        }
        // console.log(body)
        updateProductMutation.mutate(
          { id: id as string, body: body },
          {
            onSuccess: () => {
              toast.success('Cập nhât sản phẩm thành công', { autoClose: 1000 })
              navigate(path.home + `${id}`)
            }
          }
        )
      }
    } catch (error) {
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormDataProduct>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormDataProduct, {
              message: formError[key as keyof FormDataProduct] as string,
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
        <h1 className='text-lg font-medium capitalize text-gray-900'>Thông tin chi tiết sản phẩm</h1>
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
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Giá trước khi giảm giá</div>
            <div className='sm:w-[50%] sm:pl-5'>
              <Controller
                control={control}
                name='price_before_discount'
                render={({ field }) => (
                  <InputNumber
                    classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                    placeholder='Giá trước khi giảm giá của sản phẩm'
                    errorMessage={errors.price_before_discount?.message}
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
                    placeholder='Giá sản phẩm'
                    errorMessage={errors.price?.message}
                    {...field}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className='flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Lượt xem</div>
            <span className='pl-6 pt-3 font-bold text-black'>{productDetail?.view}</span>
          </div>

          <div className='mt-3 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Bán</div>
            <span className='pl-6 pt-3 font-bold text-black'>{productDetail?.sold}</span>
          </div>

          <div className='mt-3 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Đánh giá</div>
            <span className='pl-6 pt-3 font-bold text-black'>{productDetail?.rating}</span>
          </div>

          <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Mô tả sản phẩm</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Controller
                name='description'
                control={control}
                render={({ field }) => <ReactQuill {...field} placeholder='Mô tả sản phẩm' theme='snow' />}
              />
            </div>
          </div>

          {/* <div className='mt-8 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Đánh giá sản phẩm</div>
            <div className='sm:w-[20%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                placeholder='Đánh giá sản phẩm'
                name='rating'
                defaultValue={productDetailData?.data.data.rating}
                errorMessage={errors.rating?.message}
              />
            </div>
          </div> */}

          <div className='mt-4 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Ảnh sản phẩm chính</div>
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
              <div className='relative mt-4 grid grid-cols-2 gap-2'>
                <div className='relative w-full pt-[100%]'>
                  <img
                    src={previewImage}
                    alt='product'
                    className='absolute left-0 top-0 h-full w-full border bg-white object-cover p-1'
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='mt-8 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Ảnh sản phẩm phụ</div>
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
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
