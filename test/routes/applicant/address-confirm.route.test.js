'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../../utils/test-helper.js';
import AddressService from '../../../server/services/address.service.js';
import RedisService from '../../../server/services/redis.service.js';
import { Options, RedisKeys } from '../../../server/utils/constants.js';
import { singleAddress } from '../../mock-data/addresses';
jest.mock('./server/services/redis.service.js')

describe('/user-details/applicant/address-confirm route', () => {
  let server
  const url = '/user-details/applicant/address-confirm'
  const nextUrl = '/intention-for-item'

  const elementIds = {
    pageTitle: 'pageTitle',
    address1: 'address-1',
    address2: 'address-2',
    address3: 'address-3',
    address4: 'address-4',
    editTheAddress: 'editTheAddress',
    confirmAndContinue: 'confirmAndContinue'
  }

  let document

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
    const getOptions = {
      method: 'GET',
      url
    }

    describe('GET', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: Options.NO,
          [RedisKeys.ADDRESS_FIND_RESULTS]: singleAddress
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
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Confirm address')
      })

      it('should show the selected address', () => {
        let element = document.querySelector(`#${elementIds.address1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          `${singleAddress[0].Address.SubBuildingName}, ${singleAddress[0].Address.Locality}`
        )

        element = document.querySelector(`#${elementIds.address2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          singleAddress[0].Address.Town
        )

        element = document.querySelector(`#${elementIds.address3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          singleAddress[0].Address.Postcode
        )

        element = document.querySelector(`#${elementIds.address4}`)
        expect(element).toBeFalsy()
      })

      it('should have the correct "Edit the address" link', () => {
        const element = document.querySelector(`#${elementIds.editTheAddress}`)
        TestHelper.checkLink(
          element,
          'Edit the address',
          '/user-details/applicant/address-enter'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(
          `#${elementIds.confirmAndContinue}`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Confirm and continue'
        )
      })
    })
  })

  describe('POST', () => {
    let postOptions
    const redisKeyOwnerAddress = 'owner.address'
    const redisKeyOwnerAddressInternational = 'owner.address.international'
    const redisKeyApplicantAddress = 'applicant.address'
    const redisKeyApplicantAddressInternational =
      'applicant.address.international'

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success: Not owned by applicant', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: Options.YES,
          [RedisKeys.ADDRESS_FIND_RESULTS]: singleAddress
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

        expect(RedisService.set).toBeCalledTimes(4)

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
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyApplicantAddress,
          singleAddress[0].Address.AddressLine
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyApplicantAddressInternational,
          false
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Success: Not owned by applicant', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.OWNED_BY_APPLICANT]: Options.NO,
          [RedisKeys.ADDRESS_FIND_RESULTS]: singleAddress
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
          redisKeyApplicantAddress,
          singleAddress[0].Address.AddressLine
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyApplicantAddressInternational,
          false
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
