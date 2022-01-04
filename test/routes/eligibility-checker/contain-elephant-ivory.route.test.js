'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const TestHelper = require('../../utils/test-helper')
const { Options, RedisKeys } = require('../../../server/utils/constants')

describe('/eligibility-checker/contain-elephant-ivory route', () => {
  let server
  const url = '/eligibility-checker/contain-elephant-ivory'
  const nextUrlSellingToMuseum = '/eligibility-checker/selling-to-museum'
  const nextUrlDoNotNeedService = '/eligibility-checker/do-not-need-service'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    containElephantIvory: 'containElephantIvory',
    containElephantIvory2: 'containElephantIvory-2',
    containElephantIvory3: 'containElephantIvory-3',
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

    beforeEach(async () => {
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
        'Does your item contain elephant ivory?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Any ivory in your item must be ‘worked’ ivory. This means it has been carved or significantly altered from its original raw state in some way.'
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector('.govuk-details__summary-text')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'How do I know if my ivory is elephant ivory?'
      )
    })

    it('should have some summary text details', () => {
      const element = document.querySelector('.govuk-details__text')
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.containElephantIvory,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.containElephantIvory2,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.containElephantIvory3,
        'I don’t know',
        'I don’t know'
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
      it('should progress to the next route when the first option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Yes',
          nextUrlSellingToMuseum
        )
      })

      it('should progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlDoNotNeedService
        )
      })

      it('should progress to the next route when the third option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'I don’t know',
          nextUrlCannotContinue
        )
      })

      describe('Failure', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          postOptions.payload.containElephantIvory = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'containElephantIvory',
            'containElephantIvory-error',
            'Tell us whether your item contains elephant ivory'
          )
        })
      })
    })
  })
})

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl
) => {
  postOptions.payload.containElephantIvory = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(
    selectedOption === Options.NO ? 2 : 1
  )

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.CONTAIN_ELEPHANT_IVORY,
    selectedOption
  )

  if (selectedOption === Options.NO) {
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      RedisKeys.ARE_YOU_A_MUSEUM,
      false
    )
  }

  expect(response.headers.location).toEqual(nextUrl)
}

const _createMocks = () => {
  TestHelper.createMocks()
}
