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

describe('/user-details/applicant/address-choose route', () => {
  let server
  const url = '/user-details/applicant/address-choose'
  const nextUrlCheckYourAnswers = '/check-your-answers'

  const elementIds = {
    pageTitle: 'pageTitle',
    address: 'address',
    address2: 'address-2',
    address3: 'address-3',
    addressNotOnList: 'addressNotOnList',
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
      RedisService.get = jest
        .fn()
        .mockReturnValue(JSON.stringify(multipleAddresses))

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector('.govuk-fieldset__heading')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Choose your address')
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
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'The address is not on the list'
      )
      expect(element.href).toEqual('address-enter')
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.continue}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Continue')
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
          .mockReturnValueOnce('no')
          .mockReturnValueOnce(JSON.stringify(singleAddress))
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

        expect(response.headers.location).toEqual(nextUrlCheckYourAnswers)
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockReturnValueOnce('yes')
          .mockReturnValueOnce(JSON.stringify(singleAddress))
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
  RedisService.set = jest.fn()
}