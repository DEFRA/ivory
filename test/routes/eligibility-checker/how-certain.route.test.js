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
  const nextUrlWhatSpeciesExpert = '/eligibility-checker/selling-to-museum'
  const nextUrlWhatSpecies = '/eligibility-checker/selling-to-museum'

  const elementIds = {
    help1: 'help1',
    help2: 'help2',
    howCertain: 'howCertain',
    howCertain2: 'howCertain-2',
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
        'Do you know which exemption you want to register or apply for?'
      )
    })

    it('should have the correct help text 1', () => {
      const element = document.querySelector(`#${elementIds.help1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you know the exemption you need you can continue to either:'
      )
    })

    it('should have the correct help text 2', () => {
      const element = document.querySelector(`#${elementIds.help2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you’re not sure which exemption you need, you can answer a series of questions to help you find out.'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.howCertain,
        'Yes, I know which exemption I need',
        'Yes, I know which exemption I need'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.howCertain2,
        'I need help to find out',
        'I need help to find out'
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
          nextUrlWhatSpecies,
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
        TestHelper.checkValidationError(
          response,
          'howCertain',
          'howCertain-error',
          'Tell us how certain you are that your item will qualify for exemption from the ban on dealing in ivory'
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

  expect(response.headers.location).toEqual(nextUrl)
}
