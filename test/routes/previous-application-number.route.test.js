'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/previous-application-number route', () => {
  let server
  const url = '/previous-application-number'
  const nextUrl = '/can-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    previousApplicationNumber: 'previousApplicationNumber',
    dontHaveSubmissionReference: 'dontHaveSubmissionReference',
    helpText: 'helpText',
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
      RedisService.get = jest.fn().mockResolvedValue(previousApplicationNumber)

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
        'Enter the submission reference for the previous application'
      )
    })

    it('should have the correct form field', () => {
      TestHelper.checkFormField(
        document,
        elementIds.previousApplicationNumber,
        '',
        "For example, 'RMI-12345678'",
        previousApplicationNumber
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'This is a 10 digit number you can find on any of the emails related to the application.'
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector(
        `#${elementIds.dontHaveSubmissionReference} .govuk-details__summary-text`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        "I don't have the submission reference"
      )
    })

    it('should have the correct summary text details', () => {
      let element = document.querySelector(
        `#${elementIds.dontHaveSubmissionReference} .govuk-details__text > #${elementIds.para1}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You must provide the submission reference for the previous application so that we can process your new application.'
      )

      element = document.querySelector(
        `#${elementIds.dontHaveSubmissionReference} .govuk-details__text > #${elementIds.para2}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'We aim to send all new applications to a different expert for a fresh opinion.'
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
        const previousApplicationNumber = '0123456789'
        postOptions.payload.previousApplicationNumber = previousApplicationNumber

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          'previous-application-number',
          previousApplicationNumber
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not enter the previous application number', async () => {
        postOptions.payload.previousApplicationNumber = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'previousApplicationNumber',
          'previousApplicationNumber-error',
          'Enter the application number for the previous application'
        )
      })

      it('should display a validation error message if the other text area > 4000 chars', async () => {
        postOptions.payload.previousApplicationNumber = 'XXXXXXXXXXX'

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'previousApplicationNumber',
          'previousApplicationNumber-error',
          'The application number should be 10 characters long'
        )
      })
    })
  })
})

const previousApplicationNumber = 'ABC123'

const _createMocks = () => {
  TestHelper.createMocks()

  RedisService.get = jest.fn()
}
