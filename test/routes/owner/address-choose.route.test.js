'use strict'

const TestHelper = require('../../utils/test-helper')
const AddressService = require('../../../server/services/address.service')
jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const { RedisKeys } = require('../../../server/utils/constants')

const {
  singleAddress,
  multipleAddresses
} = require('../../mock-data/addresses')

describe('/user-details/owner/address-choose route', () => {
  let server
  const url = '/user-details/owner/address-choose'
  const nextUrlIntentionForItem = '/intention-for-item'

  const nextUrlApplicantContactDetails =
    '/user-details/applicant/contact-details'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText1: 'helpText1',
    helpText2: 'helpText2',
    address: 'address',
    address2: 'address-2',
    address3: 'address-3',
    addressNotOnList: 'addressNotOnList',
    continue: 'continue'
  }

  const nameOrNumber = '123'
  const postcode = 'AB12 3CD'

  let document

  const getOptions = {
    method: 'GET',
    url
  }

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
    describe('GET: Owned by applicant', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: 'Yes',
          [RedisKeys.ADDRESS_FIND_RESULTS]: multipleAddresses,
          [RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER]: nameOrNumber,
          [RedisKeys.ADDRESS_FIND_POSTCODE]: postcode
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

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
        expect(TestHelper.getTextContent(element)).toEqual('Choose address')
      })

      it('should have the help text if name/number and postcode were entered', () => {
        let element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          `No results for "${nameOrNumber}".`
        )

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          `Here are all the results for ${postcode}.`
        )
      })

      it('should have the correct radio buttons', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.address,
          multipleAddresses[0].Address.AddressLine,
          multipleAddresses[0].Address.AddressLine
        )
        TestHelper.checkRadioOption(
          document,
          elementIds.address2,
          multipleAddresses[1].Address.AddressLine,
          multipleAddresses[1].Address.AddressLine
        )
        TestHelper.checkRadioOption(
          document,
          elementIds.address3,
          multipleAddresses[2].Address.AddressLine,
          multipleAddresses[2].Address.AddressLine
        )
      })

      it('should have the correct "Address not on the list" link', () => {
        const element = document.querySelector(
          `#${elementIds.addressNotOnList}`
        )
        TestHelper.checkLink(
          element,
          'The address is not on the list',
          'address-enter'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Owned by applicant - Hidden help text', () => {
      beforeEach(async () => {
        const nameOrNumber = undefined

        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: 'Yes',
          [RedisKeys.ADDRESS_FIND_RESULTS]: multipleAddresses,
          [RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER]: nameOrNumber,
          [RedisKeys.ADDRESS_FIND_POSTCODE]: postcode
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have hidden help text if the name/number was not entered', () => {
        let element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeFalsy()

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeFalsy()
      })
    })

    describe('GET: Not owned by applicant', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: 'No',
          [RedisKeys.ADDRESS_FIND_RESULTS]: multipleAddresses,
          [RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER]: nameOrNumber,
          [RedisKeys.ADDRESS_FIND_POSTCODE]: postcode
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

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
        expect(TestHelper.getTextContent(element)).toEqual('Choose address')
      })

      it('should have the help text if name/number and postcode were entered', () => {
        let element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          `No results for "${nameOrNumber}".`
        )

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          `Here are all the results for ${postcode}.`
        )
      })

      it('should have the correct radio buttons', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.address,
          multipleAddresses[0].Address.AddressLine,
          multipleAddresses[0].Address.AddressLine
        )
        TestHelper.checkRadioOption(
          document,
          elementIds.address2,
          multipleAddresses[1].Address.AddressLine,
          multipleAddresses[1].Address.AddressLine
        )
        TestHelper.checkRadioOption(
          document,
          elementIds.address3,
          multipleAddresses[2].Address.AddressLine,
          multipleAddresses[2].Address.AddressLine
        )
      })

      it('should have the correct "Address not on the list" link', () => {
        const element = document.querySelector(
          `#${elementIds.addressNotOnList}`
        )
        TestHelper.checkLink(
          element,
          'The address is not on the list',
          'address-enter'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Not owned by applicant - Hidden help text', () => {
      beforeEach(async () => {
        const nameOrNumber = undefined

        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: 'No',
          [RedisKeys.ADDRESS_FIND_RESULTS]: multipleAddresses,
          [RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER]: nameOrNumber,
          [RedisKeys.ADDRESS_FIND_POSTCODE]: postcode
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have hidden help text if the name/number was not entered', () => {
        let element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeFalsy()

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeFalsy()
      })
    })
  })

  describe('POST', () => {
    const redisKeyOwnerAddress = 'owner.address'
    const redisKeyOwnerAddressInternational = 'owner.address.international'
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
        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: 'Yes',
          [RedisKeys.ADDRESS_FIND_RESULTS]: multipleAddresses
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })
      })

      it('should store the selected address in Redis and progress to the next route when the user selects an address', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue(singleAddress)

        postOptions.payload = {
          address: singleAddress[0].Address.AddressLine
        }

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(2)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddress,
          singleAddress[0].Address.AddressLine
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddressInternational,
          false
        )

        expect(response.headers.location).toEqual(nextUrlIntentionForItem)
      })
    })

    describe('Success: Not owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('No')
          .mockResolvedValueOnce(singleAddress)
      })

      it('should store the selected address in Redis and progress to the next route when the user selects an address', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue(singleAddress)
        postOptions.payload = {
          address: singleAddress[0].Address.AddressLine
        }

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(2)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddress,
          singleAddress[0].Address.AddressLine
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddressInternational,
          false
        )

        expect(response.headers.location).toEqual(
          nextUrlApplicantContactDetails
        )
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('No')
          .mockResolvedValueOnce(singleAddress)
      })

      it('should display a validation error message if the user does not select an address', async () => {
        postOptions.payload = {
          address: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.address,
          'You must choose an address'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
