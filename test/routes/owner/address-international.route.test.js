'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const { ServerEvents } = require('../../../server/utils/constants')

const CharacterLimits = require('../../mock-data/character-limits')

describe('/user-details/owner/address-international route', () => {
  let server
  const url = '/user-details/owner/address-international'
  const nextUrlIntentionForItem = '/intention-for-item'
  const nextUrlApplicantDetails = '/user-details/applicant/contact-details'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    internationalAddress: 'internationalAddress',
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

  describe('GET: Owned by applicant', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockReturnValue('Yes')

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
      expect(TestHelper.getTextContent(element)).toEqual('Enter your address')
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If your business owns the item, give your business address.'
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

  describe('GET: Not owned by applicant', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockReturnValue('No')

      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
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

  describe('POST', () => {
    let postOptions
    const redisKeyOwnerAddress = 'owner.address'
    const redisKeyApplicantAddress = 'applicant.address'
    const internationalAddress = 'THE OWNER ADDRESS'

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success: Owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockReturnValue('Yes')
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
          redisKeyApplicantAddress,
          'The Owner Address'
        )

        expect(response.headers.location).toEqual(nextUrlIntentionForItem)
      })
    })

    describe('Success: Not owned by applicant', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockReturnValue('No')
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
        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddress,
          'The Owner Address'
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
  RedisService.set = jest.fn()
}
