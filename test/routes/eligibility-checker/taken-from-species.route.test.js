'use strict'

const TestHelper = require('../../utils/test-helper')
const { ItemType, Species } = require('../../../server/utils/constants')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const { RedisKeys } = require('../../../server/utils/constants')

describe('/eligibility-checker/taken-from-species route', () => {
  let server
  const url = '/eligibility-checker/taken-from-species'
  const nextUrlAppliedBefore = '/applied-before'
  const nextUrlCannotTrade = '/eligibility-checker/cannot-trade'
  const nextUrlCanContinue = '/can-continue'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    takenFromSpecies: 'takenFromSpecies',
    takenFromSpecies2: 'takenFromSpecies-2',
    takenFromSpecies3: 'takenFromSpecies-3',
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
        `Was the replacement ivory taken from the ${mockSpecies.toLowerCase()} on or after 1 January 1975?`
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.takenFromSpecies,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.takenFromSpecies2,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.takenFromSpecies3,
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
          nextUrlCannotTrade
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
        postOptions.payload.takenFromSpecies = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'takenFromSpecies',
          'takenFromSpecies-error',
          `You must tell us whether the replacement ivory was taken from the ${mockSpecies.toLowerCase()} on or after 1 January 1975`
        )
      })
    })
  })
})

const mockSpecies = Species.HIPPOPOTAMUS

const _createMocks = () => {
  TestHelper.createMocks()

  RedisService.get = jest.fn((request, redisKey) => {
    const mockDataMap = {
      [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
      [RedisKeys.WHAT_SPECIES]: mockSpecies
    }
    return mockDataMap[redisKey]
  })
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  isSection2 = false
) => {
  postOptions.payload.takenFromSpecies = selectedOption

  if (isSection2) {
    RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)
  } else {
    RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSICAL)
  }

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
