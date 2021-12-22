'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/odata.service')
const ODataService = require('../../server/services/odata.service')

const { RedisKeys } = require('../../server/utils/constants')

const elementIds = {
  pageTitle: 'pageTitle',
  alreadyCertified: 'alreadyCertified',
  alreadyCertified2: 'alreadyCertified-2',
  alreadyCertified3: 'alreadyCertified-3',
  certificateNumber: 'certificateNumber',
  unknownCertificateNumber: 'unknownCertificateNumber',
  para1: 'para1',
  para2: 'para2',
  para3: 'para3',
  continue: 'continue'
}

describe('/already-certified route', () => {
  let server
  const url = '/already-certified'
  const nextUrlCanContinue = '/can-continue'
  const nextUrlRevokedCertificate = '/revoked-certificate'
  const nextUrlAppliedBefore = '/applied-before'

  let document

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockResolvedValueOnce({
        alreadyCertified: 'Yes',
        certificateNumber
      })

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector(
        `#${elementIds.pageTitle} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Does the item already have an exemption certificate?'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.alreadyCertified,
        'Yes',
        'Yes',
        true
      )

      TestHelper.checkFormField(
        document,
        elementIds.certificateNumber,
        'Enter certificate number',
        "For example, '10AB010C'",
        certificateNumber
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.alreadyCertified2,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.alreadyCertified3,
        'It used to',
        'It used to',
        false,
        "The certificate has been cancelled or 'revoked'"
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector(
        `#${elementIds.unknownCertificateNumber} .govuk-details__summary-text`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        "It does but I don't have the certificate or certificate number"
      )
    })

    it('should have the correct summary text details', () => {
      let element = document.querySelector(
        `#${elementIds.unknownCertificateNumber} .govuk-details__text > #${elementIds.para1}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You can find the certificate number towards the top of the digital certificate we emailed the owner when their application was successful.'
      )

      element = document.querySelector(
        `#${elementIds.unknownCertificateNumber} .govuk-details__text > #${elementIds.para2}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you bought the item, the previous owner should have given you the certificate as part of the transaction. You may have received this by email.'
      )

      element = document.querySelector(
        `#${elementIds.unknownCertificateNumber} .govuk-details__text > #${elementIds.para3}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Without this number, you may have to make a new application for your item. Before doing so, you can contact the Animal Health and Plant Agency (APHA) at IvoryAct@apha.gov.uk with the contact details of the previous owner and a description of the item. With this information, APHA may be able to locate the certificate and send you a copy. You can then continue with notifying us that you intend to sell your certified item.'
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.continue}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Continue')
    })
  })

  describe('POST', () => {
    let postOptions

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValueOnce(null)
      })

      it('should store the value in Redis and progress to the next route when the first option has been selected & valid certificate number entered', async () => {
        ODataService.getRecordsWithCertificateNumber = jest
          .fn()
          .mockResolvedValue([{ cre2c_certificatenumber: certificateNumber }])

        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'Yes',
          nextUrlCanContinue,
          certificateNumber,
          {
            cre2c_certificatenumber: 'ABC_123'
          }
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'No',
          nextUrlAppliedBefore
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It used to',
          nextUrlRevokedCertificate
        )
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(null)
      })

      it('should display a validation error message if the user does not check an option', async () => {
        postOptions.payload = {
          alreadyCertified: ''
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'alreadyCertified',
          'alreadyCertified-error',
          'Tell us if the item already has an exemption certificate'
        )
      })

      it('should display a validation error message if the user selects "Yes" and leaves the certificate number field empty', async () => {
        postOptions.payload = {
          alreadyCertified: 'Yes',
          certificateNumber: ''
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'certificateNumber',
          'certificateNumber-error',
          'Enter the certificate number'
        )
      })

      it('should display a validation error message if the other text area > 10 chars', async () => {
        postOptions.payload = {
          alreadyCertified: 'Yes',
          certificateNumber: 'XXXXXXXXXXX'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'certificateNumber',
          'certificateNumber-error',
          'Enter no more than 10 characters'
        )
      })

      it('should display a validation error message if the certificate number does not exist', async () => {
        ODataService.getRecordsWithCertificateNumber = jest
          .fn()
          .mockResolvedValue(false)

        postOptions.payload = {
          alreadyCertified: 'Yes',
          certificateNumber: 'XXXXXXXXXX'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'certificateNumber',
          'certificateNumber-error',
          'Invalid certificate number'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}

const certificateNumber = 'ABC_123'

const _checkSelectedCheckboxAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  certificateNumber,
  existingRecord = null
) => {
  postOptions.payload.alreadyCertified = selectedOption
  postOptions.payload.certificateNumber = certificateNumber

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  const expectedRedisValue = {}
  expectedRedisValue.alreadyCertified = selectedOption

  if (certificateNumber) {
    expectedRedisValue.certificateNumber = certificateNumber
  }

  expect(RedisService.set).toBeCalledTimes(2)

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.ALREADY_CERTIFIED,
    JSON.stringify(expectedRedisValue)
  )

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.ALREADY_CERTIFIED_EXISTING_RECORD,
    JSON.stringify(existingRecord)
  )

  expect(RedisService.delete).toBeCalledTimes(3)

  expect(RedisService.delete).toBeCalledWith(
    expect.any(Object),
    RedisKeys.REVOKED_CERTIFICATE
  )

  expect(RedisService.delete).toBeCalledWith(
    expect.any(Object),
    RedisKeys.APPLIED_BEFORE
  )

  expect(RedisService.delete).toBeCalledWith(
    expect.any(Object),
    RedisKeys.PREVIOUS_APPLICATION_NUMBER
  )

  expect(response.headers.location).toEqual(nextUrl)
}
