// import type { RegisterOptions, UseFormGetValues } from 'react-hook-form'
import * as yup from 'yup'

// type Rules = { [key in 'email' | 'password' | 'confirm_password']?: RegisterOptions }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const getRules = (getValues?: UseFormGetValues<any>): Rules => ({
//   email: {
//     required: {
//       value: true,
//       message: 'Email là bắt buộc'
//     },
//     pattern: {
//       value: /^\S+@\S+\.\S+$/,
//       message: 'Email không đúng định dạng'
//     },
//     maxLength: {
//       value: 160,
//       message: 'Độ dài từ 5-160 ký tự'
//     },
//     minLength: {
//       value: 5,
//       message: 'Độ dài từ 5-160 ký tự'
//     }
//   },
//   password: {
//     required: {
//       value: true,
//       message: 'Password là bắt buộc'
//     },
//     maxLength: {
//       value: 160,
//       message: 'Độ dài từ 6-160 ký tự'
//     },
//     minLength: {
//       value: 6,
//       message: 'Độ dài từ 6-160 ký tự'
//     }
//   },
//   confirm_password: {
//     required: {
//       value: true,
//       message: 'Nhập lại password là bắt buộc'
//     },
//     maxLength: {
//       value: 160,
//       message: 'Độ dài từ 6-160 ký tự'
//     },
//     minLength: {
//       value: 6,
//       message: 'Độ dài từ 6-160 ký tự'
//     },
//     validate:
//       typeof getValues === 'function'
//         ? (value) => value === getValues('password') || 'Nhập lại password không khớp'
//         : undefined
//   }
// })

export const schema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không đúng định dạng')
    .min(5, 'Độ dài từ 5 đến 160 kí tự')
    .max(160, 'Độ dài từ 5 đến 160 ký tự'),
  password: yup
    .string()
    .required('Password là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 kí tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự'),
  confirm_password: yup
    .string()
    .required('Nhập lại password là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 kí tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự')
    .oneOf([yup.ref('password')], 'Nhập lại password không khớp'),
  price_min: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: function (value) {
      const price_min = value
      const { price_max } = this.parent as { price_min: string; price_max: string }
      if (price_min !== '' && price_max !== '') {
        return Number(price_max) >= Number(price_min)
      }
      return price_min !== '' || price_max !== ''
    }
  }),
  price_max: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: function (value) {
      const price_max = value
      const { price_min } = this.parent as { price_min: string; price_max: string }
      if (price_min !== '' && price_max !== '') {
        return Number(price_max) >= Number(price_min)
      }
      return price_min !== '' || price_max !== ''
    }
  }),
  name: yup.string().trim().required('Tên sản phẩm là bắt buộc'),
  search: yup.string().trim().required('Tên với các mục khác, email là với người dùng'),
  roles: yup.array().of(yup.string()).required('Quyền của người dùng là bắt buộc'),
  userName: yup.string().trim().required('Tên người dùng là bắt buộc').max(160, 'Độ dài tối đa là 160 ký tự'),
  categoryName: yup.string().trim().required('Tên danh mục sản phẩm là bắt buộc').max(160, 'Độ dài tối đa là 160 ký tự')
})

const handleConfirmPasswordYup = (refString: string) => {
  return yup
    .string()
    .required('Nhập lại password là bắt buộc')
    .min(6, 'Độ dài từ 6 - 160 ký tự')
    .max(160, 'Độ dài từ 6 - 160 ký tự')
    .oneOf([yup.ref(refString)], 'Nhập lại password không khớp')
}

export const userSchema = yup.object({
  email: yup
    .string()
    .email('Email không đúng định dạng')
    .min(5, 'Độ dài từ 5 đến 160 kí tự')
    .max(160, 'Độ dài từ 5 đến 160 ký tự'),
  name: yup
    .string()
    .max(160, 'Độ dài tối đa là 160 ký tự')
    .trim()
    .required('Tên là bắt buộc')
    .test({
      name: 'name-not-allowed',
      message: 'Tên không được để trống',
      test: function (value) {
        const name = value
        if (name.trim() === '') return false
        return true
      }
    }),
  phone: yup
    .string()
    .min(3, 'Độ dài tối thiểu là 3 ký tự')
    .max(20, 'Độ dài tối đa là 20 ký tự')
    .required('Số điện thoại là bắt buộc')
    .test({
      name: 'phone-not-allowed',
      message: 'Số điện thoại không được để trống',
      test: function (value) {
        const phone = value
        if (phone.trim() === '') return false
        return true
      }
    }),
  address: yup
    .string()
    .max(160, 'Độ dài tối đa là 160 ký tự')
    .required('Địa chỉ là bắt buộc')
    .trim()
    .test({
      name: 'address-not-allowed',
      message: 'Địa chỉ không được để trống',
      test: function (value) {
        const address = value
        if (address.trim() === '') return false
        return true
      }
    }),
  avatar: yup.string().max(1000, 'Độ dài tối đa là 1000 ký tự'),
  date_of_birth: yup.date().max(new Date(), 'Hãy chọn một ngày trong quá khứ'),
  password: schema.fields['password'] as yup.StringSchema<string | undefined, yup.AnyObject, undefined, ''>,
  new_password: schema.fields['password'] as yup.StringSchema<string | undefined, yup.AnyObject, undefined, ''>,
  confirm_password: handleConfirmPasswordYup('new_password'),
  roles: yup.array().of(yup.string())
})

export const productSchema = yup.object({
  name: yup.string().required('Tên sản phẩm là bắt buộc').max(160, 'Độ dài tối đa là 160 ký tự'),
  category: yup.string().required('Danh mục sản phẩm không được để trống'),
  quantity: yup
    .number()
    .typeError('Sản phẩm phải có số lượng')
    .required('Sản phẩm phải có số lượng')
    .min(0, 'Số lượng sản phẩm phải từ 0 trở lên'),
  price: yup
    .number()
    .typeError('Sản phẩm phải có giá')
    .required('Giá sản phẩm là bắt buộc')
    .test({
      name: 'price-not-allowed',
      message: 'Giá phải nhỏ hơn giá giảm giá',
      test: function (value) {
        const price = value
        const { price_before_discount } = this.parent
        if (price_before_discount && price_before_discount !== 0) {
          return price < price_before_discount
        }
        return true
      }
    }),
  price_before_discount: yup
    .number()
    .test({
      name: 'price_before_discount-not-allowed',
      message: 'Giá trước khi giảm giá phải bằng 0 hoặc lớn hơn giá hiện tại',
      test: function (value) {
        const price_before_discount = value
        const { price } = this.parent
        if (price_before_discount !== 0 && price_before_discount) {
          return price_before_discount > price
        }
        return true
      }
    })
    .typeError('Giá trước khi giảm giá phải bằng 0 hoặc lớn hơn giá hiện tại'),
  rating: yup
    .number()
    .min(0, 'Đánh giá phải lớn hơn hoặc bằng 0')
    .max(5, 'Đánh giá phải nhỏ hơn hoặc bằng 5')
    .typeError('Phải là số'),
  description: yup.string()
})

export type ProductSchema = yup.InferType<typeof productSchema>

export type UserSchema = yup.InferType<typeof userSchema>

export type Schema = yup.InferType<typeof schema>
