'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const { RedisKeys } = require('../../server/utils/constants')

describe('/selling-on-behalf-of route', () => {
  let server
  const url = '/selling-on-behalf-of'
  const nextUrlYourDetails = '/user-details/applicant/contact-details'
  const nextUrlOwnerDetails = '/user-details/owner/contact-details'
  const nextUrlWhatCapacity = '/what-capacity'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    describe('GET: Work for a business - Section 10', () => {
      beforeEach(async () => {
        _createMocks(true)

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
          'Who is the owner of the item?'
        )
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You should only select ‘other’ if there is no owner for the item. For example the item is part of a deceased’s estate.'
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

    describe('GET: Work for a business - Section 2', () => {
      beforeEach(async () => {
        _createMocks(true, true)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Who is the owner of the item?'
        )
      })
    })

    describe('GET: Does not work for a business - Section 10', () => {
      beforeEach(async () => {
        _createMocks(false)

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
          'Who is the owner of the item?'
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

    describe('GET: Does not work for a business - Section 2', () => {
      beforeEach(async () => {
        _createMocks(false, true)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Who is the owner of the item?'
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
      describe('POST: Work for a business', () => {
        beforeEach(async () => {
          _createMocks(true)
        })

        it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'The business I work for',
            nextUrlYourDetails,
            true
          )
        })

        it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'An individual',
            nextUrlOwnerDetails,
            false
          )
        })

        it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Another business',
            nextUrlOwnerDetails,
            false
          )
        })

        it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Other',
            nextUrlWhatCapacity,
            true
          )
        })
      })

      describe('POST: Does not work for a business', () => {
        beforeEach(async () => {
          _createMocks(false)
        })

        it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'A friend or relative',
            nextUrlOwnerDetails,
            false
          )
        })

        it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'A business',
            nextUrlOwnerDetails,
            false
          )
        })

        it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Other',
            nextUrlWhatCapacity,
            true
          )
        })
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        _createMocks(true)
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
          'Tell us who is the owner of the item'
        )
      })
    })
  })
})

const _createMocks = (worksForAbusiness, isSection2 = false) => {
  TestHelper.createMocks()

  const mockData = {
    [RedisKeys.WORK_FOR_A_BUSINESS]: worksForAbusiness,
    [RedisKeys.SELLING_ON_BEHALF_OF]: ''
  }

  RedisService.get = jest.fn((request, redisKey) => {
    return mockData[redisKey]
  })
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  shouldClearOwnerDetails
) => {
  const redisKey = 'selling-on-behalf-of'
  const redisKeyOwnerContactDetails = 'owner.contact-details'
  const redisKeyOwnerAddress = 'owner.address'
  postOptions.payload.sellingOnBehalfOf = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  if (shouldClearOwnerDetails) {
    expect(RedisService.set).toBeCalledTimes(1)
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      redisKey,
      selectedOption
    )

    expect(RedisService.delete).toBeCalledTimes(2)
    expect(RedisService.delete).toBeCalledWith(
      expect.any(Object),
      redisKeyOwnerAddress
    )
    expect(RedisService.delete).toBeCalledWith(
      expect.any(Object),
      redisKeyOwnerContactDetails
    )
  } else {
    expect(RedisService.set).toBeCalledTimes(1)
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      redisKey,
      selectedOption
    )
  }

  expect(response.headers.location).toEqual(nextUrl)
}
