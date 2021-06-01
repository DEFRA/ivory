'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const { ServerEvents } = require('../../server/utils/constants')

describe('/ivory-added route', () => {
  let server
  const url = '/ivory-added'
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

    it('should have the correct page heading', () => {
      const element = document.querySelector('.govuk-fieldset__legend')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Has any ivory been added to the item since 1 January 1975 to repair or restore it?'
      )
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
          'You must tell us if any ivory has been added to the item since 1 January 1975'
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
    selectedOption
  )

  expect(response.headers.location).toEqual(nextUrl)
}
