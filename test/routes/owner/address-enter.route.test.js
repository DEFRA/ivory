'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const TestHelper = require('../../utils/test-helper')

const CharacterLimits = require('../../mock-data/character-limits')

const {
  singleAddress,
  multipleAddresses
} = require('../../mock-data/addresses')

const elementIds = {
  pageTitle: 'pageTitle',
  helpText: 'helpText',
  addressLine1: 'addressLine1',
  addressLine2: 'addressLine2',
  townOrCity: 'townOrCity',
  postcode: 'postcode',
  continue: 'continue'
}

describe('/user-details/owner/address-enter route', () => {
  let server
  const url = '/user-details/owner/address-enter'
  const nextUrl = '/user-details/applicant/contact-details'

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

    describe('GET: All page modes', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValue(JSON.stringify(singleAddress))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document)
      })

      it('should have the correct form fields', () => {
        _checkFormFields(document, {
          addressLine1: 'Buckingham Palace',
          addressLine2: 'Westminster',
          townOrCity: 'London',
          postcode: 'SW1A 1AA'
        })
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Page modes', () => {
      describe('Page mode: "edit address"', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValue(JSON.stringify(singleAddress))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading', async () => {
          document = await TestHelper.submitGetRequest(server, getOptions)

          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Edit the address')
        })
      })

      describe('Page mode: "address not on the list', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify(multipleAddresses))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading', async () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Enter the address'
          )
        })
      })

      describe('Page mode: "too many results', () => {
        const maxAddressCount = 51
        const addresses = []

        beforeEach(async () => {
          for (let i = 0; i < maxAddressCount; i++) {
            addresses.push(singleAddress)
          }

          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify(addresses))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading', async () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Too many results, you will need to enter the address'
          )
        })
      })

      describe('Page mode: "no results', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify([]))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading', async () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'No results, you will need to enter the address'
          )
        })
      })
    })
  })

  describe('POST', () => {
    let postOptions
    const redisKeyOwnerAddress = 'owner.address'
    const redisKeyOwnerAddressInternational = 'owner.address.international'

    beforeEach(async () => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      describe('Owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('Yes')
            .mockResolvedValueOnce(JSON.stringify(singleAddress))
        })

        it('should store the selected address in Redis and progress to the next route when the user selects an address', async () => {
          postOptions.payload = {
            addressLine1: 'A Big House',
            townOrCity: 'London',
            postcode: 'SW1A 1AA'
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
            'A Big House, London, SW1A 1AA'
          )
          expect(RedisService.set).toBeCalledWith(
            expect.any(Object),
            redisKeyOwnerAddressInternational,
            false
          )

          expect(response.headers.location).toEqual(nextUrl)
        })
      })

      describe('Not owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify(singleAddress))
        })

        it('should store the selected address in Redis and progress to the next route when the user selects an address', async () => {
          postOptions.payload = {
            addressLine1: 'A Big House',
            townOrCity: 'London',
            postcode: 'SW1A 1AA'
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
            'A Big House, London, SW1A 1AA'
          )
          expect(RedisService.set).toBeCalledWith(
            expect.any(Object),
            redisKeyOwnerAddressInternational,
            false
          )

          expect(response.headers.location).toEqual(nextUrl)
        })
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce(JSON.stringify(singleAddress))
      })

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

      it('should display a validation error message if Address Line 1 is too long', async () => {
        postOptions.payload = {
          addressLine1: `${CharacterLimits.fourThousandCharacters}X`,
          townOrCity: 'London',
          postcode: 'SW1A 1AA'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.addressLine1,
          'Building and street information must have fewer than 4,000 characters'
        )
      })

      it('should display a validation error message if Address Line 2 is too long', async () => {
        postOptions.payload = {
          addressLine1: 'The Big House',
          addressLine2: `${CharacterLimits.fourThousandCharacters}X`,
          townOrCity: 'London',
          postcode: 'SW1A 1AA'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.addressLine2,
          'Field must have fewer than 4,000 characters'
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

      it('should display a validation error message if Town or City is too long', async () => {
        postOptions.payload = {
          addressLine1: 'The Big House',
          addressLine2: '',
          townOrCity: `${CharacterLimits.fourThousandCharacters}X`,
          postcode: 'SW1A 1AA'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.townOrCity,
          'Town or city must have fewer than 4,000 characters'
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
  TestHelper.createMocks()
}
