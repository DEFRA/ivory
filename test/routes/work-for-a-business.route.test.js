'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const { ItemType, RedisKeys, Options } = require('../../server/utils/constants')

describe('/work-for-a-business route', () => {
  let server
  const url = '/work-for-a-business'
  const nextUrl = '/selling-on-behalf-of'

  const elementIds = {
    pageTitle: 'pageTitle',
    workForABusiness: 'workForABusiness',
    workForABusiness2: 'workForABusiness-2',
    continue: 'continue'
  }

  let document

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
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
      _createMocks()

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.workForABusiness,
        'Yes',
        'As a business',
        true
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.workForABusiness2,
        'No',
        'As an individual',
        false
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.continue}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Continue')
    })
  })

  describe('GET: Dynamic content', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    it('should have the correct page heading - Section 2', async () => {
      _createMocks(ItemType.HIGH_VALUE)
      document = await TestHelper.submitGetRequest(server, getOptions)

      const element = document.querySelector(
        `#${elementIds.pageTitle} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'In what capacity are you completing this application?'
      )
    })

    it('should have the correct page heading - Section 10', async () => {
      _createMocks(ItemType.MUSICAL)
      document = await TestHelper.submitGetRequest(server, getOptions)

      const element = document.querySelector(
        `#${elementIds.pageTitle} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'In what capacity are you completing this registration?'
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
      beforeEach(() => {
        _createMocks()
      })

      it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'Yes', nextUrl)
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'No', nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item - Section 2', async () => {
        _createMocks(ItemType.HIGH_VALUE)

        postOptions.payload.workForABusiness = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'workForABusiness',
          'workForABusiness-error',
          'Tell us in what capacity you are completing this application'
        )
      })

      it('should display a validation error message if the user does not select an item - Section 10', async () => {
        _createMocks()

        postOptions.payload.workForABusiness = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'workForABusiness',
          'workForABusiness-error',
          'Tell us in what capacity you are completing this registration'
        )
      })
    })
  })
})

const _createMocks = (itemType = ItemType.MUSEUM) => {
  TestHelper.createMocks()

  const mockData = {
    [RedisKeys.WORK_FOR_A_BUSINESS]: true,
    [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType
  }

  RedisService.get = jest.fn((request, redisKey) => {
    return mockData[redisKey]
  })
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl
) => {
  const redisKey = 'work-for-a-business'
  postOptions.payload.workForABusiness = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    selectedOption === Options.YES
  )

  expect(response.headers.location).toEqual(nextUrl)
}
