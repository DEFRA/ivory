'use strict'

jest.mock('randomstring')
const RandomString = require('randomstring')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const TestHelper = require('../../utils/test-helper')
const {
  Options,
  RedisKeys,
  Species
} = require('../../../server/utils/constants')

describe('/eligibility-checker/contain-elephant-ivory route', () => {
  let server
  const url = '/eligibility-checker/contain-elephant-ivory'
  const nextUrlSellingToMuseum = '/eligibility-checker/selling-to-museum'
  const nextUrlWhatSpecies = '/eligibility-checker/what-species'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpText2: 'helpText2',
    helpText3: 'helpText3',
    helpText4: 'helpText4',
    helpTextList: 'helpTextList',
    containElephantIvory: 'containElephantIvory',
    containElephantIvory2: 'containElephantIvory-2',
    containElephantIvory3: 'containElephantIvory-3',
    guidance: 'guidance',
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
        'Any ivory in your item must be ‘worked’ ivory. This means it has been carved or significantly altered from its original raw state.'
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector('.govuk-details__summary-text')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'How do I know if my ivory is elephant ivory?'
      )
    })

    it('should have the correct help text 2', () => {
      const element = document.querySelector(`#${elementIds.helpText2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Elephant ivory is the most common type of ivory. However it can be extremely difficult to tell the difference between elephant ivory and:'
      )
    })

    it('should display the correct help text list items', () => {
      let element = document.querySelector(
        `#${elementIds.helpTextList} > li:nth-child(1)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'other types of ivory, such as walrus'
      )

      element = document.querySelector(
        `#${elementIds.helpTextList} > li:nth-child(2)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'fake ivory, such as ivorine'
      )

      element = document.querySelector(
        `#${elementIds.helpTextList} > li:nth-child(3)`
      )
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'certain types of animal bone'
      )
    })

    it('should have the correct help text 3', () => {
      const element = document.querySelector(`#${elementIds.helpText3}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'There are methods available that can help determine the species of ivory, such as using ‘Schregar lines’, but these methods are often destructive to ivory. The Convention on International Trade in Endangered species of Wild Fauna and Flora (CITES) has guidance on identifying ivory (opens in a new tab)'
      )
    })

    it('should have the correct help text 4', () => {
      const element = document.querySelector(`#${elementIds.helpText4}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you are not sure what type of ivory the item you want to sell or buy contains, you should speak to an expert first. An expert might be an antiques dealer or auctioneer who specialises in ivory.'
      )
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

    it('should have the correct "guidance" link', () => {
      const element = document.querySelector(`#${elementIds.guidance}`)
      TestHelper.checkLink(
        element,
        'guidance on identifying ivory (opens in a new tab)',
        'https://www.gov.uk/guidance/dealing-in-items-containing-ivory-or-made-of-ivory'
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
          nextUrlWhatSpecies
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

  let expectedNumberOfCalls
  if (selectedOption === Options.YES) {
    expectedNumberOfCalls = 4
  } else if (selectedOption === Options.NO) {
    expectedNumberOfCalls = 4
  } else {
    expectedNumberOfCalls = 3
  }

  expect(RedisService.set).toBeCalledTimes(expectedNumberOfCalls)

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.SUBMISSION_REFERENCE,
    submissionReference
  )

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.USED_CHECKER,
    true
  )

  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    RedisKeys.CONTAIN_ELEPHANT_IVORY,
    selectedOption
  )

  if (selectedOption === Options.YES) {
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      RedisKeys.WHAT_SPECIES,
      Species.ELEPHANT
    )
  } else if (selectedOption === Options.NO) {
    expect(RedisService.set).toBeCalledWith(
      expect.any(Object),
      RedisKeys.ARE_YOU_A_MUSEUM,
      false
    )
  }

  expect(response.headers.location).toEqual(nextUrl)
}

const submissionReference = 'ABCDEF'

const _createMocks = () => {
  TestHelper.createMocks()

  RedisService.get = jest.fn().mockResolvedValue(null)
  RandomString.generate = jest.fn().mockReturnValue(submissionReference)
}
