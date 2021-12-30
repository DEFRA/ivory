'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const CharacterLimits = require('../mock-data/character-limits')

describe('/why-is-item-rmi route', () => {
  let server
  const url = '/why-is-item-rmi'
  const nextUrl = '/ivory-age'

  const elementIds = {
    pageTitle: 'pageTitle',
    whyRmi: 'whyRmi',
    whyRmiSummary: 'whyRmiSummary',
    para1: 'para1',
    para2: 'para2',
    para3: 'para3',
    para4: 'para4',
    para5: 'para5',
    para6: 'para6',
    bullet1: 'bullet1',
    bullet2: 'bullet2',
    bullet3: 'bullet3',
    bullet4: 'bullet4',
    bullet5: 'bullet5',
    bullet6: 'bullet6',
    bullet7: 'bullet7',
    bullet8: 'bullet8',
    bullet9: 'bullet9',
    bullet10: 'bullet10',
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
    const rmiReason = 'RMI Reason'

    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockResolvedValue(rmiReason)

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
      expect(TestHelper.getTextContent(element)).toEqual(
        'Why is your item of outstandingly high artistic, cultural or historical value?'
      )
    })

    it('should have the correct page copy', () => {
      _checkElement(
        document,
        elementIds.para1,
        'Make your case in the text box below.'
      )

      _checkElement(
        document,
        elementIds.para2,
        'You can upload supporting documents later in this service. If you’d prefer to make your case within these documents, use the text box to summarise any documents you want to upload.'
      )

      _checkElement(
        document,
        `${elementIds.whyRmiSummary} .govuk-details__summary-text`,
        'What qualifies as ‘outstandingly high artistic, cultural or historical value’?'
      )

      _checkElement(
        document,
        elementIds.para3,
        'The item must have been made before 1 January 1918 and be:'
      )

      _checkElement(document, elementIds.bullet1, 'rare')

      _checkElement(
        document,
        elementIds.bullet2,
        'an important example of its type'
      )

      _checkElement(document, elementIds.bullet3, 'or both of the above')

      _checkElement(
        document,
        elementIds.para4,
        'An item that only has sentimental value would not qualify, regardless of how important it is to you personally.'
      )

      _checkElement(
        document,
        elementIds.para5,
        'Each item is assessed individually by recognised experts. They set a very high threshold when advising whether an item meets these criteria.'
      )

      _checkElement(
        document,
        elementIds.para6,
        'They’ll consider various things, such as whether an item:'
      )

      _checkElement(document, elementIds.bullet4, 'is unique or extremely rare')

      _checkElement(
        document,
        elementIds.bullet5,
        'is of high artistic or aesthetic quality, for example from a known artist, school or studio'
      )

      _checkElement(
        document,
        elementIds.bullet6,
        'is in better condition than other items like it'
      )

      _checkElement(
        document,
        elementIds.bullet7,
        'is part of a well-known collection'
      )

      _checkElement(document, elementIds.bullet8, 'has an important history')

      _checkElement(
        document,
        elementIds.bullet9,
        'is important to a specific place or region'
      )

      _checkElement(
        document,
        elementIds.bullet10,
        'has previously been recognised for its value or status, for example being recognised as a national treasure'
      )
    })

    it('should have the correct textarea', () => {
      const element = document.querySelector(`#${elementIds.whyRmi}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(rmiReason)
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
      it('should store the value in Redis and progress to the next route', async () => {
        const whyRmiReason = 'SOME REASON HERE'
        postOptions.payload.whyRmi = whyRmiReason

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          'why-is-item-rmi',
          whyRmiReason
        )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not enter the RMI reason', async () => {
        postOptions.payload.whyRmi = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'whyRmi',
          'whyRmi-error',
          'You must explain why your item is of outstandingly high artistic, cultural or historical value'
        )
      })

      it('should display a validation error message if the RMI reason is too long', async () => {
        postOptions.payload = {
          whyRmi: `${CharacterLimits.oneHundredThousandCharacters}X`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whyRmi,
          'Your description must have fewer than 100,000 characters'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}

const _checkElement = (document, id, expectedValue) => {
  const element = document.querySelector(`#${id}`)
  expect(element).toBeTruthy()
  expect(TestHelper.getTextContent(element)).toEqual(expectedValue)
}
