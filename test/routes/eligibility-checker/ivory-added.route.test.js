'use strict'

const TestHelper = require('../../utils/test-helper')
const { ItemType } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

describe('/eligibility-checker/ivory-added route', () => {
  let server
  const url = '/eligibility-checker/ivory-added'
  const nextUrlAppliedBefore = '/applied-before'
  const nextUrlTakeFromSpecies = '/eligibility-checker/taken-from-species'
  const nextUrlCanContinue = '/can-continue'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    ivoryAdded: 'ivoryAdded',
    ivoryAdded2: 'ivoryAdded-2',
    ivoryAdded3: 'ivoryAdded-3',
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
      const element = document.querySelector('.govuk-fieldset__legend')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Has any ivory been added since 1 January 1975 to restore the item to its original state?'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(document, elementIds.ivoryAdded, 'Yes', 'Yes')

      TestHelper.checkRadioOption(document, elementIds.ivoryAdded2, 'No', 'No')

      TestHelper.checkRadioOption(
        document,
        elementIds.ivoryAdded3,
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
      it('should progress to the next route when "Yes" has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Yes',
          nextUrlTakeFromSpecies
        )
      })

      it('should progress to the next route when "No" has been selected: Section 10 item', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlCanContinue
        )
      })

      it('should progress to the next route when "No" has been selected: Section 2 item', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlAppliedBefore,
          true
        )
      })

      it('should progress to the next route when "I dont know" has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'I don’t know',
          nextUrlCannotContinue
        )
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select an item', async () => {
        postOptions.payload.ivoryAdded = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'ivoryAdded',
          'ivoryAdded-error',
          'You must tell us if any ivory has been added to the item since 1 January 1975'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  isSection2 = false
) => {
  postOptions.payload.ivoryAdded = selectedOption

  if (isSection2) {
    RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)
  } else {
    RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSICAL)
  }

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
