'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../utils/test-helper.js';

jest.mock('./server/services/redis.service.js')
import RedisService from '../../server/services/redis.service.js';

jest.mock('./server/services/antimalware.service')
import AntimalwareService from '../../server/services/antimalware.service';

describe('/upload-photo route', () => {
  let server
  const url = '/upload-photo'
  const nextUrl = '/your-photos'

  const elementIds = {
    pageTitle: 'pageTitle',
    files: 'files',
    helpText1: 'helpText1',
    helpText2: 'helpText2',
    helpText3: 'helpText3',
    helpText4: 'helpText4',
    helpText5: 'helpText5',
    helpText6: 'helpText6',
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

    describe('GET: No photos', () => {
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
          'Add a photo of your item'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You must add photos one at a time, up to a total of 6.'
        )

        element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'These must be clear, well-lit and high-resolution images.'
        )

        element = document.querySelector(`#${elementIds.helpText3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You must include a photo of:'
        )

        element = document.querySelector(
          `#${elementIds.helpText4} > li:nth-child(1)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('the whole item')

        element = document.querySelector(
          `#${elementIds.helpText4} > li:nth-child(2)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'any distinguishing features, including where the ivory is'
        )

        element = document.querySelector(`#${elementIds.helpTextSubHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Upload photo')

        element = document.querySelector(`#${elementIds.helpText5}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('The photo must be:')

        element = document.querySelector(
          `#${elementIds.helpText6} > li:nth-child(1)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'in JPG or PNG format'
        )

        element = document.querySelector(
          `#${elementIds.helpText6} > li:nth-child(2)`
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

    describe('GET: Existing photos', () => {
      beforeEach(async () => {
        const mockData = {
          files: ['lamp.png', 'chair.jpeg'],
          fileData: [],
          fileSizes: [100, 200],
          thumbnails: ['lamp-thumbnail.png', 'chair-thumbnail.jpeg'],
          thumbnailData: []
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
        expect(TestHelper.getTextContent(element)).toEqual('Add another photo')
      })

      it('should have the correct help text', () => {
        TestHelper.checkElementsDoNotExist(document, [
          `#${elementIds.helpText1}`,
          `#${elementIds.helpText2}`,
          `#${elementIds.helpText3}`,
          `#${elementIds.helpText4} > li:nth-child(1)`,
          `#${elementIds.helpText4} > li:nth-child(2)`
        ])

        const element = document.querySelector(
          `#${elementIds.helpTextSubHeading}`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Upload photo')

        TestHelper.checkElementsExist(document, [
          `#${elementIds.helpText5}`,
          `#${elementIds.helpText6} > li:nth-child(1)`,
          `#${elementIds.helpText6} > li:nth-child(2)`
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
          'Cancel and return to ‘Your photos’',
          '/your-photos'
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
          filename: 'document1.doc',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="document1.doc"',
            'content-type': 'application/msword'
          }
        }
        await _checkValidation(
          server,
          postOptions,
          payloadFile,
          'The file must be a JPG or PNG'
        )
      })

      it('should display a validation error message if the user tries to upload a virus', async () => {
        AntimalwareService.scan = jest.fn().mockResolvedValue('OMG a virus!')
        const payloadFile = {
          path: tempFolder,
          bytes: 100,
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
          'The file could not be uploaded - try a different one',
          200
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
            filename: 'lamp.png',
            headers: {
              'content-disposition':
                'form-data; name="files"; filename="lamp.png"',
              'content-type': 'image/png'
            }
          }
        }
      }

      const mockData = {
        files: ['lamp.png'],
        fileData: [],
        fileSizes: [100],
        thumbnails: ['lamp-thumbnail.png'],
        thumbnailData: []
      }
      RedisService.get = jest.fn().mockReturnValue(mockData)

      response = await TestHelper.submitPostRequest(server, postOptions, 400)
    })

    it('should display a validation error message if the user tries to upload a duplicate file', async () => {
      const payloadFile = {
        path: tempFolder,
        bytes: 100,
        headers: {
          'content-disposition': 'form-data; name="files"; filename="lamp.png"',
          'content-type': 'application/octet-stream'
        }
      }

      postOptions.payload.files = payloadFile

      await TestHelper.checkValidationError(
        response,
        'files',
        'files-error',
        "You've already uploaded that image. Choose a different one"
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
