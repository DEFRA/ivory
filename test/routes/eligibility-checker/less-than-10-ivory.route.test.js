'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

describe('/eligibility-checker/less-than-10-ivory route', () => {
  let server
  const url = '/eligibility-checker/less-than-10-ivory'
  const nextUrlMadeBefore1947 = '/eligibility-checker/made-before-1947'
  const nextUrlIsItAPortraitMiniature =
    '/eligibility-checker/is-it-a-portrait-miniature'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    callOutText: 'callOutText',
    helpText: 'helpText',
    helpText2: 'helpText2',
    helpText3: 'helpText3',
    lessThan10Ivory: 'lessThan10Ivory',
    lessThan10Ivory2: 'lessThan10Ivory-2',
    lessThan10Ivory3: 'lessThan10Ivory-3',
    continue: 'continue'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
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
        'Is your item less than 10% ivory?'
      )
    })

    it('should have the correct call out text', () => {
      const element = document.querySelector(`#${elementIds.callOutText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'The ivory must be integral to the design or function of the item.'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You must give a reasonable assessment of the volume of ivory in your item. In some cases, it’s easy to do this by eye. In others, you’ll need to take measurements.'
      )
    })

    it('should have the correct help2 text', () => {
      const element = document.querySelector(`#${elementIds.helpText2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If it’s difficult to do this without damaging the item, you can make an assessment based on knowledge of similar items.'
      )
    })

    it('should have the correct help3 text', () => {
      const element = document.querySelector(`#${elementIds.helpText3}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Do not include any empty spaces, for instance, the space within a chest of drawers or a teapot.'
      )
    })

    it('should have the correct summary text title', () => {
      const element = document.querySelector('.govuk-details__summary-text')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'What kinds of item have less than 10% ivory?'
      )
    })

    it('should have some summary text details', () => {
      const element = document.querySelector('.govuk-details__text')
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.lessThan10Ivory,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.lessThan10Ivory2,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.lessThan10Ivory3,
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
          nextUrlMadeBefore1947
        )
      })

      it('should progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlIsItAPortraitMiniature
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
          postOptions.payload.lessThan10Ivory = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'lessThan10Ivory',
            'lessThan10Ivory-error',
            'Tell us whether your item is less than 10% ivory'
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
  postOptions.payload.lessThan10Ivory = selectedOption

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
