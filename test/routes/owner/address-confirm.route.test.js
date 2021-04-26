'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')
const { ServerEvents } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

jest.mock('../../../server/services/address.service')
const AddressService = require('../../../server/services/address.service')

const { singleAddress } = require('../../mock-data/addresses')

describe('/address-confirm route', () => {
  let server
  const url = '/user-details/owner/address-confirm'
  const nextUrl = '/check-your-answers'

  const elementIds = {
    pageHeading: 'pageHeading',
    address: 'address',
    editTheAddress: 'editTheAddress',
    confirmAndContinue: 'confirmAndContinue'
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

    it('should have the correct page title', () => {
      const element = document.querySelector(`#${elementIds.pageHeading}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Confirm your address')
    })

    it('should show the selected address', () => {
      const element = document.querySelector(`#${elementIds.address}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        singleAddress[0].Address.AddressLine
      )
    })

    it('should have the correct "Edit the address" link', () => {
      const element = document.querySelector(`#${elementIds.editTheAddress}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Edit the address')
      expect(element.href).toEqual('/user-details/owner/address-enter')
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(
        `#${elementIds.confirmAndContinue}`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Confirm and continue')
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
      it('should store the selected address in Redis and progress to the next route when the user selects an address', async () => {
        AddressService.addressSearch = jest.fn().mockReturnValue(singleAddress)
        postOptions.payload = {
          address: singleAddress[0].Address.AddressLine
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}
