import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HOME_EN from 'src/locales/en/home.json'

import PRODUCTDETAIL_EN from 'src/locales/en/productDetail.json'
import NAVHEADER_EN from 'src/locales/en/navHeader.json'
import HEADER_EN from 'src/locales/en/header.json'
import CART_EN from 'src/locales/en/cart.json'
import REGISTER_EN from 'src/locales/en/register.json'
import USER_EN from 'src/locales/en/user.json'
import RATINGPRODUCT_EN from 'src/locales/en/ratingProduct.json'
import CONFIRMPOPUP_EN from 'src/locales/en/deletePopup.json'
import PAYMENTNOTI_EN from 'src/locales/en/paymentNotification.json'

import HOME_VI from 'src/locales/vi/home.json'
import PRODUCTDETAIL_VI from 'src/locales/vi/productDetail.json'
import NAVHEADER_VI from 'src/locales/vi/navHeader.json'
import HEADER_VI from 'src/locales/vi/header.json'
import CART_VI from 'src/locales/vi/cart.json'
import REGISTER_VI from 'src/locales/vi/register.json'
import USER_VI from 'src/locales/vi/user.json'
import RATINGPRODUCT_VI from 'src/locales/vi/ratingProduct.json'
import CONFIRMPOPUP_VI from 'src/locales/vi/deletePopup.json'
import PAYMENTNOTI_VI from 'src/locales/vi/paymentNotification.json'

export const locales = {
  en: 'English',
  vi: 'Tiếng Việt'
} as const

export const resources = {
  en: {
    home: HOME_EN,
    productDetail: PRODUCTDETAIL_EN,
    navHeader: NAVHEADER_EN,
    header: HEADER_EN,
    cart: CART_EN,
    register: REGISTER_EN,
    user: USER_EN,
    ratingProduct: RATINGPRODUCT_EN,
    confirmPopup: CONFIRMPOPUP_EN,
    paymentNoti: PAYMENTNOTI_EN
  },
  vi: {
    home: HOME_VI,
    productDetail: PRODUCTDETAIL_VI,
    navHeader: NAVHEADER_VI,
    header: HEADER_VI,
    cart: CART_VI,
    register: REGISTER_VI,
    user: USER_VI,
    ratingProduct: RATINGPRODUCT_VI,
    confirmPopup: CONFIRMPOPUP_VI,
    paymentNoti: PAYMENTNOTI_VI
  }
} as const

export const defaultNS = 'productDetail'

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  ns: [
    'home',
    'productDetail',
    'navHeader',
    'header',
    'cart',
    'register',
    'user',
    'ratingProduct',
    'confirmPopup',
    'paymentNoti'
  ],
  fallbackLng: 'vi',
  defaultNS,
  interpolation: {
    escapeValue: false // react already safes from xss
  }
})
