'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/cookie.service')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

describe('/eligibility-checker/is-it-rmi route', () => {
  let server
  const url = '/eligibility-checker/is-it-rmi'
  const nextUrlIvoryAdded = '/eligibility-checker/ivory-added'
  const nextUrlCannotTrade = '/eligibility-checker/cannot-trade'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    callOutText: 'callOutText',
    isItRmi: 'isItRmi',
    isItRmi2: 'isItRmi-2',
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
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Does your item have outstandingly high artistic, cultural or historical value?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'The item must be a rare and socially significant example of its type.'
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector('.govuk-details__summary-text')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'How do I know if my item has outstandingly high artistic, cultural or historic value?'
      )
    })

    it('should have some summary text details', () => {
      const element = document.querySelector('.govuk-details__text')
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(document, elementIds.isItRmi, 'Yes', 'Yes')

      TestHelper.checkRadioOption(document, elementIds.isItRmi2, 'No', 'No')
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
          nextUrlIvoryAdded,
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
        )
      })

      it('should progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlCannotTrade
        )
      })

      describe('Failure', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          postOptions.payload.isItRmi = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'isItRmi',
            'isItRmi-error',
            'Tell us whether your item has outstandingly high artistic, cultural or historical value'
          )
        })
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
  redisValue
) => {
  const redisKeyTypeOfItem = 'what-type-of-item-is-it'
  postOptions.payload.isItRmi = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  if (redisValue) {
    expect(RedisService.set).toBeCalledTimes(1)
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      redisKeyTypeOfItem,
      redisValue
    )
  }

  expect(response.headers.location).toEqual(nextUrl)
}
