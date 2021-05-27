'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/sale-intention route', () => {
  let server
  const url = '/sale-intention'
  const nextUrl = '/check-your-answers'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    saleIntention: 'saleIntention',
    saleIntention2: 'saleIntention-2',
    saleIntention3: 'saleIntention-3',
    continue: 'continue'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
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

    describe('GET: Static content', () => {
      beforeEach(async () => {
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document)
      })

      it('should have the correct radio buttons', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.saleIntention,
          'Yes',
          'Yes'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.saleIntention2,
          'No',
          'No'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.saleIntention3,
          "I'm not sure yet",
          "I'm not sure yet"
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Dynamic content - Item inside GB', () => {
      it('should have the correct page heading when the applicant says they are selling the item', async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce('Sell it')
          .mockReturnValueOnce('Yes')

        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Will the item move out of Great Britain when you sell it?'
        )
      })

      it('should have the correct page heading when the applicant says they are hiring out the item', async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce('Hire it out')
          .mockReturnValueOnce('Yes')

        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Will the item move out of Great Britain when you hire it out?'
        )
      })

      it('should have the correct page heading when the applicant says they are selling or hiring out the item', async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce("I'm not sure yet")
          .mockReturnValueOnce('Yes')

        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Will the item move out of Great Britain when you sell or hire it out?'
        )
      })
    })

    describe('GET: Dynamic content - Item outside GB', () => {
      it('should have the correct page heading when the applicant says they are selling the item', async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce('Sell it')
          .mockReturnValueOnce('No')

        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Will the item move into Great Britain when you sell it?'
        )
      })

      it('should have the correct page heading when the applicant says they are hiring out the item', async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce('Hire it out')
          .mockReturnValueOnce('No')

        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Will the item move into Great Britain when you hire it out?'
        )
      })

      it('should have the correct page heading when the applicant says they are selling or hiring out the item', async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce("I'm not sure yet")
          .mockReturnValueOnce('No')

        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Will the item move into Great Britain when you sell or hire it out?'
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
        await _checkSelectedRadioAction(postOptions, server, 'Yes', nextUrl)
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(postOptions, server, 'No', nextUrl)
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          "I'm not sure yet",
          nextUrl
        )
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        postOptions.payload.saleIntention = ''
      })

      describe('Failure: Item inside GB', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          RedisService.get = jest
            .fn()
            .mockReturnValueOnce('Sell it')
            .mockReturnValueOnce('Yes')

          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'saleIntention',
            'saleIntention-error',
            'You must tell us if the item is moving into Great Britain when you sell or hire it out'
          )
        })
      })

      describe('Failure: Item outside GB', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          RedisService.get = jest
            .fn()
            .mockReturnValueOnce('Hire it out')
            .mockReturnValueOnce('No')

          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'saleIntention',
            'saleIntention-error',
            'You must tell us if the item is moving into Great Britain when you sell or hire it out'
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
  nextUrl
) => {
  const redisKey = 'sale-intention'
  postOptions.payload.saleIntention = selectedOption

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
