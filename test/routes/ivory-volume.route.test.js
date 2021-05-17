'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType, ServerEvents } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const CharacterLimits = require('../mock-data/character-limits')

describe('/ivory-volume route', () => {
  let server
  const url = '/ivory-volume'
  const nextUrl = '/ivory-age'

  const elementIds = {
    ivoryVolume: 'ivoryVolume',
    ivoryVolume2: 'ivoryVolume-2',
    ivoryVolume3: 'ivoryVolume-3',
    ivoryVolume4: 'ivoryVolume-4',
    otherDetail: 'otherDetail',
    continue: 'continue'
  }

  let document

  beforeAll(async done => {
    server = await createServer()
    server.events.on(ServerEvents.PLUGINS_LOADED, () => {
      done()
    })
  })

  afterAll(() => {
    server.stop()
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
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item has less than 10% ivory by volume?'
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
          'Other',
          'Other'
        )
      })

      it('should have the "Enter your address" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.otherDetail,
          'Give details'
        )
      })
    })

    describe('GET: Has correct heading for a musical item', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce(ItemType.MUSICAL)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector('.govuk-fieldset__legend')
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
        postOptions.payload.otherDetail = 'some text'
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Other',
          nextUrl,
          'some text'
        )
      })
    })

    describe('Failure', () => {
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
        postOptions.payload.ivoryVolume = 'Other'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherDetail',
          'otherDetail-error',
          'You must tell us how you know the item’s ivory volume'
        )
      })

      it('should display a validation error message if the other text area > 4000 chars', async () => {
        postOptions.payload = {
          ivoryVolume: 'Other',
          otherDetail: `${CharacterLimits.fourThousandCharacters}X`
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherDetail',
          'otherDetail-error',
          'Enter no more than 4,000 characters'
        )
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
  otherText = ''
) => {
  const redisKey = 'ivory-volume'
  postOptions.payload.ivoryVolume = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    (otherText === '') ? selectedOption : `${selectedOption}: ${otherText}`
  )

  expect(response.headers.location).toEqual(nextUrl)
}
