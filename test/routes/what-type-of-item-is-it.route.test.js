'use strict'

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const TestHelper = require('../utils/test-helper')

describe('/what-type-of-item-is-it route', () => {
  let server
  const url = '/what-type-of-item-is-it'
  const nextUrl = '/can-continue'
  const nextUrlAlreadyCertified = '/already-certified'

  const elementIds = {
    pageTitle: 'pageTitle',
    introPara: 'introPara',
    whatTypeOfItemIsIt: 'whatTypeOfItemIsIt',
    whatTypeOfItemIsIt2: 'whatTypeOfItemIsIt-2',
    whatTypeOfItemIsIt3: 'whatTypeOfItemIsIt-3',
    whatTypeOfItemIsIt4: 'whatTypeOfItemIsIt-4',
    whatTypeOfItemIsIt5: 'whatTypeOfItemIsIt-5',
    eligibilityChecker: 'eligibilityChecker',
    needMoreHelp: 'needMoreHelp',
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
      const element = document.querySelector(
        `#${elementIds.pageTitle} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'What is your ivory item?'
      )
    })

    it('should have the correct introPara', () => {
      const element = document.querySelector(`#${elementIds.introPara}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Unless your item is to be sold or hired out to a qualifying museum, any replacement ivory must have been taken from an elephant before 1975 and added only for the purpose of restoring the item.'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.whatTypeOfItemIsIt,
        'Musical instrument made before 1975 with less than 20% ivory',
        'Musical instrument made before 1975 with less than 20% ivory',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatTypeOfItemIsIt2,
        'Item made before 3 March 1947 with less than 10% ivory',
        'Item made before 3 March 1947 with less than 10% ivory',
        false,
        'The ivory must be integral to the item.'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatTypeOfItemIsIt3,
        'Portrait miniature made before 1918 with a surface area of no more than 320 square centimetres',
        'Portrait miniature made before 1918 with a surface area of no more than 320 square centimetres',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatTypeOfItemIsIt4,
        'Item to be sold or hired out to a qualifying museum',
        'Item to be sold or hired out to a qualifying museum',
        false,
        'This cannot be raw (‘unworked’) ivory. You don’t need to tell us if you are a qualifying museum that’s selling or hiring out an ivory item to another qualifying museum.'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatTypeOfItemIsIt5,
        'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
        'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
        false,
        ''
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector(
        `#${elementIds.needMoreHelp} .govuk-details__summary-text`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'I need more help to work this out'
      )
    })

    it('should have the correct summary text details', () => {
      const element = document.querySelector(
        `#${elementIds.needMoreHelp} .govuk-details__text`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Use our eligibility checker to check if you can sell or hire out your item.'
      )
    })

    it('should have the correct summary text link', () => {
      const element = document.querySelector(
        `#${elementIds.eligibilityChecker}`
      )
      TestHelper.checkLink(
        element,
        'check if you can sell or hire out your item',
        '/eligibility-checker/contain-elephant-ivory'
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
          'Musical instrument made before 1975 with less than 20% ivory',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Item made before 3 March 1947 with less than 10% ivory',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Portrait miniature made before 1918 with a surface area of no more than 320 square centimetres',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Item to be sold or hired out to a qualifying museum',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the fifth option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
          nextUrlAlreadyCertified
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.whatTypeOfItemIsIt = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whatTypeOfItemIsIt',
          'whatTypeOfItemIsIt-error',
          'Tell us what type of ivory you want to sell or hire out'
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
  const redisKeyTypeOfItem = 'what-type-of-item-is-it'
  postOptions.payload.whatTypeOfItemIsIt = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKeyTypeOfItem,
    selectedOption
  )

  expect(response.headers.location).toEqual(nextUrl)
}
