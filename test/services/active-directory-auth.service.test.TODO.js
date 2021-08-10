'use strict'

// const nock = require('nock')
// const config = require('../../server/utils/config')

jest.mock('adal-node')
// const AdalNode = require('adal-node')

const ActiveDirectorAuthService = require('../../server/services/active-directory-auth.service')

describe('ActiveDirectorAuth service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getToken method', () => {
    it('should get an auth token', async () => {
      const response = await ActiveDirectorAuthService.getToken()

      console.log(response)
      // const body = {
      //   key1: 'value 1',
      //   key2: 'value 2',
      //   key3: 'value 3'
      // }
      // expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)
      // const entity = await ODataService.createRecord(body, true)
      // expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      // expect(entity).toEqual({
      //   cre2c_ivorysection2caseid: mockSection2Entity.cre2c_ivorysection2caseid
      // })
    })
  })
})

const _createMocks = () => {
  // const AuthenticationContext = AdalNode.AuthenticationContext
  // const context = new AuthenticationContext(authorityUrl)
  // context.acquireTokenWithClientCredentials(
}
