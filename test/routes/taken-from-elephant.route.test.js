'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ServerEvents } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/taken-from-elephant route', () => {
  let server
  const url = '/taken-from-elephant'
  const nextUrl = '/check-your-answers'

  const elementIds = {
    yesNoIdk: 'yesNoIdk',
    yesNoIdk2: 'yesNoIdk-2',
    yesNoIdk3: 'yesNoIdk-3',
    yesNoIdkHint: 'yesNoIdk-hint',
    continue: 'continue'
  }

  let document

  beforeAll(async done => {
    server = await createServer()
    server.events.on(ServerEvents.PLUGINS_LOADED, () => {
      done()
    })
  })

  afterAll(() => {
    server.stop()
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

    it('should have the correct page title', () => {
      const element = document.querySelector('.govuk-fieldset__legend')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Was the replacement ivory taken from the elephant on or after 1 January 1975?'
      )
    })

    it('should NOT have hint text', () => {
      // const element = document.querySelector(`#${elementIds.yesNoIdkHint}`)
      // expect(element).toBeFalsy()
      const element = document.querySelector(`#${elementIds.yesNoIdkHint}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('')
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(document, elementIds.yesNoIdk, 'Yes', 'Yes')

      TestHelper.checkRadioOption(document, elementIds.yesNoIdk2, 'No', 'No')

      TestHelper.checkRadioOption(
        document,
        elementIds.yesNoIdk3,
        'I dont know',
        "I don't know"
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
      it('should store the value in Redis and progress to the next route when "No" has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'No', nextUrl)
      })
    })

    describe('Failure', () => {
      const VALIDATION_SUMMARY_HEADING = 'There is a problem'

      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.yesNoIdk = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'yesNoIdk',
          'yesNoIdk-error',
          VALIDATION_SUMMARY_HEADING,
          'You must tell us if the replacement ivory was taken from an elephant on or after 1 January 1975'
        )
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl
) => {
  const redisKey = 'ivory-added'
  postOptions.payload.yesNoIdk = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    selectedOption === 'No' ? 'yes-pre-1975' : ''
  )

  expect(response.headers.location).toEqual(nextUrl)
}
