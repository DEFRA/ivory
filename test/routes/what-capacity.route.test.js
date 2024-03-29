'use strict'

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/what-capacity route', () => {
  let server
  const url = '/what-capacity'
  const nextUrl = '/user-details/applicant/contact-details'

  const elementIds = {
    pageTitle: 'pageTitle',
    whatCapacity: 'whatCapacity',
    whatCapacity2: 'whatCapacity-2',
    whatCapacity3: 'whatCapacity-3',
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
      RedisService.get = jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(ItemType.MINIATURE)

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
        'For an item that has no owner, in what capacity are you making this declaration?'
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.continue}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Continue')
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.whatCapacity,
        'Executor or administrator',
        'Executor or administrator',
        false
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatCapacity2,
        'Trustee or similar',
        'Trustee or similar'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatCapacity3,
        'Agent or business acting on behalf of either of the above',
        'Agent or business acting on behalf of either of the above'
      )
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
      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Executor or administrator',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Trustee or similar',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Agent or business acting on behalf of either of the above',
          nextUrl
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.whatCapacity = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whatCapacity',
          'whatCapacity-error',
          'Tell us in what capacity you are making this declaration'
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
  const redisKey = 'what-capacity'
  postOptions.payload.whatCapacity = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  const expectedRedisValue = {}
  expectedRedisValue.whatCapacity = selectedOption

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    JSON.stringify(expectedRedisValue)
  )

  expect(response.headers.location).toEqual(nextUrl)
}
