'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const CharacterLimits = require('../../mock-data/character-limits')

describe('user-details/applicant/contact-details route', () => {
  let server
  const url = '/user-details/applicant/contact-details'
  const nextUrl = '/user-details/applicant/address-find'

  const elementIds = {
    pageTitle: 'pageTitle',
    name: 'name',
    ownerApplicant: {
      businessName: 'businessName'
    },
    emailAddress: 'emailAddress',
    confirmEmailAddress: 'confirmEmailAddress',
    continue: 'continue'
  }

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

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockResolvedValue('Yes')

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
      expect(TestHelper.getTextContent(element)).toEqual('Your contact details')
    })

    it('should have the "Full name" form field', () => {
      TestHelper.checkFormField(document, elementIds.name, 'Full name')
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
        RedisService.get = jest.fn().mockResolvedValue('No')
      })

      it('should store the value in Redis and progress to the next route when all fields have been entered correctly', async () => {
        postOptions.payload = {
          name: 'some-value',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
        }

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          302
        )

        expect(RedisService.set).toBeCalledTimes(2)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue('Yes')
      })

      it('should display a validation error message if the user does not enter the full name', async () => {
        postOptions.payload = {
          name: '',
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.name,
          'Enter your full name'
        )
      })

      it('should display a validation error message if the full name is too long', async () => {
        postOptions.payload = {
          name: `${CharacterLimits.fourThousandCharacters}X`,
          emailAddress: 'some-email@somewhere.com',
          confirmEmailAddress: 'some-email@somewhere.com'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.name,
          'Name must have fewer than 4,000 characters'
        )
      })

      it('should display a validation error message if the user does not enter the email address', async () => {
        postOptions.payload = {
          name: 'some-value',
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
          name: 'some-value',
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
          name: 'some-value',
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
          name: 'some-value',
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
          name: 'some-value',
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
  RedisService.set = jest.fn()
}
