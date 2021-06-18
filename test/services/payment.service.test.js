'use strict'

const nock = require('nock')
const config = require('../../server/utils/config')

const PaymentService = require('../../server/services/payment.service')

const amount = 2000
const reference = 'THE_REFERENCE'
const description =
  'Musical instrument made before 1975 with less than 20% ivory'
const email = 'user@email.com'

describe('Address service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('makePayment method', () => {
    it('should make payments using the payment service', async () => {
      const results = await PaymentService.makePayment(
        amount,
        reference,
        description,
        email
      )

      expect(results.amount).toEqual(amount)
      expect(results.description).toEqual(description)
      expect(results.reference).toEqual(reference)
      expect(results.email).toEqual(email)
      expect(results.state.status).toEqual('created')
    })
  })

  describe('lookupPayment method', () => {
    it('should make look up payments using the payment service', async () => {
      const paymentId = 'PAYMENT_ID'
      const results = await PaymentService.lookupPayment(paymentId)

      expect(results.state.status).toEqual('success')
    })
  })
})

const _createMocks = () => {
  nock(`${config.paymentUrl}`)
    .post('/v1/payments')
    .reply(200, mockPayment)
  nock(`${config.paymentUrl}`)
    .get('/v1/payments/PAYMENT_ID')
    .reply(200, mockPaymentResultSuccess)
}

const mockPayment = {
  amount: amount,
  description: 'Musical instrument made before 1975 with less than 20% ivory',
  reference,
  language: 'en',
  email: 'user@email.com',
  state: { status: 'created', finished: false },
  payment_id: '8hhs0qeq2m131rpn6com2jjfob',
  payment_provider: 'sandbox',
  created_date: '2021-05-13T07:06:47.780Z',
  refund_summary: {
    status: 'pending',
    amount_available: amount,
    amount_submitted: 0
  }
}

const mockPaymentResultSuccess = {
  amount: amount,
  description,
  reference,
  language: 'en',
  email,
  state: { status: 'success', finished: true },
  payment_id: '7kfpv7p0gsuf3rkivblgdpuv0d',
  payment_provider: 'sandbox',
  created_date: '2021-05-13T07:11:09.877Z',
  refund_summary: {
    status: 'available',
    amount_available: amount,
    amount_submitted: 0
  }
}
