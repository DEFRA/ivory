'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')
const { ServerEvents } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const { singleAddress } = require('../../mock-data/addresses')

describe('/address-enter route', () => {
  let server
  const url = '/user-details/owner/address-enter'
  const nextUrl = '/check-your-answers'

  const elementIds = {
    pageHeading: 'pageHeading',
    helpText: 'helpText',
    addressLine1: 'addressLine1',
    addressLine2: 'addressLine2',
    townOrCity: 'townOrCity',
    postcode: 'postcode',
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

  describe('GET: Enter or Edit address', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest
        .fn()
        .mockReturnValue(JSON.stringify(singleAddress))

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page title for 1 address returned', () => {
      const element = document.querySelector(
        `#${elementIds.pageHeading} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Edit your address')
    })

    it('should have the correct help text for 1 address returned', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If your business owns the item, give your business address.'
      )
    })

    // TODO Not sure how to get this to work
    it.skip('addressLine1 should be pre-populated with test data', () => {
      const element = document.querySelector(`#${elementIds.addressLine1}`)
      expect(element).toBeTruthy()
      console.log(element)
      expect(TestHelper.getTextContent(element)).toEqual('Buckingham Palace')
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.continue}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Continue')
    })
  })

  describe('POST', () => {
    let postOptions

    beforeEach(async () => {
      RedisService.get = jest
        .fn()
        .mockReturnValue(JSON.stringify(singleAddress))

      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success: address-enter', () => {
      it('should redirect to the correct page', async () => {
        postOptions.payload = {
          addressLine1: 'A Big House',
          townOrCity: 'London',
          postcode: 'SW1A 1AA'
        }
        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure: address-enter', () => {
      it('should display a validation error message if the user does not enter address line 1', async () => {
        postOptions.payload = {
          addressLine1: '',
          townOrCity: 'London',
          postcode: 'SW1A 1AA'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.addressLine1,
          'Enter the building and street information'
        )
      })

      it('should display a validation error message if the user does not enter a town or city', async () => {
        postOptions.payload = {
          addressLine1: 'The Big House',
          townOrCity: '',
          postcode: 'SW1A 1AA'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.townOrCity,
          'Enter a town or city'
        )
      })

      it('should display a validation error message if the user does not enter the postcode', async () => {
        postOptions.payload = {
          addressLine1: '1 The Big House',
          townOrCity: 'London',
          postcode: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.postcode,
          'Enter the postcode'
        )
      })

      it('should display a validation error message if the user enters a postcode in an invalid format', async () => {
        postOptions.payload = {
          addressLine1: '1 The Big House',
          townOrCity: 'London',
          postcode: 'INVALID_FORMAT'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.postcode,
          'Enter a UK postcode in the correct format'
        )
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}
