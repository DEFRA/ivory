'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../utils/test-helper.js';

jest.mock('./server/services/redis.service.js')
import RedisService from '../../server/services/redis.service.js';

describe('/revoked-certificate route', () => {
  let server
  const url = '/revoked-certificate'
  const nextUrl = '/can-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    revokedCertificateNumber: 'revokedCertificateNumber',
    dontHaveCertificateNumber: 'dontHaveCertificateNumber',
    para1: 'para1',
    para2: 'para2',
    continue: 'continue'
  }

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
      RedisService.get = jest.fn().mockResolvedValue(revokedCertificateNumber)

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        "Enter the certificate number from the cancelled or 'revoked' certificate"
      )
    })

    it('should have the correct form field', () => {
      TestHelper.checkFormField(
        document,
        elementIds.revokedCertificateNumber,
        "Enter the certificate number from the cancelled or 'revoked' certificate",
        "For example, '10AB010C'",
        revokedCertificateNumber
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector(
        `#${elementIds.dontHaveCertificateNumber} .govuk-details__summary-text`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        "I don't have the certificate or certificate number"
      )
    })

    it('should have the correct summary text details', () => {
      let element = document.querySelector(
        `#${elementIds.dontHaveCertificateNumber} .govuk-details__text > #${elementIds.para1}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        "You can find the certificate number towards the top of the digital certificate we emailed the owner when their original application was successful. You'll also be able to find it referenced in any emails or letters from when the certificate was revoked."
      )

      element = document.querySelector(
        `#${elementIds.dontHaveCertificateNumber} .govuk-details__text > #${elementIds.para2}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you bought the item, the previous owner should have given you the certificate as part of the transaction. You may have received this by email.'
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
      it('should store the value in Redis and progress to the next route', async () => {
        const revokedCertificateNumber = '0123456789'
        postOptions.payload.revokedCertificateNumber = revokedCertificateNumber

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          'revoked-certificate',
          revokedCertificateNumber
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not enter the revoked certificate number', async () => {
        postOptions.payload.revokedCertificateNumber = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'revokedCertificateNumber',
          'revokedCertificateNumber-error',
          'Enter the certificate number from the revoked certificate'
        )
      })

      it('should display a validation error message if the other text area > 4000 chars', async () => {
        postOptions.payload.revokedCertificateNumber = 'XXXXXXXXXXX'

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'revokedCertificateNumber',
          'revokedCertificateNumber-error',
          'The certificate number should be 10 characters long'
        )
      })
    })
  })
})

const revokedCertificateNumber = 'ABC123'

const _createMocks = () => {
  TestHelper.createMocks()

  RedisService.get = jest.fn()
}
