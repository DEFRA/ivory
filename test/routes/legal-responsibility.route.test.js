'use strict'

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

describe('/legal-responsibility route', () => {
  let server
  const url = '/legal-responsibility'
  const nextUrlNoPhotos = '/upload-photo'
  const nextUrlSomePhotos = '/your-photos'

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
          'Both the owner and applicant are jointly responsible for providing accurate information within the self-assessment'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'This is a self-assessment, both the owner and applicant are jointly responsible for ensuring the item is exempt.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'The Ivory Act 2018 permits you to do a self-assessment for someone else, but you must have permission to act on their behalf.'
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
          'If we later find out that the item is not exempt, the applicant or owner could be fined or prosecuted.'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: Has the correct details when it is a section 2 (high value) item', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Both the owner and applicant are jointly responsible for providing accurate information when making an application'
        )
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'The Ivory Act 2018 permits you to do an application for someone else, but you must have permission to act on their behalf.'
        )

        element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Stop at any point if you’re unsure about the right answer.'
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If we later find out that the information you’ve given is not accurate, the applicant or owner could be fined or prosecuted.'
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
      it('should redirect the correct route when there are no uploaded photos', async () => {
        RedisService.get = jest.fn().mockResolvedValue(JSON.stringify({}))

        const response = await TestHelper.submitPostRequest(server, postOptions)
        expect(response.headers.location).toEqual(nextUrlNoPhotos)
      })

      it('should redirect the correct route when there are some uploaded photos', async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockPhotos))

        const response = await TestHelper.submitPostRequest(server, postOptions)
        expect(response.headers.location).toEqual(nextUrlSomePhotos)
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
