'use strict'

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const { RedisKeys } = require('../../server/utils/constants')

const TestHelper = require('../utils/test-helper')

const serviceName = 'Declare ivory you intend to sell or hire out'

describe('/what-species-expert route', () => {
  let server
  const url = '/what-species-expert'
  const nextUrl = '/eligibility-checker/how-certain'

  const elementIds = {
    pageTitle: 'pageTitle',
    introPara: 'introPara',
    whatSpecies: 'whatSpecies',
    whatSpecies2: 'whatSpecies-2',
    whatSpecies3: 'whatSpecies-3',
    whatSpecies4: 'whatSpecies-4',
    whatSpecies5: 'whatSpecies-5',
    whatSpecies6: 'whatSpecies-6',
    needMoreHelp: 'needMoreHelp',
    eligibilityChecker: 'eligibilityChecker',
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
    describe('useChecker is set to true', () => {
      beforeEach(async () => {
        const getOptions = {
          method: 'GET',
          url: `${url}?useChecker=true`
        }
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should store the value in Redis', async () => {
        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          RedisKeys.USE_CHECKER,
          true
        )
      })
    })

    describe('useChecker is not set', () => {
      beforeEach(async () => {
        const getOptions = {
          method: 'GET',
          url
        }
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should not store the value in Redis', async () => {
        expect(RedisService.set).toBeCalledTimes(0)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document)
      })

      it('should have the correct cookie banner heading', () => {
        const element = document.querySelector('.govuk-cookie-banner__heading')
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(`Cookies on ${serviceName}`)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Does your item contain ivory from a listed species?'
        )
      })

      it('should have the correct radio buttons', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.whatSpecies,
          'Elephant',
          'Elephant',
          false,
          ''
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.whatSpecies2,
          'Hippopotamus',
          'Hippopotamus',
          false,
          ''
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.whatSpecies3,
          'Killer whale',
          'Killer whale',
          false,
          ''
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.whatSpecies4,
          'Narwhal',
          'Narwhal',
          false,
          ''
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.whatSpecies5,
          'Sperm whale',
          'Sperm whale',
          false,
          ''
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
      describe('cookie banner hides correctly', () => {
        it('should set the CookieBanner state', async () => {
          const expectedResponseCode = 200
          postOptions.payload.cookies = true
          const response = await TestHelper.submitPostRequest(server, postOptions, expectedResponseCode)
          expect(response.headers['set-cookie']).toBeDefined()
          expect(response.headers['set-cookie'][0]).toContain('CookieBanner')
        })
      })

      describe('useChecker is set to true', () => {
        // Mock redis get to return true
        beforeEach(() => {
          RedisService.get = jest.fn().mockResolvedValue(true)
        })

        it('should redirect to SELLING TO MUSEUM page', async () => {
          postOptions.payload.whatSpecies = 'Elephant'
          const response = await TestHelper.submitPostRequest(server, postOptions)
          expect(response.headers.location).toEqual('/eligibility-checker/selling-to-museum')
        })
      })

      describe('useChecker is not set', () => {
        it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Elephant',
            nextUrl
          )
        })

        it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Hippopotamus',
            nextUrl
          )
        })

        it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Killer whale',
            nextUrl
          )
        })

        it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Narwhal',
            nextUrl
          )
        })

        it('should store the value in Redis and progress to the next route when the fifth option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'Sperm whale',
            nextUrl
          )
        })

        it('should store the value in Redis and progress to the next route when the seventh option has been selected', async () => {
          await _checkSelectedRadioAction(
            postOptions,
            server,
            'I know it\'s ivory but I\'m not sure which species',
            nextUrl
          )
        })
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
        TestHelper.checkValidationError(
          response,
          'whatSpecies',
          'whatSpecies-error',
          'Select one of the options to continue.'
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
