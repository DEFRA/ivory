'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const TestHelper = require('../../utils/test-helper')
const CharacterLimits = require('../../mock-data/character-limits')

describe('/user-details/owner/address-international route', () => {
  let server
  const url = '/user-details/owner/address-international'
  const nextUrlApplicantDetails = '/user-details/applicant/contact-details'

  const elementIds = {
    pageTitle: 'pageTitle',
    internationalAddress: 'internationalAddress',
    continue: 'continue'
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

    describe('Not a business', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('An individual')

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
          'Enter the owner’s address'
        )
      })

      it('should have the "Enter your address" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.internationalAddress,
          '',
          ''
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('Is a business', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('A business')

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Enter the address of the business'
        )
      })
    })
  })

  describe('POST', () => {
    let postOptions
    const redisKeyOwnerAddress = 'owner.address'
    const redisKeyApplicantAddressInternational = 'owner.address.international'
    const internationalAddress = 'THE OWNER ADDRESS'

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue('No')
      })

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
        expect(RedisService.set).toBeCalledTimes(2)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddress,
          'The Owner Address'
        )
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyApplicantAddressInternational,
          true
        )

        expect(response.headers.location).toEqual(nextUrlApplicantDetails)
      })
    })

    describe('Failure', () => {
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
        postOptions.payload = {
          internationalAddress: `${CharacterLimits.oneHundredThousandCharacters}X`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.internationalAddress,
          'Address must have fewer than 100,000 characters'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
