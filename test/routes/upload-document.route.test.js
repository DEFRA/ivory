'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/upload-document route', () => {
  let server
  const url = '/upload-document'
  const nextUrl = '/your-documents'

  const elementIds = {
    pageTitle: 'pageTitle',
    files: 'files',
    insetHelpText: 'insetHelpText',
    helpText1: 'helpText1',
    helpText2: 'helpText2',
    helpText3: 'helpText3',
    helpTextSubHeading: 'helpTextSubHeading',
    continue: 'continue',
    cancel: 'cancel'
  }

  const tempFolder = '/var/folders/tmp'

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

    describe('GET: No documents', () => {
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
          'Add a document to support your case'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You must add files one at a time, up to a total of 6.'
        )

        element = document.querySelector(`#${elementIds.insetHelpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Be careful not to upload too much material, as this could affect how long it takes an assessor to review it.'
        )

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'The document must be:'
        )

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(1)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'a PDF or Microsoft Word document'
        )

        element = document.querySelector(`#${elementIds.helpTextSubHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Upload file')

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'The document must be:'
        )

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(1)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'a PDF or Microsoft Word document'
        )

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(2)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('smaller than 30mb')
      })

      it('should have the file chooser', () => {
        const element = document.querySelector(`#${elementIds.files}`)
        expect(element).toBeTruthy()
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })

      it('should not have the Cancel link', () => {
        const element = document.querySelector(`#${elementIds.cancel}`)
        expect(element).toBeFalsy()
      })
    })

    describe('GET: Existing documents', () => {
      beforeEach(async () => {
        const mockData = {
          files: ['document1.pdf', 'document2.doc'],
          fileData: [],
          fileSizes: [100, 200]
        }
        RedisService.get = jest.fn().mockResolvedValue(JSON.stringify(mockData))

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
          'Add another document'
        )
      })

      it('should have the correct help text', () => {
        TestHelper.checkElementsDoNotExist(document, [
          `#${elementIds.helpText1}`,
          `#${elementIds.insetHelpText}`
        ])

        const element = document.querySelector(
          `#${elementIds.helpTextSubHeading}`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Upload file')

        TestHelper.checkElementsExist(document, [
          `#${elementIds.helpText2}`,
          `#${elementIds.helpText3} > li:nth-child(1)`,
          `#${elementIds.helpText3} > li:nth-child(2)`
        ])
      })

      it('should have the file chooser', () => {
        const element = document.querySelector(`#${elementIds.files}`)
        expect(element).toBeTruthy()
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })

      it('should have the Cancel link', () => {
        const element = document.querySelector(`#${elementIds.cancel}`)
        TestHelper.checkLink(
          element,
          'Cancel and return to ‘Your documents‘',
          '/your-documents'
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
      // This test is failing as it has not yet been possible to successfully mock fs.promises.readFile without breaking the server
      it.skip('should store the images in Redis and progress to the next route', async () => {
        postOptions.payload.files = {
          path: tempFolder,
          bytes: 37474,
          filename: 'image1.png',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="image1.png"',
            'content-type': 'image/png'
          }
        }

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(RedisService.set).toBeCalledTimes(1)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select a file', async () => {
        const payloadFile = {
          path: tempFolder,
          bytes: 0,
          headers: {
            'content-disposition': 'form-data; name="files"; filename=""',
            'content-type': 'application/octet-stream'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'You must choose a file to upload'
        )
      })

      it('should display a validation error message if the user selects more than one file', async () => {
        const payloadFiles = [
          {
            path: tempFolder,
            bytes: 197310,
            filename: 'image1.jpeg',
            headers: {
              'content-disposition':
                'form-data; name="files"; filename="image1.jpeg"',
              'content-type': 'image/jpeg'
            }
          },
          {
            path: tempFolder,
            bytes: 153090,
            filename: 'image2.png',
            headers: {
              'content-disposition':
                'form-data; name="files"; filename="image2.png"',
              'content-type': 'image/jpeg'
            }
          }
        ]
        await _checkValidation(
          server,
          postOptions,
          payloadFiles,
          'Files must be uploaded one at a time'
        )
      })

      it('should display a validation error message if the user tries to upload an empty file', async () => {
        const payloadFile = {
          path: tempFolder,
          bytes: 0,
          filename: 'image1.jpeg',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="image1.jpeg"',
            'content-type': 'image/jpeg'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'The file cannot be empty'
        )
      })

      // This test is failing as it has not yet been possible to successfully mock fs.promises.readFile without breaking the server
      it.skip('should NOT display a validation error message if the user uploads a file that is less than the maximum allowed file size', async () => {
        const payloadFile = {
          path: tempFolder,
          bytes: 32 * 1024 * 1024,
          filename: 'image1.jpeg',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="image1.jpeg"',
            'content-type': 'image/jpeg'
          }
        }
        postOptions.payload.files = payloadFile
        await TestHelper.submitPostRequest(server, postOptions, 302)
      })

      it('should display a validation error message if the user tries to upload a file that is not the correct type', async () => {
        const payloadFile = {
          path: tempFolder,
          bytes: 5000,
          filename: 'image1.png',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="image1.png"',
            'content-type': 'image/png'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'The file must be a PDF or Microsoft Word document (.DOC or .DOCX)'
        )
      })
    })
  })

  describe('POST: Duplicate file validation', () => {
    let postOptions
    let response

    beforeEach(async () => {
      postOptions = {
        method: 'POST',
        url,
        payload: {
          files: {
            path: tempFolder,
            bytes: 100,
            filename: 'document1.pdf',
            headers: {
              'content-disposition':
                'form-data; name="files"; filename="document1.pdf"',
              'content-type': 'application/pdf'
            }
          }
        }
      }

      const mockData = {
        files: ['document1.pdf'],
        fileData: [],
        fileSizes: [100]
      }
      RedisService.get = jest.fn().mockReturnValue(JSON.stringify(mockData))

      response = await TestHelper.submitPostRequest(server, postOptions, 400)
    })

    it('should display a validation error message if the user tries to upload a duplicate file', async () => {
      const payloadFile = {
        path: tempFolder,
        bytes: 100,
        headers: {
          'content-disposition':
            'form-data; name="files"; filename="document1.pdf"',
          'content-type': 'application/octet-stream'
        }
      }

      postOptions.payload.files = payloadFile

      await TestHelper.checkValidationError(
        response,
        'files',
        'files-error',
        "You've already uploaded that document. Choose a different one"
      )
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  const mockData = {
    files: [],
    fileData: [],
    fileSizes: [100, 200],
    thumbnails: [],
    thumbnailData: []
  }
  RedisService.get = jest
    .fn()
    .mockResolvedValueOnce(JSON.stringify(mockData))
    .mockResolvedValueOnce('false')
    .mockResolvedValueOnce(JSON.stringify(mockData))
}

const _checkValidation = async (
  server,
  postOptions,
  payloadFile,
  expectedError
) => {
  postOptions.payload.files = payloadFile
  const response = await TestHelper.submitPostRequest(server, postOptions, 400)
  await TestHelper.checkValidationError(
    response,
    'files',
    'files-error',
    expectedError
  )
}
