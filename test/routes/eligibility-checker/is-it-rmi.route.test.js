'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const TestHelper = require('../../utils/test-helper')

describe('/eligibility-checker/is-it-rmi route', () => {
  let server
  const url = '/eligibility-checker/is-it-rmi'
  const nextUrlIvoryAdded = '/eligibility-checker/ivory-added'
  const nextUrlCannotTrade = '/eligibility-checker/cannot-trade'

  const elementIds = {
    pageTitle: 'pageTitle',
    callOutText: 'callOutText',
    howDoIKnow: 'howDoIKnow',
    para1: 'para1',
    para2: 'para2',
    para3: 'para3',
    para5: 'para5',
    para6: 'para6',
    bullet1: 'bullet1',
    bullet2: 'bullet2',
    bullet3: 'bullet3',
    bullet4: 'bullet4',
    bullet5: 'bullet5',
    bullet6: 'bullet6',
    bullet7: 'bullet7',
    bullet8: 'bullet8',
    bullet9: 'bullet9',
    bullet10: 'bullet10',
    isItRmi: 'isItRmi',
    isItRmi2: 'isItRmi-2',
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
        'Does your item have outstandingly high artistic, cultural or historical value?'
      )
    })

    it('should have the correct initial help text', () => {
      _checkElement(document, elementIds.para3, 'The item must be:')

      _checkElement(document, elementIds.bullet1, 'rare')

      _checkElement(
        document,
        elementIds.bullet2,
        'an important example of its type'
      )

      _checkElement(document, elementIds.bullet3, 'or both of the above')
    })

    it('should have the correct summary details', () => {
      _checkElement(
        document,
        `${elementIds.howDoIKnow} .govuk-details__summary-text`,
        'How do I know if my item has outstandingly high artistic, cultural or historic value?'
      )

      _checkElement(
        document,
        elementIds.para5,
        'Each item is assessed individually by recognised experts. They set a very high threshold when advising whether an item meets these criteria.'
      )

      _checkElement(
        document,
        elementIds.para6,
        'They’ll consider various things, such as whether an item:'
      )

      _checkElement(document, elementIds.bullet4, 'is unique or extremely rare')

      _checkElement(
        document,
        elementIds.bullet5,
        'is of high artistic or aesthetic quality, for example from a known artist, school or studio'
      )

      _checkElement(
        document,
        elementIds.bullet6,
        'is in better condition than other items like it'
      )

      _checkElement(
        document,
        elementIds.bullet7,
        'is part of a well-known collection'
      )

      _checkElement(document, elementIds.bullet8, 'has an important history')

      _checkElement(
        document,
        elementIds.bullet9,
        'is important to a specific place or region'
      )

      _checkElement(
        document,
        elementIds.bullet10,
        'has previously been recognised for its value or status, for example being recognised as a national treasure'
      )
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

const _checkElement = (document, id, expectedValue) => {
  const element = document.querySelector(`#${id}`)
  expect(element).toBeTruthy()
  expect(TestHelper.getTextContent(element)).toEqual(expectedValue)
}
