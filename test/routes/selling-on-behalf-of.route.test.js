'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const other = 'Other'

describe('/selling-on-behalf-of route', () => {
  let server
  const url = '/selling-on-behalf-of'
  const nextUrl = '/ivory-age'

  const elementIds = {
    pageTitle: 'pageTitle',
    sellingOnBehalfOf: 'sellingOnBehalfOf',
    sellingOnBehalfOf2: 'sellingOnBehalfOf-2',
    sellingOnBehalfOf3: 'sellingOnBehalfOf-3',
    sellingOnBehalfOf4: 'sellingOnBehalfOf-4',
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

    describe('GET: Work for a business', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('Yes')

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
          'Who are you selling or hiring out the item on behalf of?'
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
          elementIds.sellingOnBehalfOf,
          'The business I work for',
          'The business I work for'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.sellingOnBehalfOf2,
          'An individual',
          'An individual'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.sellingOnBehalfOf3,
          'Another business',
          'Another business'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.sellingOnBehalfOf4,
          'Other',
          'Other'
        )
      })
    })

    describe('GET: Does not work for a business', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('No')

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
          'Who are you selling or hiring out the item on behalf of?'
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
          elementIds.sellingOnBehalfOf,
          'A friend or relative',
          'A friend or relative'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.sellingOnBehalfOf2,
          'A business',
          'A business'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.sellingOnBehalfOf3,
          'Other',
          'Other'
        )
      })
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
        RedisService.get = jest.fn().mockResolvedValue('Yes')
      })

      it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'It’s clear from looking at it',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'I measured it',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'I have written verification from a relevant expert',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected & Other text added', async () => {
        postOptions.payload.otherCapacity = 'some text'
        await _checkSelectedRadioAction(
          postOptions,
          server,
          other,
          nextUrl,
          'some text'
        )
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('Yes')
      })

      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.sellingOnBehalfOf = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'sellingOnBehalfOf',
          'sellingOnBehalfOf-error',
          'Tell us who you are selling or hiring out the item on behalf of'
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
  nextUrl,
  otherCapacity = ''
) => {
  const redisKey = 'selling-on-behalf-of'
  postOptions.payload.sellingOnBehalfOf = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  const expectedRedisValue = {}
  if (otherCapacity) {
    expectedRedisValue.otherCapacity = otherCapacity
  }
  expectedRedisValue.sellingOnBehalfOf = selectedOption

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    JSON.stringify(expectedRedisValue)
  )

  expect(response.headers.location).toEqual(nextUrl)
}
