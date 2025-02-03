'use strict'

const CookieService = require('../../server/services/cookie.service')

describe('Cookie service', () => {
  describe('getSessionCookie method', () => {
    let mockRequest
    let consoleLogSpy

    beforeEach(() => {
      mockRequest = {
        url: {
          pathname: '/some-path'
        },
        state: {
          DefraIvorySession: 'THE_SESSION'
        }
      }
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleLogSpy.mockRestore()
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

    it('should log a message if the session cookie does not exist and displayLogMessage is true', async () => {
      mockRequest.state.DefraIvorySession = null
      CookieService.getSessionCookie(mockRequest, true)

      expect(consoleLogSpy).toHaveBeenCalledWith(`Session cookie not found for page ${mockRequest.url.pathname}`)
    })

    it('should log a message if the session cookie does not exist and displayLogMessage is not provided', async () => {
      mockRequest.state.DefraIvorySession = null
      CookieService.getSessionCookie(mockRequest)

      expect(consoleLogSpy).toHaveBeenCalledWith(`Session cookie not found for page ${mockRequest.url.pathname}`)
    })

    it('should not log a message if the session cookie does not exist and displayLogMessage is false', async () => {
      mockRequest.state.DefraIvorySession = null
      CookieService.getSessionCookie(mockRequest, false)

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })
})
