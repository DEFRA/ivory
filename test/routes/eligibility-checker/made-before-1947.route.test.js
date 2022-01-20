'use strict'
import { jest } from '@jest/globals';
jest.mock('./server/services/redis.service.js')
import RedisService from '../../../server/services/redis.service.js';
import TestHelper from '../../utils/test-helper.js';

describe('/eligibility-checker/made-before-1947 route', () => {
  let server
  const url = '/eligibility-checker/made-before-1947'
  const nextUrlIvoryAdded = '/eligibility-checker/ivory-added'
  const nextUrlCannotTrade = '/eligibility-checker/cannot-trade'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpTextList: 'helpTextList',
    madeBefore1947: 'madeBefore1947',
    madeBefore19472: 'madeBefore1947-2',
    madeBefore19473: 'madeBefore1947-3',
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
        'Was your item made before 3 March 1947?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'The following might help you decide:'
      )
    })

    it('should have a help text list', () => {
      const element = document.querySelector(`#${elementIds.helpTextList}`)
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.madeBefore1947,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.madeBefore19472,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.madeBefore19473,
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
          'Item made before 3 March 1947 with less than 10% ivory'
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
          postOptions.payload.madeBefore1947 = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'madeBefore1947',
            'madeBefore1947-error',
            'Tell us whether your item was made before 3 March 1947'
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
  postOptions.payload.madeBefore1947 = selectedOption

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
