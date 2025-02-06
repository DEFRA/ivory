const msal = require('@azure/msal-node')
const ActiveDirectoryAuthService = require('../../server/services/active-directory-auth.service')
const config = require('../../server/utils/config')

const MISSING_TOKEN_ERROR = 'Error obtaining Active Directory auth token'
const CALL_ERROR = 'Call error'

jest.mock('@azure/msal-node')

describe('ActiveDirectoryAuthService', () => {
  const mockAcquireTokenByClientCredential = jest.fn()

  beforeAll(() => {
    msal.ConfidentialClientApplication.mockImplementation(() => {
      return {
        acquireTokenByClientCredential: mockAcquireTokenByClientCredential
      }
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTokenForDataverse', () => {
    it('should return a token for Dataverse', async () => {
      const mockToken = 'mockDataverseToken'
      mockAcquireTokenByClientCredential.mockResolvedValue({ accessToken: mockToken })

      const token = await ActiveDirectoryAuthService.getTokenForDataverse()
      expect(token).toBe(mockToken)
      expect(mockAcquireTokenByClientCredential).toHaveBeenCalledWith({
        scopes: [config.dataverseResource + '/.default']
      })
    })

    it('should throw an error if token is not obtained', async () => {
      mockAcquireTokenByClientCredential.mockResolvedValue({})

      await expect(ActiveDirectoryAuthService.getTokenForDataverse()).rejects.toThrow(MISSING_TOKEN_ERROR)
    })

    it('should throw an error if the call to Entra ID errors', async () => {
      mockAcquireTokenByClientCredential.mockRejectedValue(new Error(CALL_ERROR))

      await expect(ActiveDirectoryAuthService.getTokenForDataverse()).rejects.toThrow(CALL_ERROR)
    })
  })

  describe('getTokenForAddressLookup', () => {
    it('should return a token for Address Lookup', async () => {
      const mockToken = 'mockAddressLookupToken'
      mockAcquireTokenByClientCredential.mockResolvedValue({ accessToken: mockToken })

      const token = await ActiveDirectoryAuthService.getTokenForAddressLookup()
      expect(token).toBe(mockToken)
      expect(mockAcquireTokenByClientCredential).toHaveBeenCalledWith({
        scopes: [config.addressLookupResource + '/.default']
      })
    })

    it('should throw an error if token is not obtained', async () => {
      mockAcquireTokenByClientCredential.mockResolvedValue({})

      await expect(ActiveDirectoryAuthService.getTokenForAddressLookup()).rejects.toThrow(MISSING_TOKEN_ERROR)
    })

    it('should throw an error if the call to Entra ID errors', async () => {
      mockAcquireTokenByClientCredential.mockRejectedValue(new Error(CALL_ERROR))

      await expect(ActiveDirectoryAuthService.getTokenForAddressLookup()).rejects.toThrow(CALL_ERROR)
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
