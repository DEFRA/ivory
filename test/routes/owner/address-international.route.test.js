'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')
const { ServerEvents } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

describe('/address-international route', () => {
  let server
  const url = '/user-details/owner/address-international'
  const nextUrl = '/check-your-answers'

  const elementIds = {
    pageHeading: 'pageHeading',
    helpText: 'helpText',
    internationalAddress: 'internationalAddress',
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

  describe('GET: Owner applicant', () => {
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

    it('should have the "Enter your address" form field', () => {
      TestHelper.checkFormField(
        document,
        elementIds.internationalAddress,
        'Enter your address',
        'If your business owns the item, give your business address.'
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

    describe('Success: Owner-applicant', () => {
      const redisKey = 'owner.internationalAddress'
      const internationalAddress = 'SOME ADDRESS'

      it('should store the address in Redis and progress to the next route when the address is entered by the search', async () => {
        postOptions.payload = {
          internationalAddress
        }

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )
        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          internationalAddress
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure: Owner-applicant', () => {
      it('should display a validation error message if the user does not enter the address', async () => {
        postOptions.payload = {
          internationalAddress: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.internationalAddress,
          'Enter the address'
        )
      })

      it('should display a validation error message if address is too long', async () => {
        const fiftyCharacters =
          'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
        let internationalAddress = 'X'
        for (let i = 0; i < 4000 / 50; i++) {
          internationalAddress = internationalAddress += fiftyCharacters
        }
        postOptions.payload = {
          internationalAddress
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.internationalAddress,
          'Enter a shorter address with no more than 4000 characters'
        )
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}
