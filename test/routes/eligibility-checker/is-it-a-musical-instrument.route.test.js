'use strict'

const createServer = require('../../../server')

jest.mock('../../../server/services/cookie.service')
const CookieService = require('../../../server/services/cookie.service')

const TestHelper = require('../../utils/test-helper')

describe('/eligibility-checker/is-it-a-musical-instrument route', () => {
  let server
  const url = '/eligibility-checker/is-it-a-musical-instrument'
  const nextUrlMadeBefore1975 = '/eligibility-checker/made-before-1975'
  const nextUrlLessThan10Ivory = '/eligibility-checker/less-than-10-ivory'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpText2: 'helpText2',
    helpTextList: 'helpTextList',
    isItAMusicalInstrument: 'isItAMusicalInstrument',
    isItAMusicalInstrument2: 'isItAMusicalInstrument-2',
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
        'Is your item a musical instrument?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'This includes accessories used to play a musical instrument, like a violin bow, although these must be registered as separate items.'
      )
    })

    it('should have the correct help text2', () => {
      const element = document.querySelector(`#${elementIds.helpText2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'This does not include:'
      )
    })

    it('should have a help text list', () => {
      const element = document.querySelector(`#${elementIds.helpTextList}`)
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.isItAMusicalInstrument,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.isItAMusicalInstrument2,
        'No',
        'No'
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
          nextUrlMadeBefore1975
        )
      })

      it('should progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlLessThan10Ivory
        )
      })

      describe('Failure', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          postOptions.payload.isItAMusicalInstrument = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'isItAMusicalInstrument',
            'isItAMusicalInstrument-error',
            'Tell us whether your item is a musical instrument'
          )
        })
      })
    })
  })
})

const _createMocks = () => {
  CookieService.checkSessionCookie = jest
    .fn()
    .mockReturnValue('THE_SESSION_COOKIE')
}

const _checkSelectedRadioAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl
) => {
  postOptions.payload.isItAMusicalInstrument = selectedOption

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
