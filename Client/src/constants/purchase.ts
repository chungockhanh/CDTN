export const purchasesStatus = {
  inCart: -1,
  all: 0,
  waitForConfirmation: 1,
  waitForGetting: 2,
  inProgress: 3,
  delivered: 4,
  cancelled: 5
} as const

export const payMethod = {
  byCash: 0,
  byVnPay: 1
} as const

export const payStatus = {
  UNPAID: 0,
  PAID: 1
} as const
