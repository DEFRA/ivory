'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')
const { ServerEvents } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

jest.mock('../../../server/services/address.service')
const AddressService = require('../../../server/services/address.service')

const {
  singleAddress,
  multipleAddresses
} = require('../../mock-data/addresses')

describe('/address-find route', () => {
  let server
  const url = '/user-details/owner/address-find'
  const nextUrlSingleAddress = '/user-details/owner/address-confirm'
  const nextUrlMultipleAddresses = '/user-details/owner/address-choose'

  const elementIds = {
    pageHeading: 'pageHeading',
    helpText: 'helpText',
    nameOrNumber: 'nameOrNumber',
    postcode: 'postcode',
    findAddress: 'findAddress',
    outsideUkLink: 'outsideUkLink'
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
      RedisService.get = jest.fn().mockReturnValue('yes')

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page title', () => {
      const element = document.querySelector(
        `#${elementIds.pageHeading} > legend > h1`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'What is your address?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If your business is the legal owner of the item, give your business address.'
      )
    })

    it('should have the "Name or Number" form field', () => {
      TestHelper.checkFormField(
        document,
        elementIds.nameOrNumber,
        'Property name or number',
        'For example, The Mill, Flat A or 37b'
      )
    })

    it('should have the "Postcode" form field', () => {
      TestHelper.checkFormField(document, elementIds.postcode, 'Postcode')
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.findAddress}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Find address')
    })

    it('should have the correct "Outside UK" link', () => {
      const element = document.querySelector(`#${elementIds.outsideUkLink}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'The address is outside the UK'
      )
      expect(element.href).toEqual('address-international')
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
      const redisKey = 'address-find'

      it('should store the value in Redis and progress to the next route when a single address is returned by the search', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue(singleAddress)

        postOptions.payload = {
          postcode: 'SW1A 1AA'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )
        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify(singleAddress)
        )

        expect(response.headers.location).toEqual(nextUrlSingleAddress)
      })

      it('should store the value in Redis and progress to the next route when multiple addresses are returned by the search', async () => {
        AddressService.addressSearch = jest
          .fn()
          .mockReturnValue(multipleAddresses)

        postOptions.payload = {
          postcode: 'CF10 4GA'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )
        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify(multipleAddresses)
        )

        expect(response.headers.location).toEqual(nextUrlMultipleAddresses)
      })
    })

    describe.skip('Failure: Owner-applicant', () => {
      beforeEach(() => {
        // RedisService.get = jest.fn().mockReturnValue('yes')
      })

      it('should display a validation error message if the user does not enter the full name', async () => {
        postOptions.payload = {
          name: '',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.name,
          'Enter your full name'
        )
      })

      it('should display a validation error message if the user does not enter the email address', async () => {
        postOptions.payload = {
          name: 'some-value',
          emailAddress: '',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.emailAddress,
          'Enter your email address'
        )
      })

      it('should display a validation error message if the user does not enter an email address in a valid format', async () => {
        postOptions.payload = {
          name: 'some-value',
          emailAddress: 'invalid-email@',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.emailAddress,
          'Enter an email address in the correct format, like name@example.com'
        )
      })

      it('should display a validation error message if the user does not confirm their email address', async () => {
        postOptions.payload = {
          name: 'some-value',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.confirmEmailAddress,
          'You must confirm your email address'
        )
      })

      it('should display a validation error message if the email addresses do not match', async () => {
        postOptions.payload = {
          name: 'some-value',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-other-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.confirmEmailAddress,
          'This confirmation does not match your email address'
        )
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}
