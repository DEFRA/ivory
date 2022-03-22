'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const { Urls } = require('../../../server/utils/constants')
const TestHelper = require('../../utils/test-helper')

describe('/eligibility-checker/what-species route', () => {
  let server
  const url = '/eligibility-checker/what-species'
  const nextUrl = '/eligibility-checker/selling-to-museum'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    needMoreHelp: 'needMoreHelp',
    summaryPara1: 'summaryPara1',
    summaryPara2: 'summaryPara2',
    summaryPara3: 'summaryPara3',
    whatSpecies: 'whatSpecies',
    whatSpecies2: 'whatSpecies-2',
    whatSpecies3: 'whatSpecies-3',
    whatSpecies4: 'whatSpecies-4',
    whatSpecies5: 'whatSpecies-5',
    whatSpecies7: 'whatSpecies-7',
    guidance: 'guidance',
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
      const element = document.querySelector(
        `#${elementIds.pageTitle} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'What species of ivory does your item contain?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)

      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Any ivory in your item must be ‘worked’ ivory. Worked ivory means it has been carved or significantly altered from its original state.'
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector(
        `#${elementIds.needMoreHelp} .govuk-details__summary-text`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'How to identify different types of ivory'
      )
    })

    it('should have the correct summary text details', () => {
      let element = document.querySelector(`#${elementIds.summaryPara1}`)
      expect(element).toBeTruthy()
      element = document.querySelector(`#${elementIds.summaryPara2}`)
      expect(element).toBeTruthy()
      element = document.querySelector(`#${elementIds.summaryPara3}`)
      expect(element).toBeTruthy()
    })

    it('should have the correct summary text link', () => {
      const element = document.querySelector(`#${elementIds.guidance}`)
      TestHelper.checkLink(
        element,
        'guidance on identifying ivory (opens in a new tab)',
        Urls.GOV_UK_TOP_OF_MAIN
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.whatSpecies,
        'Hippopotamus',
        'Hippopotamus',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatSpecies2,
        'Killer whale',
        'Killer whale',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatSpecies3,
        'Narwhal',
        'Narwhal',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatSpecies4,
        'Sperm whale',
        'Sperm whale',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatSpecies5,
        'Walrus',
        'Walrus',
        false,
        ''
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.whatSpecies7,
        'None of these',
        'None of these',
        false,
        ''
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
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Musical instrument made before 1975 with less than 20% ivory',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Item made before 3 March 1947 with less than 10% ivory',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Portrait miniature made before 1918 with a surface area less than 320 square centimetres',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Item to be sold or hired out to a qualifying museum',
          nextUrl
        )
      })

      it('should store the value in Redis and progress to the next route when the fifth option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
          nextUrl
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.whatSpecies = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whatSpecies',
          'whatSpecies-error',
          'You must tell us what species of ivory your item contains'
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
  const redisKey = 'what-species'
  postOptions.payload.whatSpecies = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    selectedOption
  )

  expect(response.headers.location).toEqual(nextUrl)
}
