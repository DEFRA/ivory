'use strict'

const TestHelper = require('../utils/test-helper')

describe('/want-to-add-documents route', () => {
  let server
  const url = '/want-to-add-documents'
  const nextUrlUploadDocument = '/upload-document'
  const nextUrWhoOwnsItem = '/who-owns-the-item'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpTextList: 'helpTextList',
    wantToAddDocuments: 'wantToAddDocuments',
    wantToAddDocuments2: 'wantToAddDocuments-2',
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
        'Do you want to add any documents to support your application?'
      )
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.wantToAddDocuments,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.wantToAddDocuments2,
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
          nextUrlUploadDocument
        )
      })

      it('should progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrWhoOwnsItem,
          'Item to be sold or hired out to a qualifying museum'
        )
      })

      describe('Failure', () => {
        it('should display a validation error message if the user does not select an item', async () => {
          postOptions.payload.wantToAddDocuments = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'wantToAddDocuments',
            'wantToAddDocuments-error',
            'You must tell us if you want to add any documents to support your application'
          )
        })
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
  nextUrl
) => {
  postOptions.payload.wantToAddDocuments = selectedOption

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
