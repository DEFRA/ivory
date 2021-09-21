'use strict'

jest.mock('@defra/hapi-gapi')

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')
const RedisService = require('../../../server/services/redis.service')
const { ItemType } = require('../../../server/utils/constants')

describe('/eligibility-checker/is-item-pre-1918 route', () => {
  let server
  const url = '/eligibility-checker/is-item-pre-1918'
  const nextUrlLessThan320cmSquared =
    '/eligibility-checker/less-than-320cm-squared'
  const nextUrlIsItRmi = '/eligibility-checker/is-it-rmi'
  const nextUrlCannotTrade = '/eligibility-checker/cannot-trade'
  const nextUrlCannotContinue = '/eligibility-checker/cannot-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpTextList: 'helpTextList',
    isItemPre1918: 'isItemPre1918',
    isItemPre19182: 'isItemPre1918-2',
    isItemPre19183: 'isItemPre1918-3',
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
        'Was your item made before 1 January 1918?'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'The following might help you decide:'
      )
    })

    it('should have a help text list', () => {
      const element = document.querySelector(`#${elementIds.helpTextList}`)
      expect(element).toBeTruthy()
    })

    it('should have the correct radio buttons', () => {
      TestHelper.checkRadioOption(
        document,
        elementIds.isItemPre1918,
        'Yes',
        'Yes'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.isItemPre19182,
        'No',
        'No'
      )

      TestHelper.checkRadioOption(
        document,
        elementIds.isItemPre19183,
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
      it('should progress to the next route when the first option has been selected & item IS a miniature', async () => {
        RedisService.get = jest.fn().mockResolvedValue(ItemType.MINIATURE)
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Yes',
          nextUrlLessThan320cmSquared
        )
      })

      it('should progress to the next route when the first option has been selected & item IS a miniature', async () => {
        RedisService.get = jest.fn().mockResolvedValue('')
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'Yes',
          nextUrlIsItRmi
        )
      })

      it('should progress to the next route when the second option has been selected', async () => {
        await _checkSelectedRadioAction(
          postOptions,
          server,
          'No',
          nextUrlCannotTrade
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
          postOptions.payload.isItemPre1918 = ''
          const response = await TestHelper.submitPostRequest(
            server,
            postOptions,
            400
          )
          await TestHelper.checkValidationError(
            response,
            'isItemPre1918',
            'isItemPre1918-error',
            'Tell us whether your item was made before 1918'
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
  postOptions.payload.isItemPre1918 = selectedOption

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
