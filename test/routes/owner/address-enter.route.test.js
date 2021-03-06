'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

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
  const nextUrlApplicantContactDetails =
    '/user-details/applicant/contact-details'
  const nextUrlIntentionForItem = '/intention-for-item'

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

  describe('GET: Enter or Edit address', () => {
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

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: No address mode', () => {
      describe('Owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('Yes')
            .mockResolvedValueOnce(JSON.stringify([]))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for no addresses returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'No results, you will need to enter the address'
          )
        })

        it('should have the correct help text for no addresses returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If your business owns the item, give your business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: '',
            addressLine2: '',
            townOrCity: '',
            postcode: ''
          })
        })
      })

      describe('Not owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify([]))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for no addresses returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'No results, you will need to enter the address'
          )
        })

        it('should have the correct help text for no addresses returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If the owner is a business, give the business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: '',
            addressLine2: '',
            townOrCity: '',
            postcode: ''
          })
        })
      })
    })

    describe('GET: Single address mode', () => {
      describe('Owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('Yes')
            .mockResolvedValueOnce(JSON.stringify(singleAddress))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for 1 address returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Edit your address'
          )
        })

        it('should have the correct help text for 1 address returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If your business owns the item, give your business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: 'Buckingham Palace',
            addressLine2: 'Westminster',
            townOrCity: 'London',
            postcode: 'SW1A 1AA'
          })
        })
      })

      describe('Not owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify(singleAddress))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for 1 address returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            "Edit the owner's address"
          )
        })

        it('should have the correct help text for 1 address returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If the owner is a business, give the business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: 'Buckingham Palace',
            addressLine2: 'Westminster',
            townOrCity: 'London',
            postcode: 'SW1A 1AA'
          })
        })
      })
    })

    describe('GET: Multiple address mode', () => {
      describe('Owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('Yes')
            .mockResolvedValueOnce(JSON.stringify(multipleAddresses))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for multiple addresses returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Enter your address'
          )
        })

        it('should have the correct help text for multiple addresses returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If your business owns the item, give your business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: '',
            addressLine2: '',
            townOrCity: '',
            postcode: ''
          })
        })
      })

      describe('Not owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify(multipleAddresses))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for multiple addresses returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            "Enter the owner's address"
          )
        })

        it('should have the correct help text for multiple addresses returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If the owner is a business, give the business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: '',
            addressLine2: '',
            townOrCity: '',
            postcode: ''
          })
        })
      })
    })

    describe('GET: Too many addresses mode', () => {
      const maxAddressCount = 51
      const addresses = []
      beforeEach(async () => {
        for (let i = 0; i < maxAddressCount; i++) {
          addresses.push(singleAddress)
        }
      })

      describe('Owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('Yes')
            .mockResolvedValueOnce(JSON.stringify(addresses))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for too many addresses returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Too many results, you will need to enter the address'
          )
        })

        it('should have the correct help text for too many addresses returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If your business owns the item, give your business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: '',
            addressLine2: '',
            townOrCity: '',
            postcode: ''
          })
        })
      })

      describe('Not owned by applicant', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('No')
            .mockResolvedValueOnce(JSON.stringify(addresses))

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading for too many addresses returned', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} > legend > h1`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Too many results, you will need to enter the address'
          )
        })

        it('should have the correct help text for too many addresses returned', () => {
          const element = document.querySelector(`#${elementIds.helpText}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If the owner is a business, give the business address.'
          )
        })

        it('should have the correct form fields that are NOT be pre-populated with test data', () => {
          _checkFormFields(document, {
            addressLine1: '',
            addressLine2: '',
            townOrCity: '',
            postcode: ''
          })
        })
      })
    })
  })

  describe('POST', () => {
    let postOptions
    const redisKeyOwnerAddress = 'owner.address'
    const redisKeyApplicantAddress = 'applicant.address'

    beforeEach(async () => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success: Owned by applicant', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce(JSON.stringify(singleAddress))
          .mockResolvedValueOnce('Yes')
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
          redisKeyApplicantAddress,
          'A Big House, London, SW1A 1AA'
        )

        expect(response.headers.location).toEqual(nextUrlIntentionForItem)
      })
    })

    describe('Success: Not owned by applicant', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('No')
          .mockResolvedValueOnce(JSON.stringify(singleAddress))
          .mockResolvedValueOnce('No')
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

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKeyOwnerAddress,
          'A Big House, London, SW1A 1AA'
        )

        expect(response.headers.location).toEqual(
          nextUrlApplicantContactDetails
        )
      })
    })

    describe('Failure: address-enter', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce(JSON.stringify(singleAddress))
          .mockResolvedValueOnce('Yes')
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
  RedisService.set = jest.fn()
}
