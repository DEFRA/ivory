'use strict'

jest.mock('randomstring')
const RandomString = require('randomstring')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const TestHelper = require('../../utils/test-helper')
const { RedisKeys } = require('../../../server/utils/constants')

describe('/eligibility-checker/how-certain route', () => {
  let server
  const url = '/eligibility-checker/how-certain'
  const nextUrlWhatSpeciesExpert = '/what-species-expert'
  const nextUrlContainElephantIvory =
    '/eligibility-checker/contain-elephant-ivory'

  const elementIds = {
    help1: 'help1',
    help2: 'help2',
    howCertain: 'howCertain',
    howCertain2: 'howCertain-2',
    continue: 'continue'
  }
  const serviceName = 'Declare ivory you intend to sell or hire out'

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
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector('.govuk-fieldset__legend')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'How certain are you that your item will qualify for exemption from the ban on dealing in ivory?'
      )
    })

    it('should have the correct cookie banner heading', () => {
      const element = document.querySelector('.govuk-cookie-banner__heading')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        `Cookies on ${serviceName}`
      )
    })

    it('should have the correct help text 1', () => {
      const element = document.querySelector(`#${elementIds.help1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'To use this service, you must be completely certain.'
      )
    })

    it('should have the correct help text 2', () => {
      const element = document.querySelector(`#${elementIds.help2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you’re still unsure, we can help you decide.'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.howCertain,
        'Completely',
        'Completely'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.howCertain2,
        'I’d like some help to work this out',
        'I’d like some help to work this out'
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
      it('should progress to the correct route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Completely',
          nextUrlWhatSpeciesExpert,
          false
        )
      })

      it('should progress to the correct route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'I’d like some help to work this out',
          nextUrlContainElephantIvory,
          true
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.howCertain = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'howCertain',
          'howCertain-error',
          'Tell us how certain you are that your item will qualify for exemption from the ban on dealing in ivory?'
        )
      })
    })
  })
})

const submissionReference = 'ABCDEF'

const _createMocks = () => {
  TestHelper.createMocks()

  RandomString.generate = jest.fn().mockReturnValue(submissionReference)
  RedisService.get = jest.fn()
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  expectedRedisValue
) => {
  postOptions.payload.howCertain = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(2)

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.SUBMISSION_REFERENCE,
    submissionReference
  )

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    'used-checker',
    expectedRedisValue
  )

  expect(response.headers.location).toEqual(nextUrl)
}
