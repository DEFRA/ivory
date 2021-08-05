'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/cookie.service')
const CookieService = require('../../../server/services/cookie.service')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

jest.mock('../../../server/services/address.service')
const AddressService = require('../../../server/services/address.service')

const {
  singleAddress,
  multipleAddresses
} = require('../../mock-data/addresses')

describe('/user-details/applicant/address-choose route', () => {
  let server
  const url = '/user-details/applicant/address-choose'
  const nextUrl = '/intention-for-item'

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

  describe('GET', () => {
    beforeEach(async () => {
      RedisService.get = jest
        .fn()
        .mockResolvedValueOnce('No')
        .mockResolvedValueOnce(JSON.stringify(multipleAddresses))
        .mockResolvedValueOnce(nameOrNumber)
        .mockResolvedValueOnce(postcode)

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
      expect(TestHelper.getTextContent(element)).toEqual('Choose your address')
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
      const element = document.querySelector(`#${elementIds.addressNotOnList}`)
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

  describe('GET: Hidden help text', () => {
    beforeEach(async () => {
      const nameOrNumber = undefined

      RedisService.get = jest
        .fn()
        .mockResolvedValueOnce('No')
        .mockResolvedValueOnce(JSON.stringify(multipleAddresses))
        .mockResolvedValueOnce(nameOrNumber)
        .mockResolvedValueOnce(postcode)

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have hidden help text if the name/number was not entered', () => {
      let element = document.querySelector(`#${elementIds.helpText1}`)
      expect(element).toBeFalsy()

      element = document.querySelector(`#${elementIds.helpText2}`)
      expect(element).toBeFalsy()
    })
  })

  describe('POST', () => {
    const redisKey = 'applicant.address'
    let postOptions

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('No')
          .mockResolvedValueOnce(JSON.stringify(singleAddress))
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

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          singleAddress[0].Address.AddressLine
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce(JSON.stringify(singleAddress))
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
  CookieService.checkSessionCookie = jest
    .fn()
    .mockReturnValue('THE_SESSION_COOKIE')

  RedisService.set = jest.fn()
}
