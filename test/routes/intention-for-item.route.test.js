'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/intention-for-item route', () => {
  let server
  const url = '/intention-for-item'
  const nextUrl = '/check-your-answers'

  const elementIds = {
    intentionForItem: 'intentionForItem',
    intentionForItem2: 'intentionForItem-2',
    intentionForItem3: 'intentionForItem-3',
    continue: 'continue'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
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
        'What do you intend to do with the item?'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.intentionForItem,
        'Sell it',
        'Sell it'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.intentionForItem2,
        'Hire it out',
        'Hire it out'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.intentionForItem3,
        "I'm not sure yet",
        "I'm not sure yet"
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
      it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'Sell it', nextUrl)
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Hire it out',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          "I'm not sure yet",
          nextUrl
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.intentionForItem = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'intentionForItem',
          'intentionForItem-error',
          'You must tell us what you intend to do with the item'
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
  const redisKey = 'intention-for-item'
  postOptions.payload.intentionForItem = selectedOption

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
