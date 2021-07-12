'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

describe('/eligibility-checker/rmi-and-pre-1918 route', () => {
  let server
  const url = '/eligibility-checker/rmi-and-pre-1918'
  const nextUrlIvoryAdded = '/eligibility-checker/ivory-added'
  const nextUrlCannotTrade = '/eligibility-checker/cannot-trade'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpTextList: 'helpTextList',
    rmiAndPre1918: 'rmiAndPre1918',
    rmiAndPre19182: 'rmiAndPre1918-2',
    rmiAndPre19183: 'rmiAndPre1918-3',
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
        'Is it a pre-1918 item of outstandingly high artistic, cultural or historical value?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('The item must:')
    })

    it('should have a help text list', () => {
      const element = document.querySelector(`#${elementIds.helpTextList}`)
      expect(element).toBeTruthy()
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
      TestHelper.checkRadioOption(
        document,
        elementIds.rmiAndPre1918,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.rmiAndPre19182,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.rmiAndPre19183,
        'I don’t know',
        'I don’t know'
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

      it('should progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'I don’t know',
          nextUrlCannotContinue
        )
      })

      describe('Failure', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          postOptions.payload.rmiAndPre1918 = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'rmiAndPre1918',
            'rmiAndPre1918-error',
            'Tell us whether your item is a pre-1918 item of outstandingly high artistic, cultural or historical value'
          )
        })
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  redisValue
) => {
  const redisKeyTypeOfItem = 'what-type-of-item-is-it'
  postOptions.payload.rmiAndPre1918 = selectedOption

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
