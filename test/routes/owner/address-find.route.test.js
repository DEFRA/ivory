'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

jest.mock('../../../server/services/address.service')
const AddressService = require('../../../server/services/address.service')

const {
  singleAddress,
  multipleAddresses
} = require('../../mock-data/addresses')

describe('/user-details/owner/address-find route', () => {
  let server
  const url = '/user-details/owner/address-find'
  const nextUrlEnterAddress = '/user-details/owner/address-enter'
  const nextUrlSingleAddress = '/user-details/owner/address-confirm'
  const nextUrlMultipleAddresses = '/user-details/owner/address-choose'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    nameOrNumber: 'nameOrNumber',
    postcode: 'postcode',
    findAddress: 'findAddress',
    outsideUkLink: 'outsideUkLink'
  }

  const redisKeys = {
    Results: 'address-find.results',
    NameOrNumber: 'address-find.nameOrNumber',
    Postcode: 'address-find.postcode'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
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

  describe('GET: Owned by applicant', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockResolvedValue('Yes')

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
      TestHelper.checkLink(
        element,
        'The address is outside the UK',
        'address-international'
      )
    })
  })

  describe('GET: Not owned by applicant', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockResolvedValue('No')

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
        'What is the owner’s address?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If the legal owner of the item is a business, give the business address.'
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
      TestHelper.checkLink(
        element,
        'The address is outside the UK',
        'address-international'
      )
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

    describe('Success: Owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue('Yes')
      })

      it('should store the query terms and address array in Redis and progress to the next route when a single address is returned by the search', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue(singleAddress)

        const postcode = 'SW1A 1AA'
        postOptions.payload = {
          postcode
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify(singleAddress)
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.NameOrNumber,
          undefined
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Postcode,
          postcode
        )

        expect(response.headers.location).toEqual(nextUrlSingleAddress)
      })

      it('should store the query terms and address array in Redis and progress to the next route when multiple addresses are returned by the search', async () => {
        AddressService.addressSearch = jest
          .fn()
          .mockReturnValue(multipleAddresses)

        const postcode = 'CF10 4GA'
        postOptions.payload = {
          postcode
        }

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify(multipleAddresses)
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.NameOrNumber,
          undefined
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Postcode,
          postcode
        )

        expect(response.headers.location).toEqual(nextUrlMultipleAddresses)
      })

      it('should store an empty query terms and address array in Redis and progress to the next route when no addresses are returned by the search', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue([])

        const postcode = 'CF10 4GA'
        postOptions.payload = {
          postcode
        }

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify([])
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.NameOrNumber,
          undefined
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Postcode,
          postcode
        )

        expect(response.headers.location).toEqual(nextUrlEnterAddress)
      })

      it('should store the query terms and address array in Redis and progress to the next route when too many addresses are returned by the search', async () => {
        const addressLimit = 51
        const addresses = []
        for (let i = 0; i < addressLimit; i++) {
          addresses.push(singleAddress[0])
        }

        AddressService.addressSearch = jest.fn().mockReturnValue(addresses)

        const postcode = 'CF10 4GA'
        postOptions.payload = {
          postcode
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify(addresses)
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.NameOrNumber,
          undefined
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Postcode,
          postcode
        )

        expect(response.headers.location).toEqual(nextUrlEnterAddress)
      })
    })

    describe('Success: Not owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue('No')
      })

      it('should store the query terms and address array in Redis and progress to the next route when a single address is returned by the search', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue(singleAddress)

        postOptions.payload = {
          postcode: 'SW1A 1AA'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )
        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify(singleAddress)
        )

        expect(response.headers.location).toEqual(nextUrlSingleAddress)
      })

      it('should store the query terms and address array in Redis and progress to the next route when multiple addresses are returned by the search', async () => {
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
        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify(multipleAddresses)
        )

        expect(response.headers.location).toEqual(nextUrlMultipleAddresses)
      })

      it('should store an empty query terms and address array in Redis and progress to the next route when no addresses are returned by the search', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue([])

        postOptions.payload = {
          postcode: 'CF10 4GA'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )
        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify([])
        )

        expect(response.headers.location).toEqual(nextUrlEnterAddress)
      })

      it('should store the query terms and address array in Redis and progress to the next route when too many addresses are returned by the search', async () => {
        const addressLimit = 51
        const addresses = []
        for (let i = 0; i < addressLimit; i++) {
          addresses.push(singleAddress[0])
        }

        AddressService.addressSearch = jest.fn().mockReturnValue(addresses)

        postOptions.payload = {
          postcode: 'CF10 4GA'
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )
        expect(RedisService.set).toBeCalledTimes(3)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeys.Results,
          JSON.stringify(addresses)
        )

        expect(response.headers.location).toEqual(nextUrlEnterAddress)
      })
    })

    describe('Failure: Owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue('Yes')
      })

      it('should display a validation error message if the user does not enter the postcode', async () => {
        postOptions.payload = {
          postcode: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.postcode,
          'Enter your postcode'
        )
      })

      it('should display a validation error message if the user enters a postcode in an invalid format', async () => {
        postOptions.payload = {
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

    describe('Failure: Not owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue('No')
      })

      it('should display a validation error message if the user does not enter the postcode', async () => {
        postOptions.payload = {
          postcode: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.postcode,
          "Enter the owner's postcode"
        )
      })

      it('should display a validation error message if the user enters a postcode in an invalid format', async () => {
        postOptions.payload = {
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
