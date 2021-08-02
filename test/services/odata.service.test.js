'use strict'

const nock = require('nock')
const config = require('../../server/utils/config')

jest.mock('../../server/services/active-directory-auth.service')
const ActiveDirectoryAuthService = require('../../server/services/active-directory-auth.service')

const ODataService = require('../../server/services/odata.service')

describe('OData service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createRecord method', () => {
    it('should create a Section 2 record in the Dataverse and return the new record ID', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const entity = await ODataService.createRecord(body, true)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)

      expect(entity).toEqual({
        cre2c_ivorysection2caseid: mockSection2Entity.cre2c_ivorysection2caseid
      })
    })

    it('should create a Section 10 record in the Dataverse and return the new record ID', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const entity = await ODataService.createRecord(body, false)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)

      expect(entity).toEqual({
        cre2c_ivorysection10caseid:
          mockSection10Entity.cre2c_ivorysection10caseid
      })
    })
  })

  describe('updateRecord method', () => {
    it('should update a Section 2 record', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      await ODataService.updateRecord(
        mockSection2Entity.cre2c_ivorysection2caseid,
        body,
        true
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
    })

    it('should update a Section 10 record', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      await ODataService.updateRecord(
        mockSection10Entity.cre2c_ivorysection10caseid,
        body,
        false
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
    })
  })
})

const _createMocks = () => {
  ActiveDirectoryAuthService.getToken = jest.fn().mockResolvedValue('THE_TOKEN')

  nock(`${config.dataverseResource}`)
    .post(
      `/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$select=cre2c_ivorysection2caseid`
    )
    .reply(201, JSON.stringify(mockSection2Entity))
    .post(
      `/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases?$select=cre2c_ivorysection10caseid`
    )
    .reply(201, JSON.stringify(mockSection10Entity))
    .patch(
      `/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})`
    )
    .reply(204)
    .patch(
      `/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases(${mockSection10Entity.cre2c_ivorysection10caseid})`
    )
    .reply(204)
}

const mockSection2Entity = {
  cre2c_ivorysection2caseid: 'SECTION_2_CASE_ID'
}

const mockSection10Entity = {
  cre2c_ivorysection10caseid: 'SECTION_10_CASE_ID'
}
