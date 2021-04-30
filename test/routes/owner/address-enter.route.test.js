'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')
const { ServerEvents } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const {
  singleAddress,
  multipleAddresses
} = require('../../mock-data/addresses')

const elementIds = {
  pageHeading: 'pageHeading',
  helpText: 'helpText',
  addressLine1: 'addressLine1',
  addressLine2: 'addressLine2',
  townOrCity: 'townOrCity',
  postcode: 'postcode',
  continue: 'continue'
}

describe('/address-enter route', () => {
  let server
  const url = '/user-details/owner/address-enter'
  const nextUrl = '/check-your-answers'

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

    describe('GET: All page modes', () => {
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

      it('should have the correct help text for 1 address returned', () => {
        const element = document.querySelector(`#${elementIds.helpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If your business owns the item, give your business address.'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: No address mode', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockReturnValue(JSON.stringify([]))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page title for 1 address returned', () => {
        const element = document.querySelector(
          `#${elementIds.pageHeading} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'No results, you will need to enter the address'
        )
      })

      it('should have the correct form fields that are NOT be pre-populated with test data', () => {
        _checkFormFields(document, {
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          postcode: ''
        })
      })
    })

    describe('GET: Single address mode', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValue(JSON.stringify(singleAddress))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page title for 1 address returned', () => {
        const element = document.querySelector(
          `#${elementIds.pageHeading} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Edit your address')
      })

      it('should have the correct form fields that are NOT be pre-populated with test data', () => {
        _checkFormFields(document, {
          addressLine1: 'Buckingham Palace',
          addressLine2: 'Westminster',
          townOrCity: 'London',
          postcode: 'SW1A 1AA'
        })
      })
    })

    describe('GET: Multiple address mode', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValue(JSON.stringify(multipleAddresses))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page title for 1 address returned', () => {
        const element = document.querySelector(
          `#${elementIds.pageHeading} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Enter your address')
      })

      it('should have the correct form fields that are NOT be pre-populated with test data', () => {
        _checkFormFields(document, {
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          postcode: ''
        })
      })
    })

    describe('GET: Too many addresses mode', () => {
      beforeEach(async () => {
        const maxAddressCount = 51
        const addresses = []
        for (let i = 0; i < maxAddressCount; i++) {
          addresses.push(singleAddress)
        }
        RedisService.get = jest.fn().mockReturnValue(JSON.stringify(addresses))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page title for 1 address returned', () => {
        const element = document.querySelector(
          `#${elementIds.pageHeading} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Too many results, you will need to enter the address'
        )
      })

      it('should have the correct form fields that are NOT be pre-populated with test data', () => {
        _checkFormFields(document, {
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          postcode: ''
        })
      })
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

const _checkFormFields = (document, expectedValues) => {
  TestHelper.checkFormField(
    document,
    elementIds.addressLine1,
    'Building and street line 1 of 2',
    null,
    expectedValues.addressLine1
  )

  TestHelper.checkFormField(
    document,
    elementIds.addressLine2,
    'Building and street line 2 of 2',
    null,
    expectedValues.addressLine2
  )

  TestHelper.checkFormField(
    document,
    elementIds.townOrCity,
    'Town or city',
    null,
    expectedValues.townOrCity
  )

  TestHelper.checkFormField(
    document,
    elementIds.postcode,
    'Postcode',
    null,
    expectedValues.postcode
  )
}

const _createMocks = () => {
  RedisService.set = jest.fn()
}
