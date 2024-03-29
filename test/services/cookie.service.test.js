'use strict'

const CookieService = require('../../server/services/cookie.service')

describe('Cookie service', () => {
  describe('getSessionCookie method', () => {
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
      const cookie = CookieService.getSessionCookie(mockRequest)

      expect(cookie).toEqual(mockRequest.state.DefraIvorySession)
    })

    it("should check and return a null session cookie if it doesn't exist", async () => {
      mockRequest.state.DefraIvorySession = null
      const cookie = CookieService.getSessionCookie(mockRequest)

      expect(cookie).toBeNull()
    })
  })
})
