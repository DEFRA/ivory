'use strict'

const nock = require('nock')
const config = require('../../server/utils/config')

jest.mock('../../server/services/active-directory-auth.service')
const ActiveDirectoryAuthService = require('../../server/services/active-directory-auth.service')

const ODataService = require('../../server/services/odata.service')
const { DownloadReason } = require('../../server/utils/constants')

describe('OData service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  describe('createRecord method', () => {
    it('should create a Section 2 record in the Dataverse and return the new record ID', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      nock(`${config.dataverseResource}`)
        .post(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$select=cre2c_ivorysection2caseid`)
        .reply(201, JSON.stringify(mockSection2Entity))

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

      nock(`${config.dataverseResource}`)
        .post(`/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases?$select=cre2c_ivorysection10caseid`)
        .reply(201, JSON.stringify(mockSection10Entity))

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const entity = await ODataService.createRecord(body, false)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)

      expect(entity).toEqual({
        cre2c_ivorysection10caseid:
          mockSection10Entity.cre2c_ivorysection10caseid
      })
    })

    it('should throw an error if creating a Section 2 record fails', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      nock(`${config.dataverseResource}`)
        .post(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$select=cre2c_ivorysection2caseid`)
        .reply(400, { error: 'Bad Request' })

      await expect(ODataService.createRecord(body, true)).rejects.toThrow('Error creating Dataverse record')
    })

    it('should throw an error if creating a Section 10 record fails', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      nock(`${config.dataverseResource}`)
        .post(`/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases?$select=cre2c_ivorysection10caseid`)
        .reply(400, { error: 'Bad Request' })

      await expect(ODataService.createRecord(body, false)).rejects.toThrow('Error creating Dataverse record')
    })
  })

  describe('updateRecord method', () => {
    it('should update a Section 2 record', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})`)
        .reply(204)

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

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases(${mockSection10Entity.cre2c_ivorysection10caseid})`)
        .reply(204)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      await ODataService.updateRecord(
        mockSection10Entity.cre2c_ivorysection10caseid,
        body,
        false
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
    })

    it('should throw an error if updating a Section 2 record fails', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})`)
        .reply(400, { error: 'Bad Request' })

      await expect(ODataService.updateRecord(mockSection2Entity.cre2c_ivorysection2caseid, body, true)).rejects.toThrow('Error updating record')
    })

    it('should throw an error if updating a Section 10 record fails', async () => {
      const body = {
        key1: 'value 1',
        key2: 'value 2',
        key3: 'value 3'
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases(${mockSection10Entity.cre2c_ivorysection10caseid})`)
        .reply(400, { error: 'Bad Request' })

      await expect(ODataService.updateRecord(mockSection10Entity.cre2c_ivorysection10caseid, body, false)).rejects.toThrow('Error updating record')
    })
  })

  describe('updatePhotos method', () => {
    it('should add photos to a Section 2 record', async () => {
      const photoRecords = {
        files: ['ivory1.jpg', 'ivory2.jpg'],
        fileSizes: [100, 200],
        fileData: [Buffer.from([]), Buffer.from([])]
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})/cre2c_photo1`)
        .reply(204)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})/cre2c_photo2`)
        .reply(204)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      await ODataService.updatePhotos(true, mockSection2Entity, photoRecords)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
    })

    it('should add photos to a Section 10 record', async () => {
      const photoRecords = {
        files: ['ivory1.jpg', 'ivory2.jpg'],
        fileSizes: [100, 200],
        fileData: [Buffer.from([]), Buffer.from([])]
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases(${mockSection10Entity.cre2c_ivorysection10caseid})/cre2c_photo1`)
        .reply(204)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection10cases(${mockSection10Entity.cre2c_ivorysection10caseid})/cre2c_photo2`)
        .reply(204)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      await ODataService.updatePhotos(false, mockSection10Entity, photoRecords)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
    })

    it('should continue, not throw an error if adding photos fails', async () => {
      const photoRecords = {
        files: ['ivory1.jpg', 'ivory2.jpg'],
        fileSizes: [100, 200],
        fileData: [Buffer.from([]), Buffer.from([])]
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})/cre2c_photo1`)
        .reply(400, { error: 'Bad Request' })
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${mockSection2Entity.cre2c_ivorysection2caseid})/cre2c_photo2`)
        .reply(200)

      await expect(ODataService.updatePhotos(true, mockSection2Entity, photoRecords)).resolves.not.toThrow()
    })
  })

  describe('updateRecordAttachments method', () => {
    it('should add file attachments to a Section 2 record', async () => {
      const id = mockSection2Entity.cre2c_ivorysection2caseid

      const supportingInformation = {
        files: ['document1.pdf', 'document2.pdf'],
        fileSizes: [100, 200],
        fileData: [Buffer.from([]), Buffer.from([])]
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${id})/cre2c_supportingevidence1`)
        .reply(204)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${id})/cre2c_supportingevidence2`)
        .reply(204)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      await ODataService.updateRecordAttachments(id, supportingInformation)

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
    })

    it('should continue, not throw an error if adding file attachments fails', async () => {
      const id = mockSection2Entity.cre2c_ivorysection2caseid

      const supportingInformation = {
        files: ['document1.pdf', 'document2.pdf', 'document2.pdf'],
        fileSizes: [100, 200, 300],
        fileData: [Buffer.from([]), Buffer.from([]), Buffer.from([])]
      }

      nock(`${config.dataverseResource}`)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${id})/cre2c_supportingevidence1`)
        .reply(200)
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${id})/cre2c_supportingevidence2`)
        .reply(400, { error: 'Bad Request' })
        .patch(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(${id})/cre2c_supportingevidence3`)
        .reply(200)

      await expect(ODataService.updateRecordAttachments(id, supportingInformation)).resolves.not.toThrow()
    })
  })

  describe('getRecord method', () => {
    it('should get a Section 2 record if the key is correct', async () => {
      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(___RECORD_ID_VALID_KEY___)`)
        .reply(200, {
          cre2c_ivorysection2caseid: '___RECORD_ID_VALID_KEY___',
          cre2c_certificatenumber: 'ABC-123',
          cre2c_certificatekey: '___VALID_KEY___'
        })

      const result = await ODataService.getRecord(
        '___RECORD_ID_VALID_KEY___',
        '___VALID_KEY___',
        DownloadReason.SEND_DATA_TO_PI,
        true
      )

      expect(result).toEqual({
        cre2c_ivorysection2caseid: '___RECORD_ID_VALID_KEY___',
        cre2c_certificatenumber: 'ABC-123',
        cre2c_certificatekey: '___VALID_KEY___'
      })
    })

    it('should NOT get a Section 2 record if the key is incorrect', async () => {
      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(___RECORD_ID_INVALID_KEY___)`)
        .reply(200, {
          cre2c_ivorysection2caseid: '___RECORD_ID_INVALID_KEY___',
          cre2c_certificatenumber: 'ABC-123',
          cre2c_certificatekey: '___SOME_OTHER_KEY___'
        })

      const result = await ODataService.getRecord(
        '___RECORD_ID_INVALID_KEY___',
        '___INVALID_KEY___',
        DownloadReason.GENERATE_CERTIFICATE,
        true
      )

      expect(result).toBeNull()
    })

    it('should NOT get a Section 2 record if the link is expired', async () => {
      const expiredEntity = {
        cre2c_ivorysection2caseid: '___RECORD_ID_VALID_KEY___',
        cre2c_certificatenumber: 'ABC-123',
        cre2c_certificatekey: '___VALID_KEY___',
        cre2c_pilinkexpiry: '2020-01-01T00:00:00Z'
      }

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(___RECORD_ID_VALID_KEY___)`)
        .reply(200, expiredEntity)

      const result = await ODataService.getRecord(
        '___RECORD_ID_VALID_KEY___',
        '___VALID_KEY___',
        DownloadReason.SEND_DATA_TO_PI,
        true
      )

      expect(result).toBeNull()
    })
  })

  describe('getImage method', () => {
    it('should get a Section 2 image', async () => {
      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(___RECORD_ID_VALID_KEY___)/cre2c_photo1/$value?size=full`)
        .reply(200, '___THE_IMAGE___')

      const result = await ODataService.getImage(
        '___RECORD_ID_VALID_KEY___',
        'cre2c_photo1'
      )

      expect(Buffer.isBuffer(result)).toBeTruthy()
    })
  })

  describe('getDocument method', () => {
    it('should get a Section 2 document', async () => {
      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases(___RECORD_ID_VALID_KEY___)/cre2c_supportingevidence1/$value`)
        .reply(200, '___THE_DOCUMENT___')

      const result = await ODataService.getDocument(
        '___RECORD_ID_VALID_KEY___',
        'cre2c_supportingevidence1'
      )

      expect(Buffer.isBuffer(result)).toBeTruthy()
    })
  })

  describe('getRecordsWithCertificateNumber method', () => {
    it('should return a record if the certificate number is found', async () => {
      const certificateNumber = 'ABC-123'

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq 'ABC-123'`)
        .reply(200, { value: [{ cre2c_certificatenumber: 'ABC-123' }] })

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const result = await ODataService.getRecordsWithCertificateNumber(
        certificateNumber
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      expect(result.length).toEqual(1)
      expect(result[0]).toEqual({ cre2c_certificatenumber: 'ABC-123' })
    })

    it('should NOT return a record if the certificate number is NOT found', async () => {
      const certificateNumber = 'ABC-XXX'

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq 'ABC-XXX'`)
        .reply(200, { value: [] })

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const result = await ODataService.getRecordsWithCertificateNumber(
        certificateNumber
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      expect(result.length).toEqual(0)
      expect(result).toEqual([])
    })

    it('should replace unsafe character +', async () => {
      const certificateNumber = 'ABC-+'

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq 'ABC-%2B'`)
        .reply(200, { value: [{ cre2c_certificatenumber: 'ABC-%2B' }] })

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const result = await ODataService.getRecordsWithCertificateNumber(
        certificateNumber
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      expect(result.length).toEqual(1)
      expect(result[0]).toEqual({ cre2c_certificatenumber: 'ABC-%2B' })
    })
    it('should replace unsafe character #', async () => {
      const certificateNumber = 'ABC-#'

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq 'ABC-%23'`)
        .reply(200, { value: [{ cre2c_certificatenumber: 'ABC-%23' }] })

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const result = await ODataService.getRecordsWithCertificateNumber(
        certificateNumber
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      expect(result.length).toEqual(1)
      expect(result[0]).toEqual({ cre2c_certificatenumber: 'ABC-%23' })
    })
    it('should replace unsafe character |', async () => {
      const certificateNumber = 'ABC-|'

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq 'ABC-%7C'`)
        .reply(200, { value: [{ cre2c_certificatenumber: 'ABC-%7C' }] })

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const result = await ODataService.getRecordsWithCertificateNumber(
        certificateNumber
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      expect(result.length).toEqual(1)
      expect(result[0]).toEqual({ cre2c_certificatenumber: 'ABC-%7C' })
    })
    it('should replace null', async () => {
      const certificateNumber = null

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq ''`)
        .reply(200, { value: [{ cre2c_certificatenumber: '' }] })

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(0)

      const result = await ODataService.getRecordsWithCertificateNumber(
        certificateNumber
      )

      expect(ActiveDirectoryAuthService.getToken).toBeCalledTimes(1)
      expect(result.length).toEqual(1)
      expect(result[0]).toEqual({ cre2c_certificatenumber: '' })
    })

    it('should throw an error if the response status is not OK', async () => {
      const certificateNumber = 'ABC-123'

      nock(`${config.dataverseResource}`)
        .get(`/${config.dataverseApiEndpoint}/cre2c_ivorysection2cases?$filter=cre2c_certificatenumber eq 'ABC-123'`)
        .reply(500, { error: 'Internal Server Error' })

      await expect(ODataService.getRecordsWithCertificateNumber(certificateNumber)).rejects.toThrow('Error checking for certificate number')
    })
  })
})

const _createMocks = () => {
  ActiveDirectoryAuthService.getToken = jest.fn().mockResolvedValue('THE_TOKEN')
}

const mockSection2Entity = {
  cre2c_ivorysection2caseid: 'SECTION_2_CASE_ID'
}

const mockSection10Entity = {
  cre2c_ivorysection10caseid: 'SECTION_10_CASE_ID'
}
