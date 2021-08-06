'use strict'

const CookieService = require('../../server/services/cookie.service')

describe('Cookie service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('checkSessionCookie method', () => {
    let mockRequest

    beforeEach(() => {
      mockRequest = {
        url: {
          pathname: '/some-path'
        },
        state: {
          DefraIvorySession: 'THE_SESSION'
        }
      }
    })

    it('should check and return the session cookie if it exists', async () => {
      const cookie = CookieService.checkSessionCookie(mockRequest)

      expect(cookie).toEqual(mockRequest.state.DefraIvorySession)
    })

    it("should check and return a null session cookie if it doesn't exist", async () => {
      mockRequest.state.DefraIvorySession = null
      const cookie = CookieService.checkSessionCookie({
        url: {
          pathname: '/some-path'
        },
        state: {
          DefraIvorySession: null
        }
      })

      expect(cookie).toBeNull()
    })
  })
})

const _createMocks = () => {
  // nock(`${config.paymentUrl}`)
  //   .post('/v1/payments')
  //   .reply(200, mockPayment)
  // nock(`${config.paymentUrl}`)
  //   .get('/v1/payments/PAYMENT_ID')
  //   .reply(200, mockPaymentResultSuccess)
}

// const mockPayment = {
//   amount: amount,
//   description: 'Musical instrument made before 1975 with less than 20% ivory',
//   reference,
//   language: 'en',
//   email: 'user@email.com',
//   state: { status: 'created', finished: false },
//   payment_id: '8hhs0qeq2m131rpn6com2jjfob',
//   payment_provider: 'sandbox',
//   created_date: '2021-05-13T07:06:47.780Z',
//   refund_summary: {
//     status: 'pending',
//     amount_available: amount,
//     amount_submitted: 0
//   }
// }
