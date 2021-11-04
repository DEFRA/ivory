'use strict'

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const CharacterLimits = require('../mock-data/character-limits')

const other = 'Other'

describe('/what-capacity route', () => {
  let server
  const url = '/what-capacity'
  const nextUrl = '/user-details/applicant/contact-details'

  const elementIds = {
    pageTitle: 'pageTitle',
    whatCapacity: 'whatCapacity',
    whatCapacity2: 'whatCapacity-2',
    whatCapacity3: 'whatCapacity-3',
    whatCapacity4: 'whatCapacity-4',
    otherCapacity: 'otherCapacity',
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
        'In what capacity are you making this declaration?'
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
        elementIds.whatCapacity,
        'Agent',
        'Agent',
        false,
        'For example, an antiques dealer or auction house selling the item'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatCapacity2,
        'Executor or administrator',
        'Executor or administrator'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatCapacity3,
        'Trustee',
        'Trustee'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatCapacity4,
        other,
        other
      )
    })

    it('should have the other detail form field', () => {
      TestHelper.checkFormField(
        document,
        elementIds.otherCapacity,
        'Give details'
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
        postOptions.payload.otherCapacity = 'some text'
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
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.whatCapacity = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whatCapacity',
          'whatCapacity-error',
          'Tell us in what capacity you are making this declaration'
        )
      })

      it('should display a validation error message if the user selects other and leaves text area empty', async () => {
        postOptions.payload.whatCapacity = other
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherCapacity',
          'otherCapacity-error',
          'Tell us in what capacity you are making this declaration'
        )
      })

      it('should display a validation error message if the other text area > 4000 chars', async () => {
        postOptions.payload = {
          whatCapacity: other,
          otherCapacity: `${CharacterLimits.fourThousandCharacters}X`
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherCapacity',
          'otherCapacity-error',
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
  otherCapacity = ''
) => {
  const redisKey = 'what-capacity'
  postOptions.payload.whatCapacity = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  const expectedRedisValue = {}
  if (otherCapacity) {
    expectedRedisValue.otherCapacity = otherCapacity
  }
  expectedRedisValue.whatCapacity = selectedOption

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    JSON.stringify(expectedRedisValue)
  )

  expect(response.headers.location).toEqual(nextUrl)
}
