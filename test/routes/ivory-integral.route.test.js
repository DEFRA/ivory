'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/cookie.service')
jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/ivory-integral route', () => {
  let server
  const url = '/ivory-integral'
  const nextUrl = '/ivory-age'

  const elementIds = {
    ivoryIsIntegral: 'ivoryIsIntegral',
    ivoryIsIntegral2: 'ivoryIsIntegral-2',
    ivoryIsIntegral3: 'ivoryIsIntegral-3',
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
        'How is the ivory integral to the item?'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.ivoryIsIntegral,
        'The ivory is essential to the design or function of the item',
        'The ivory is essential to the design or function of the item'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.ivoryIsIntegral2,
        'You cannot remove the ivory easily or without damaging the item',
        'You cannot remove the ivory easily or without damaging the item'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.ivoryIsIntegral3,
        'Both of the above',
        'Both of the above'
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
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'The ivory is essential to the design or function of the item',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'You cannot remove the ivory easily or without damaging the item',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Both of the above',
          nextUrl
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.ivoryIsIntegral = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'ivoryIsIntegral',
          'ivoryIsIntegral-error',
          'You must tell us how the ivory is integral to the item'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl
) => {
  const redisKey = 'ivory-integral'
  postOptions.payload.ivoryIsIntegral = selectedOption

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
