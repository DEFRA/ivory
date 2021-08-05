'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

jest.mock('../../server/services/cookie.service')
const CookieService = require('../../server/services/cookie.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const CharacterLimits = require('../mock-data/character-limits')

const other = 'Other reason'

describe('/ivory-age route', () => {
  let server
  const url = '/ivory-age'
  const nextUrlUploadPhotos = '/upload-photos'
  const nextUrl10percent = '/ivory-integral'

  const elementIds = {
    ivoryAge: 'ivoryAge',
    ivoryAge2: 'ivoryAge-2',
    ivoryAge3: 'ivoryAge-3',
    ivoryAge4: 'ivoryAge-4',
    ivoryAge5: 'ivoryAge-5',
    ivoryAge6: 'ivoryAge-6',
    ivoryAge7: 'ivoryAge-7',
    otherReason: 'otherReason',
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

    describe('GET: Item is a musical instrument', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: [
                'It has a stamp, serial number or signature to prove its age',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
          )
          .mockResolvedValueOnce(ItemType.MUSICAL)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector('.govuk-fieldset__legend')
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 1975?'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })

      it('should have the correct checkboxes', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge,
          'It has a stamp, serial number or signature to prove its age',
          'It has a stamp, serial number or signature to prove its age',
          true
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge2,
          'I have a dated receipt showing when it was bought or repaired',
          'I have a dated receipt showing when it was bought or repaired'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge3,
          'I have a dated publication that shows or describes the item',
          'I have a dated publication that shows or describes the item'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge4,
          'It’s been in the family since before 1975',
          'It’s been in the family since before 1975'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge5,
          'I have written verification from a relevant expert',
          'I have written verification from a relevant expert'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge6,
          'I am an expert, and it’s my professional opinion',
          'I am an expert, and it’s my professional opinion'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge7,
          other,
          other,
          true
        )
      })

      it('should have the other detail form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.otherReason,
          'Give details',
          '',
          'Some other reason'
        )
      })
    })

    describe('GET: Item has < 10% ivory', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: ['It’s been in the family since before 3 March 1947']
            })
          )
          .mockResolvedValueOnce(ItemType.TEN_PERCENT)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector('.govuk-fieldset__legend')
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 3 March 1947?'
        )
      })

      it('should have the correct checkboxes', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge4,
          'It’s been in the family since before 3 March 1947',
          'It’s been in the family since before 3 March 1947',
          true
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge6,
          'I am an expert, and it’s my professional opinion',
          'I am an expert, and it’s my professional opinion'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge7,
          other,
          other
        )
      })
    })

    describe('GET: Has correct details for a portrait miniature', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: ['It’s been in the family since before 1918']
            })
          )
          .mockResolvedValueOnce(ItemType.MINIATURE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector('.govuk-fieldset__legend')
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 1918?'
        )
      })

      it('should have the correct checkboxes', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge4,
          'It’s been in the family since before 1918',
          'It’s been in the family since before 1918',
          true
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge6,
          'I am an expert, and it’s my professional opinion',
          'I am an expert, and it’s my professional opinion'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge7,
          other,
          other
        )
      })
    })

    describe('GET: Has correct details for S2 (item of outstandingly high value)', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: ['It’s been in the family since before 1918']
            })
          )
          .mockResolvedValueOnce(ItemType.HIGH_VALUE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector('.govuk-fieldset__legend')
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 1918?'
        )
      })

      it('should have the correct checkboxes', () => {
        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge4,
          'It’s been in the family since before 1918',
          'It’s been in the family since before 1918',
          true
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge6,
          'I am an expert, and it’s my professional opinion',
          'I am an expert, and it’s my professional opinion'
        )

        TestHelper.checkRadioOption(
          document,
          elementIds.ivoryAge7,
          'It’s been carbon-dated',
          'It’s been carbon-dated'
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

    describe('Success: Item is a musical instrument', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: [
                'It has a stamp, serial number or signature to prove its age'
              ]
            })
          )
          .mockResolvedValueOnce(ItemType.MUSICAL)
      })

      it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It has a stamp, serial number or signature to prove its age',
          nextUrlUploadPhotos
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'I have a dated receipt showing when it was bought or repaired',
          nextUrlUploadPhotos
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'I have a dated publication that shows or describes the item',
          nextUrlUploadPhotos
        )
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It’s been in the family since before 1975',
          nextUrlUploadPhotos
        )
      })

      it('should store the value in Redis and progress to the next route when the fifth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'I have written verification from a relevant expert',
          nextUrlUploadPhotos
        )
      })

      it('should store the value in Redis and progress to the next route when the sixth option has been selected & Other text added', async () => {
        const otherReason = 'Some other reason'
        postOptions.payload.otherReason = otherReason
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          other,
          nextUrlUploadPhotos,
          otherReason
        )
      })
    })

    describe('Success: Item has < 10% ivory', () => {
      const selectedOption = 'It’s been in the family since before 3 March 1947'

      beforeEach(async () => {
        postOptions.payload = {
          ivoryAge: [selectedOption]
        }
        RedisService.get = jest.fn().mockResolvedValue(ItemType.TEN_PERCENT)
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          selectedOption,
          nextUrl10percent
        )
      })
    })

    describe('Success: Item of outstandingly high value', () => {
      const selectedOption = 'It’s been in the family since before 1918'

      beforeEach(async () => {
        postOptions.payload = {
          ivoryAge: [selectedOption]
        }
        RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          selectedOption,
          nextUrlUploadPhotos
        )
      })

      it('should store the value in Redis and progress to the next route when the sixth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It’s been carbon-dated',
          nextUrlUploadPhotos
        )
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(ItemType.TEN_PERCENT)
      })

      it('should display a validation error message if the user does not check a box', async () => {
        postOptions.payload.ivoryAge = ''
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'ivoryAge',
          'ivoryAge-error',
          'You just tell us how you know the item’s age'
        )
      })

      it('should display a validation error message if the user selects other and leaves text area empty', async () => {
        postOptions.payload.ivoryAge = other
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherReason',
          'otherReason-error',
          'You just tell us how you know the item’s age'
        )
      })

      it('should display a validation error message if the other text area > 4000 chars', async () => {
        postOptions.payload = {
          ivoryAge: other,
          otherReason: `${CharacterLimits.fourThousandCharacters}X`
        }
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'otherReason',
          'otherReason-error',
          'Enter no more than 4,000 characters'
        )
      })
    })
  })
})

const _createMocks = () => {
  CookieService.checkSessionCookie = jest
    .fn()
    .mockReturnValue('THE_SESSION_COOKIE')

  RedisService.set = jest.fn()
}

const _checkSelectedCheckboxAction = async (
  postOptions,
  server,
  selectedOption,
  nextUrl,
  otherReason
) => {
  const redisKey = 'ivory-age'
  postOptions.payload.ivoryAge = selectedOption

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  const expectedRedisValue = {}
  if (otherReason) {
    expectedRedisValue.otherReason = otherReason
  }
  expectedRedisValue.ivoryAge = [selectedOption]

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKey,
    JSON.stringify(expectedRedisValue)
  )

  expect(response.headers.location).toEqual(nextUrl)
}
