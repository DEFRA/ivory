'use strict'
import { jest } from '@jest/globals';
jest.mock('./server/services/redis.service.js')
import RedisService from '../../server/services/redis.service.js';
import TestHelper from '../utils/test-helper.js';
import { ItemType, Options, RedisKeys } from '../../server/utils/constants.js';

describe('/legal-responsibility route', () => {
  let server
  const url = '/legal-responsibility'
  const nextUrlNoPhotos = '/upload-photo'
  const nextUrlSomePhotos = '/your-photos'
  const nextUrlWhoOwnsTheItem = '/who-owns-the-item'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpTextPara1: 'helpTextPara-1',
    helpTextPara2: 'helpTextPara-2',
    helpTextPara3: 'helpTextPara-3',
    callOutText: 'callOutText',
    cancelLink: 'cancelLink',
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

    describe('GET: Has the correct details when it is a section 10 item', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.MUSICAL,
          [RedisKeys.ALREADY_CERTIFIED]: null
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

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
          'Both the owner and applicant are jointly responsible for providing accurate information'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'This is a self-declaration, both the owner and applicant are responsible for ensuring the item qualifies for exemption.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If you are not the owner of the item, you must have permission to act on their behalf.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Stop at any point if you’re unsure about the right answer.'
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If we later find out that any of the information you have given is incorrect, your registration may be cancelled. The applicant or owner may be subject to a fine of up to £250,000 or 5 years imprisonment.'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Has the correct details when it is a section 2 (high value) item - NOT already certified', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
          [RedisKeys.ALREADY_CERTIFIED]: { alreadyCertified: Options.NO }
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Both the owner and applicant are jointly responsible for providing accurate information'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If you are not the owner of the item, you must have permission to act on their behalf.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Stop at any point if you’re unsure about the right answer.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          "If we later find out that the information you’ve given is not accurate, the exemption certificate may be cancelled or 'revoked'."
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Dealing that relies on inaccurate information on the certificate may be a criminal offence. Anyone involved could be subject to a fine of up to £250,000, or 5 years imprisonment.'
        )
      })
    })

    describe('GET: Has the correct details when it is a section 2 (high value) item - already certified', () => {
      beforeEach(async () => {
        const mockData = {
          [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
          [RedisKeys.ALREADY_CERTIFIED]: { alreadyCertified: Options.YES }
        }

        RedisService.get = jest.fn((request, redisKey) => {
          return mockData[redisKey]
        })

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Both the owner and the person selling the certified item are jointly responsible for ensuring it remains exempt'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If you are not the owner of the item, you must have permission to act on their behalf.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Stop at any point if you’re unsure about the right answer.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          "If we later find out that the item has been damaged or altered, the exemption certificate is likely to be cancelled or 'revoked'. In this case a new application for an exemption certificate would have to be made before you can sell or hire out the item."
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Dealing that relies on inaccurate information on the certificate may be a criminal offence. Anyone involved could be subject to a fine of up to £250,000, or 5 years imprisonment.'
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
      describe('Already certified', () => {
        beforeEach(async () => {
          const mockData = {
            [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
            [RedisKeys.UPLOAD_PHOTO]: {},
            [RedisKeys.ALREADY_CERTIFIED]: { alreadyCertified: Options.YES }
          }

          RedisService.get = jest.fn((request, redisKey) => {
            return mockData[redisKey]
          })
        })

        it('should redirect the correct route when the item is already certified', async () => {
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions
          )
          expect(response.headers.location).toEqual(nextUrlWhoOwnsTheItem)
        })
      })

      describe('Not already certified', () => {
        it('should redirect the correct route when there are no uploaded photos', async () => {
          const mockData = {
            [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
            [RedisKeys.UPLOAD_PHOTO]: {},
            [RedisKeys.ALREADY_CERTIFIED]: { alreadyCertified: Options.NO }
          }

          RedisService.get = jest.fn((request, redisKey) => {
            return mockData[redisKey]
          })

          const response = await TestHelper.submitPostRequest(
            server,
            postOptions
          )
          expect(response.headers.location).toEqual(nextUrlNoPhotos)
        })

        it('should redirect the correct route when there are some uploaded photos', async () => {
          const mockData = {
            [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
            [RedisKeys.UPLOAD_PHOTO]: mockPhotos,
            [RedisKeys.ALREADY_CERTIFIED]: { alreadyCertified: Options.NO }
          }

          RedisService.get = jest.fn((request, redisKey) => {
            return mockData[redisKey]
          })

          const response = await TestHelper.submitPostRequest(
            server,
            postOptions
          )
          expect(response.headers.location).toEqual(nextUrlSomePhotos)
        })
      })
    })
  })
})

const mockPhotos = {
  files: ['1.png'],
  fileData: ['file-data'],
  fileSizes: [100],
  thumbnails: ['1-thumbnail.png'],
  thumbnailData: ['thumbnail-data']
}

const _createMocks = () => {
  TestHelper.createMocks()
}
