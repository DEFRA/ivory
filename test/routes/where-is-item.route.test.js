'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const { ServerEvents } = require('../../server/utils/constants')

describe('/where-is-item route', () => {
  let server
  const url = '/where-is-item'
  const nextUrl = '/sale-intention'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    whereIsItem: 'whereIsItem',
    whereIsItem2: 'whereIsItem-2',
    whereIsItem3: 'whereIsItem-3',
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
        'Is the item currently in Great Britain?'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.whereIsItem,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(document, elementIds.whereIsItem2, 'No', 'No')
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
        await _checkSelectedRadioAction(postOptions, server, 'Yes', nextUrl)
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'No', nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.whereIsItem = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whereIsItem',
          'whereIsItem-error',
          'You must tell us if the item is currently in Great Britain'
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
  nextUrl
) => {
  const redisKey = 'where-is-item'
  postOptions.payload.whereIsItem = selectedOption

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
