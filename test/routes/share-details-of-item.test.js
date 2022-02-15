'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const { Options, RedisKeys } = require('../../server/utils/constants')

describe('/who-owns-the-item route', () => {
  let server
  const url = '/share-details-of-item'
  const nextUrl = '/make-payment'

  const elementIds = {
    pageTitle: 'pageTitle',
    shareDetailsOfItem: 'shareDetailsOfItem',
    shareDetailsOfItem2: 'shareDetailsOfItem-2',
    piLink: 'piLink',
    para1: 'para1',
    para2: 'para2',
    para3: 'para3',
    shareReasons: 'shareReasons',
    callToAction: 'callToAction'
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
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Help our experts by allowing us to share details of your item'
      )
    })

    it('should have the introductory paragraph', () => {
      const element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
    })

    it('should have the introductory paragraph PI link', () => {
      const element = document.querySelector(`#${elementIds.piLink}`)
      TestHelper.checkLink(
        element,
        'Prescribed Institutions (opens in a new window or tab)',
        'https://www.gov.uk/guidance/ivory-apply-for-an-exemption-certificate-to-deal-in-pre-1918-outstandingly-high-artistic-cultural-or-historical-value-items#prescribed-institutions'
      )
    })

    it('should display the correct bullet list header', () => {
      const element = document.querySelector(`#${elementIds.para2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('We will only share:')
    })

    it('should display the correct bullet list', () => {
      let element = document.querySelector(
        `#${elementIds.shareReasons} > li:nth-child(1)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'information about the item from your application, such as the description'
      )

      element = document.querySelector(
        `#${elementIds.shareReasons} > li:nth-child(2)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'photographs of the item declared in your application'
      )

      element = document.querySelector(
        `#${elementIds.shareReasons} > li:nth-child(3)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'the outcome of your application'
      )

      element = document.querySelector(
        `#${elementIds.shareReasons} > li:nth-child(4)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'this information once you have received the outcome of your application'
      )
    })

    it('should have the correct inset text', () => {
      const element = document.querySelector(`#${elementIds.para3}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'No personal data will be shared.'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.shareDetailsOfItem,
        'Yes',
        'Yes',
        true
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.shareDetailsOfItem2,
        'No',
        'No',
        false
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.callToAction}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Confirm and submit')
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
        await _checkSelectedRadioAction(postOptions, server, 'Yes', nextUrl)
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'No', nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.shareDetailsOfItem = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'shareDetailsOfItem',
          'shareDetailsOfItem-error',
          'You must tell us whether you agree to us sharing details of your application with the Prescribed Institutions'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  const mockData = {
    [RedisKeys.SHARE_DETAILS_OF_ITEM]: Options.YES
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
  postOptions.payload.shareDetailsOfItem = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.SHARE_DETAILS_OF_ITEM,
    selectedOption
  )

  expect(response.headers.location).toEqual(nextUrl)
}
