'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../utils/test-helper.js';
import { ItemType } from '../../server/utils/constants.js';
import CharacterLimits from '../mock-data/character-limits.js';
jest.mock('./server/services/redis.service.js');

import RedisService from '../../server/services/redis.service.js';

const other = 'Other reason'

describe('/ivory-volume route', () => {
  let server
  const url = '/ivory-volume'
  const nextUrl = '/ivory-age'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    ivoryVolume: 'ivoryVolume',
    ivoryVolume2: 'ivoryVolume-2',
    ivoryVolume3: 'ivoryVolume-3',
    ivoryVolume4: 'ivoryVolume-4',
    otherReason: 'otherReason',
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

    describe('GET: Not a musical item', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce(ItemType.MINIATURE)

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
          'How do you know the item has less than 10% ivory by volume?'
        )
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You must keep any physical evidence that supports your answer. We may ask for it at a later date, if we decide to check your self-declaration.'
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
          elementIds.ivoryVolume,
          'It’s clear from looking at it',
          'It’s clear from looking at it'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryVolume2,
          'I measured it',
          'I measured it'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryVolume3,
          'I have written verification from a relevant expert',
          'I have written verification from a relevant expert'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryVolume4,
          other,
          other
        )
      })

      it('should have the other detail form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.otherReason,
          'Give details'
        )
      })
    })

    describe('GET: Has correct heading for a musical item', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce(ItemType.MUSICAL)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item has less than 20% ivory by volume?'
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
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce(ItemType.MINIATURE)
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
        postOptions.payload.otherReason = 'some text'
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
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce(ItemType.MINIATURE)
      })

      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.ivoryVolume = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'ivoryVolume',
          'ivoryVolume-error',
          'You must tell us how you know the item’s ivory volume'
        )
      })

      it('should display a validation error message if the user selects other and leaves text area empty', async () => {
        postOptions.payload.ivoryVolume = other
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherReason',
          'otherReason-error',
          'You must tell us how you know the item’s ivory volume'
        )
      })

      it('should display a validation error message if the other text area > 4000 chars', async () => {
        postOptions.payload = {
          ivoryVolume: other,
          otherReason: `${CharacterLimits.fourThousandCharacters}X`
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherReason',
          'otherReason-error',
          'Enter no more than 4,000 characters'
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
  otherReason = ''
) => {
  const redisKey = 'ivory-volume'
  postOptions.payload.ivoryVolume = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  const expectedRedisValue = {}
  if (otherReason) {
    expectedRedisValue.otherReason = otherReason
  }
  expectedRedisValue.ivoryVolume = selectedOption

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    JSON.stringify(expectedRedisValue)
  )

  expect(response.headers.location).toEqual(nextUrl)
}
