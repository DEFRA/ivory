'use strict'

const TestHelper = require('../utils/test-helper')

const RedisService = require('../../server/services/redis.service')

describe('/who-owns-the-item route', () => {
  let server
  const url = '/who-owns-the-item'
  const nextUrl = '/user-details/owner/contact-details'

  const elementIds = {
    ivoryIsIntegral: 'whoOwnsItem',
    ivoryIsIntegral2: 'whoOwnsItem-2',
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
      expect(TestHelper.getTextContent(element)).toEqual('Who owns the item?')
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.ivoryIsIntegral,
        'I own it',
        'I own it'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.ivoryIsIntegral2,
        'Someone else owns it',
        'Someone else owns it'
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
          'I own it',
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
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.whoOwnsItem = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whoOwnsItem',
          'whoOwnsItem-error',
          'Tell us who owns the item'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  RedisService.get = jest.fn()
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl
) => {
  const redisKey = 'owned-by-applicant'
  postOptions.payload.whoOwnsItem = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    selectedOption === 'I own it' ? 'Yes' : 'No'
  )

  expect(response.headers.location).toEqual(nextUrl)
}
