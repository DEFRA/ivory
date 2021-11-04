'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const TestHelper = require('../../utils/test-helper')

const CharacterLimits = require('../../mock-data/character-limits')

describe('user-details/owner/contact-details route', () => {
  let server
  const url = '/user-details/owner/contact-details'
  const nextUrl = '/user-details/owner/address-find'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    fullName: 'fullName',
    businessName: 'businessName',
    hasEmailAddress: 'hasEmailAddress',
    hasEmailAddress2: 'hasEmailAddress-2',
    emailAddress: 'emailAddress',
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

    describe('GET: Non-business option', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce('An individual')

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
          'Owner’s contact details'
        )
      })

      it('should have the help text', () => {
        const element = document.querySelector(`#${elementIds.helpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You must have the owner’s permission to act on their behalf.'
        )
      })

      it('should have the "Full name" form field', () => {
        TestHelper.checkFormField(document, elementIds.fullName, 'Full name')
      })

      it('should have the correct radio buttons', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.hasEmailAddress,
          'Yes',
          'Yes',
          false
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.hasEmailAddress2,
          'No',
          'No'
        )
      })

      it('should have the "Email address" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.emailAddress,
          'Email address'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: "A business" option', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce('A business')

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the "Full name or business name" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.businessName,
          'Business name'
        )
      })
    })

    describe('GET: "Another business" option', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce('A business')

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the "Full name or business name" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.businessName,
          'Business name'
        )
      })
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

    describe('Success', () => {
      describe('Non-business option', () => {
        beforeEach(() => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce('An individual')
        })

        it('should store the value in Redis and progress to the next route when all fields have been entered correctly', async () => {
          postOptions.payload = {
            fullName: 'Joe Bloggs',
            hasEmailAddress: 'Yes',
            emailAddress: 'joe.bloggs@somewhere.com'
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
            'owner.contact-details',
            JSON.stringify(postOptions.payload)
          )

          expect(response.headers.location).toEqual(nextUrl)
        })
      })

      describe('Business option', () => {
        beforeEach(() => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce('Another business')
        })

        it('should store the value in Redis and progress to the next route when all fields have been entered correctly', async () => {
          postOptions.payload = {
            fullName: 'Joe Bloggs',
            hasEmailAddress: 'No'
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
            'owner.contact-details',
            JSON.stringify(postOptions.payload)
          )

          expect(response.headers.location).toEqual(nextUrl)
        })
      })
    })

    describe('Failure', () => {
      describe('Non-business option', () => {
        beforeEach(() => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce('An individual')
        })

        it('should display a validation error message if the user does not enter the full name', async () => {
          postOptions.payload = {
            fullName: '',
            hasEmailAddress: 'Yes',
            emailAddress: 'some-email@somewhere.com'
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.fullName,
            'Enter the owner’s full name'
          )
        })

        it('should display a validation error message if the full name is too long', async () => {
          postOptions.payload = {
            fullName: `${CharacterLimits.fourThousandCharacters}X`,
            hasEmailAddress: 'Yes',
            emailAddress: 'some-email@somewhere.com'
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.fullName,
            'Full name must have fewer than 4,000 characters'
          )
        })

        it('should display a validation error message if the user does not specify if there is an owner email address', async () => {
          postOptions.payload = {
            fullName: 'Joe Bloggs',
            hasEmailAddress: '',
            emailAddress: ''
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.hasEmailAddress,
            'Enter the owner’s email address or select ‘no’'
          )
        })

        it('should display a validation error message if the user does not enter the email address', async () => {
          postOptions.payload = {
            fullName: 'Joe Bloggs',
            hasEmailAddress: 'Yes',
            emailAddress: ''
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.emailAddress,
            'Enter the owner’s email address'
          )
        })

        it('should display a validation error message if the user does not enter an email address in a valid format', async () => {
          postOptions.payload = {
            fullName: 'Joe Bloggs',
            hasEmailAddress: 'Yes',
            emailAddress: 'invalid-email@'
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.emailAddress,
            'Enter an email address in the correct format, like name@example.com'
          )
        })

        it('should display a validation error message if the email address is too long', async () => {
          postOptions.payload = {
            fullName: 'Joe Bloggs',
            hasEmailAddress: 'Yes',
            emailAddress: `${CharacterLimits.fourThousandCharacters}@somewhere.com`
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.emailAddress,
            'Email address must have fewer than 4,000 characters'
          )
        })
      })

      describe('Business option', () => {
        beforeEach(() => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce('A business')
        })

        it('should display a validation error message if the user does not enter the business name', async () => {
          postOptions.payload = {
            businessName: '',
            hasEmailAddress: 'Yes',
            emailAddress: 'some-email@somewhere.com'
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.businessName,
            'Enter the owner’s business name'
          )
        })

        it('should display a validation error message if the business name is too long', async () => {
          postOptions.payload = {
            businessName: `${CharacterLimits.fourThousandCharacters}X`,
            hasEmailAddress: 'Yes',
            emailAddress: 'some-email@somewhere.com'
          }
          await TestHelper.checkFormFieldValidation(
            postOptions,
            server,
            elementIds.businessName,
            'Business name must have fewer than 4,000 characters'
          )
        })
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
