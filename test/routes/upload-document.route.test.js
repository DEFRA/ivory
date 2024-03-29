'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/antimalware.service')
const AntimalwareService = require('../../server/services/antimalware.service')

jest.mock('pdf-lib')
const { PDFDocument } = require('pdf-lib')

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

    describe('GET: No files', () => {
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
          'Add evidence to support your case'
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

        element = document.querySelector(`#${elementIds.helpTextSubHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Upload file')

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Files must be:')

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(1)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('PDF')

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(2)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Microsoft Word document (.DOC or .DOCX)'
        )

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(3)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'an image file (JPG or PNG)'
        )

        element = document.querySelector(
          `#${elementIds.helpText3} > li:nth-child(4)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('smaller than 10MB')
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
          fileSizes: [100, 200]
        }
        RedisService.get = jest.fn().mockResolvedValue(mockData)

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
        expect(TestHelper.getTextContent(element)).toEqual('Add another file')
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
          'Cancel and return to ‘Your supporting evidence‘',
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
      it.skip('should store the documents in Redis and progress to the next route', async () => {
        postOptions.payload.files = {
          path: tempFolder,
          bytes: 37474,
          filename: 'document1.pdf',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="document1.pdf"',
            'content-type': 'application/pdf'
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
            filename: 'document1.pdf',
            headers: {
              'content-disposition':
                'form-data; name="files"; filename="document1.pdf"',
              'content-type': 'application/pdf'
            }
          },
          {
            path: tempFolder,
            bytes: 153090,
            filename: 'document1.pdf',
            headers: {
              'content-disposition':
                'form-data; name="files"; filename="document1.pdf"',
              'content-type': 'application/pdf'
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
          filename: 'document1.pdf',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="document1.pdf"',
            'content-type': 'application/pdf'
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
          filename: 'document1.pdf',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="document1.pdf"',
            'content-type': 'application/pdf'
          }
        }
        postOptions.payload.files = payloadFile
        await TestHelper.submitPostRequest(server, postOptions, 302)
      })

      it('should display a validation error message if the user tries to upload a file that is not the correct type', async () => {
        const payloadFile = {
          path: tempFolder,
          bytes: 5000,
          filename: 'file.txt',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="file.txt"',
            'content-type': 'image/png'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'The file must be a PDF, Microsoft Word document (.DOC or .DOCX) or image file'
        )
      })

      it('should display a validation error message if the user tries to upload a virus', async () => {
        AntimalwareService.scan = jest.fn().mockResolvedValue('OMG a virus!')
        const payloadFile = {
          path: tempFolder,
          bytes: 100,
          filename: 'document1.pdf',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="document1.pdf"',
            'content-type': 'application/pdf'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'The file could not be uploaded - try a different one'
        )
      })

      // This test is failing as it has not yet been possible to successfully mock fs.promises.readFile without breaking the server
      it.skip('should display a validation error message if the user tries to upload a password protected PDF file', async () => {
        PDFDocument.load = jest.fn().mockImplementation(() => {
          throw new Error('The file is encrypted')
        })

        const payloadFile = {
          path: tempFolder,
          bytes: 5000,
          filename: 'file.png',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="file.png"',
            'content-type': 'image/png'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'The file could not be uploaded - try a different one'
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
        fileSizes: [100]
      }
      RedisService.get = jest.fn().mockReturnValue(mockData)

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
        "You've already uploaded that file. Choose a different one"
      )
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  const mockData = {
    files: [],
    fileSizes: [100, 200],
    thumbnails: [],
    thumbnailData: []
  }
  RedisService.get = jest
    .fn()
    .mockResolvedValueOnce(mockData)
    .mockResolvedValueOnce('false')
    .mockResolvedValueOnce(mockData)

  AntimalwareService.scan = jest.fn().mockResolvedValue(false)
}

const _checkValidation = async (
  server,
  postOptions,
  payloadFile,
  expectedError,
  errorCode = 400
) => {
  postOptions.payload.files = payloadFile
  const response = await TestHelper.submitPostRequest(
    server,
    postOptions,
    errorCode
  )
  await TestHelper.checkValidationError(
    response,
    'files',
    'files-error',
    expectedError
  )
}
