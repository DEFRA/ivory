'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../../utils/test-helper.js';
import RedisService from '../../../server/services/redis.service.js';
import CharacterLimits from '../../mock-data/character-limits.js';
jest.mock('./server/services/redis.service.js')

describe('user-details/applicant/contact-details route', () => {
  let server
  const url = '/user-details/applicant/contact-details'
  const nextUrl = '/user-details/applicant/address-find'

  const elementIds = {
    pageTitle: 'pageTitle',
    fullName: 'fullName',
    businessName: 'businessName',
    emailAddress: 'emailAddress',
    confirmEmailAddress: 'confirmEmailAddress',
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

    describe('GET: Does not work for a business', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('No')
          .mockResolvedValueOnce({})

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
          'Your contact details'
        )
      })

      it('should have the "Full name" form field', () => {
        TestHelper.checkFormField(document, elementIds.fullName, 'Full name')
      })

      it('should have NOT the "Business name" form field', () => {
        const element = document.querySelector(`#${elementIds.businessName}`)
        expect(element).toBeFalsy()
      })

      it('should have the "Email address" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.emailAddress,
          'Email address'
        )
      })

      it('should have the "Confirm email address" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.confirmEmailAddress,
          'Confirm email address'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Works for a business', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce({})

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the "Business name" form field', () => {
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
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce({})
      })

      it('should store the value in Redis and progress to the next route when all fields have been entered correctly', async () => {
        postOptions.payload = {
          fullName: 'Joe Bloggs',
          businessName: 'ABC Limited',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
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
          'applicant.contact-details',
          JSON.stringify(postOptions.payload)
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('Yes')
          .mockResolvedValueOnce({})
      })

      it('should display a validation error message if the user does not enter the full name', async () => {
        postOptions.payload = {
          fullName: '',
          businessName: 'ABC Limited',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.fullName,
          'Enter your full name'
        )
      })

      it('should display a validation error message if the full name is too long', async () => {
        postOptions.payload = {
          fullName: `${CharacterLimits.fourThousandCharacters}X`,
          businessName: 'ABC Limited',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.fullName,
          'Name must have fewer than 4,000 characters'
        )
      })

      it('should display a validation error message if the user does not enter the email address', async () => {
        postOptions.payload = {
          fullName: 'Joe Bloggs',
          businessName: 'ABC Limited',
          emailAddress: '',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.emailAddress,
          'Enter your email address'
        )
      })

      it('should display a validation error message if the user does not enter an email address in a valid format', async () => {
        postOptions.payload = {
          fullName: 'Joe Bloggs',
          businessName: 'ABC Limited',
          emailAddress: 'invalid-email@',
          confirmEmailAddress: 'some-email@somewhere.com'
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
          businessName: 'ABC Limited',
          emailAddress: `${CharacterLimits.fourThousandCharacters}@somewhere.com`,
          confirmEmailAddress: `${CharacterLimits.fourThousandCharacters}@somewhere.com`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.emailAddress,
          'Email address must have fewer than 4,000 characters'
        )
      })

      it('should display a validation error message if the user does not confirm their email address', async () => {
        postOptions.payload = {
          fullName: 'Joe Bloggs',
          businessName: 'ABC Limited',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.confirmEmailAddress,
          'You must confirm your email address'
        )
      })

      it('should display a validation error message if the email addresses do not match', async () => {
        postOptions.payload = {
          fullName: 'Joe Bloggs',
          businessName: 'ABC Limited',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-other-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.confirmEmailAddress,
          'This confirmation does not match your email address'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
