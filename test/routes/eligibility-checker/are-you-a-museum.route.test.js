'use strict'

const TestHelper = require('../../utils/test-helper')
jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

describe('/eligibility-checker/are-you-a-museum route', () => {
  let server
  const url = '/eligibility-checker/are-you-a-museum'
  const nextUrlDoNotNeedService = '/eligibility-checker/do-not-need-service'
  const nextUrlCanContinue = '/can-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpTextList: 'helpTextList',
    areYouAMuseum: 'areYouAMuseum',
    areYouAMuseum2: 'areYouAMuseum-2',
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
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Are you selling or hiring the item out on behalf of a museum?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You must be acting on behalf of a museum that is a member of the International Council of Museums, or accredited by one of the following:'
      )
    })

    it('should have a help text list', () => {
      const element = document.querySelector(`#${elementIds.helpTextList}`)
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.areYouAMuseum,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.areYouAMuseum2,
        'No',
        'No'
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
      it('should progress to the next route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Yes',
          nextUrlDoNotNeedService
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlCanContinue,
          'Item to be sold or hired out to a qualifying museum'
        )
      })

      describe('Failure', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          postOptions.payload.areYouAMuseum = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'areYouAMuseum',
            'areYouAMuseum-error',
            'Tell us whether you are acting on behalf of a museum'
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
  itemType
) => {
  const redisKeyTypeOfItem = 'what-type-of-item-is-it'
  const redisKeyAreYouAMuseum = 'eligibility-checker.are-you-a-museum'
  postOptions.payload.areYouAMuseum = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKeyAreYouAMuseum,
    selectedOption === 'Yes'
  )

  if (selectedOption === 'No') {
    expect(RedisService.set).toBeCalledTimes(2)
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      redisKeyTypeOfItem,
      itemType
    )
  } else {
    expect(RedisService.set).toBeCalledTimes(1)
  }

  expect(response.headers.location).toEqual(nextUrl)
}
