'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const { RedisKeys } = require('../../server/utils/constants')

describe('/who-owns-the-item route', () => {
  let server
  const url = '/who-owns-the-item'
  const nextUrlYourDetails = '/user-details/applicant/contact-details'
  const nextUrlWorkForABusiness = '/work-for-a-business'

  const elementIds = {
    doYouOwnTheItem: 'doYouOwnTheItem',
    doYouOwnTheItem2: 'doYouOwnTheItem-2',
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
      expect(TestHelper.getTextContent(element)).toEqual('Do you own the item?')
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.doYouOwnTheItem,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.doYouOwnTheItem2,
        'No',
        'No'
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
          'Yes',
          nextUrlYourDetails
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlWorkForABusiness
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.doYouOwnTheItem = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'doYouOwnTheItem',
          'doYouOwnTheItem-error',
          'Tell us if you own the item'
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
  postOptions.payload.doYouOwnTheItem = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  if (selectedOption === 'Yes') {
    expect(RedisService.set).toBeCalledTimes(2)
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      redisKey,
      selectedOption === 'Yes' ? 'Yes' : 'No'
    )

    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      RedisKeys.WORK_FOR_A_BUSINESS,
      null
    )
  } else {
    expect(RedisService.set).toBeCalledTimes(1)
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      redisKey,
      selectedOption === 'Yes' ? 'Yes' : 'No'
    )
  }

  expect(response.headers.location).toEqual(nextUrl)
}
