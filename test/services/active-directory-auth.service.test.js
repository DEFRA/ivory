const AdalNode = require('adal-node')
const ActiveDirectoryAuthService = require('../../server/services/active-directory-auth.service')
const config = require('../../server/utils/config')

const MISSING_TOKEN_ERROR = 'Error obtaining Active Directory auth token'
const CALL_ERROR = 'Call error'

jest.mock('adal-node')

describe('ActiveDirectoryAuthService', () => {
  const mockAcquireTokenWithClientCredentials = jest.fn()

  beforeAll(() => {
    AdalNode.AuthenticationContext.mockImplementation(() => {
      return {
        acquireTokenWithClientCredentials: mockAcquireTokenWithClientCredentials
      }
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTokenForDataverse', () => {
    it('should return a token for Dataverse', async () => {
      const mockToken = 'mockDataverseToken'
      mockAcquireTokenWithClientCredentials.mockImplementation((_resource, _clientId, _clientSecret, callback) => {
        callback(null, { accessToken: mockToken })
      })

      const token = await ActiveDirectoryAuthService.getTokenForDataverse()
      expect(token).toBe(mockToken)
      expect(mockAcquireTokenWithClientCredentials).toHaveBeenCalledWith(
        config.dataverseResource,
        config.dataverseClientId,
        config.dataverseClientSecret,
        expect.any(Function)
      )
    })

    it('should throw an error if token is not obtained', async () => {
      mockAcquireTokenWithClientCredentials.mockImplementation((_resource, _clientId, _clientSecret, callback) => {
        callback(null, {})
      })

      await expect(ActiveDirectoryAuthService.getTokenForDataverse()).rejects.toThrow(MISSING_TOKEN_ERROR)
    })

    it('should throw an error if the call to Entra ID errors', async () => {
      mockAcquireTokenWithClientCredentials.mockImplementation((_resource, _clientId, _clientSecret, callback) => {
        callback(new Error(CALL_ERROR), null)
      })

      await expect(ActiveDirectoryAuthService.getTokenForDataverse()).rejects.toThrow(CALL_ERROR)
    })
  })

  describe('getTokenForAddressLookup', () => {
    it('should return a token for Address Lookup', async () => {
      const mockToken = 'mockAddressLookupToken'
      mockAcquireTokenWithClientCredentials.mockImplementation((_resource, _clientId, _clientSecret, callback) => {
        callback(null, { accessToken: mockToken })
      })

      const token = await ActiveDirectoryAuthService.getTokenForAddressLookup()
      expect(token).toBe(mockToken)
      expect(mockAcquireTokenWithClientCredentials).toHaveBeenCalledWith(
        config.addressLookupResource,
        config.dataverseClientId,
        config.dataverseClientSecret,
        expect.any(Function)
      )
    })

    it('should throw an error if token is not obtained', async () => {
      mockAcquireTokenWithClientCredentials.mockImplementation((_resource, _clientId, _clientSecret, callback) => {
        callback(null, {})
      })

      await expect(ActiveDirectoryAuthService.getTokenForAddressLookup()).rejects.toThrow(MISSING_TOKEN_ERROR)
    })

    it('should throw an error if the call to Entra ID errors', async () => {
      mockAcquireTokenWithClientCredentials.mockImplementation((_resource, _clientId, _clientSecret, callback) => {
        callback(new Error(CALL_ERROR), null)
      })

      await expect(ActiveDirectoryAuthService.getTokenForDataverse()).rejects.toThrow(CALL_ERROR)
    })
  })

  describe('getToken', () => {
    it('should get token for Dataverse not for Address Lookup', async () => {
      const mockGetTokenForDataverse = jest.spyOn(ActiveDirectoryAuthService, 'getTokenForDataverse').mockResolvedValue('mockDataverseToken')

      await ActiveDirectoryAuthService.getToken()
      expect(mockGetTokenForDataverse).toHaveBeenCalled()

      mockGetTokenForDataverse.mockRestore()
    })
  })
})
