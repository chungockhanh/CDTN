import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HOME_EN from 'src/locales/en/home.json'

import PRODUCTDETAIL_EN from 'src/locales/en/productDetail.json'
import NAVHEADER_EN from 'src/locales/en/navHeader.json'
import HEADER_EN from 'src/locales/en/header.json'
import CART_EN from 'src/locales/en/cart.json'
import REGISTER_EN from 'src/locales/en/register.json'
import USER_EN from 'src/locales/en/user.json'

import HOME_VI from 'src/locales/vi/home.json'
import PRODUCTDETAIL_VI from 'src/locales/vi/productDetail.json'
import NAVHEADER_VI from 'src/locales/vi/navHeader.json'
import HEADER_VI from 'src/locales/vi/header.json'
import CART_VI from 'src/locales/vi/cart.json'
import REGISTER_VI from 'src/locales/vi/register.json'
import USER_VI from 'src/locales/vi/user.json'

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
    user: USER_EN
  },
  vi: {
    home: HOME_VI,
    productDetail: PRODUCTDETAIL_VI,
    navHeader: NAVHEADER_VI,
    header: HEADER_VI,
    cart: CART_VI,
    register: REGISTER_VI,
    user: USER_VI
  }
} as const

export const defaultNS = 'productDetail'

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  ns: ['home', 'productDetail', 'navHeader', 'header', 'cart', 'register', 'user'],
  fallbackLng: 'vi',
  defaultNS,
  interpolation: {
    escapeValue: false // react already safes from xss
  }
})
