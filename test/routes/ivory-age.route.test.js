'use strict'

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const CharacterLimits = require('../mock-data/character-limits')

const other = 'Other reason'

const elementIds = {
  pageTitle: 'pageTitle',
  helpText: 'helpText',
  ivoryAge: 'ivoryAge',
  ivoryAge2: 'ivoryAge-2',
  ivoryAge3: 'ivoryAge-3',
  ivoryAge4: 'ivoryAge-4',
  ivoryAge5: 'ivoryAge-5',
  ivoryAge6: 'ivoryAge-6',
  ivoryAge7: 'ivoryAge-7',
  ivoryAge8: 'ivoryAge-8',
  otherReason: 'otherReason',
  continue: 'continue'
}

describe('/ivory-age route', () => {
  let server
  const url = '/ivory-age'
  const nextUrlUploadDocument = '/want-to-add-documents'
  const nextUrlWhoOwnsTheItem = '/who-owns-the-item'

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

    describe('GET: Item is a musical instrument', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({
            ivoryAge: [
              'It has a stamp, serial number or signature to prove its age',
              'Other reason'
            ],
            otherReason: 'Some other reason'
          })
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
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
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
    })

    describe('GET: Item has < 10% ivory', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({
            ivoryAge: ['It’s been in the family since before 3 March 1947']
          })
          .mockResolvedValueOnce(ItemType.TEN_PERCENT)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 3 March 1947?'
        )
      })
    })

    describe('GET: Has correct details for a portrait miniature', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({
            ivoryAge: ['It’s been in the family since before 1918']
          })
          .mockResolvedValueOnce(ItemType.MINIATURE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 1918?'
        )
      })
    })

    describe('GET: Has correct details for S2 (item of outstandingly high value)', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce({
            ivoryAge: ['It’s been in the family since before 1918']
          })
          .mockResolvedValueOnce(ItemType.HIGH_VALUE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} > legend > h1`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'How do you know the item was made before 1918?'
        )
      })
    })

    describe('GET: Checkboxes', () => {
      describe('Item type of MUSICAL', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({
              ivoryAge: [
                'It’s been in the family since before 1975',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
            .mockResolvedValueOnce(ItemType.MUSICAL)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct checkboxes', () => {
          _testCheckboxes(document, false, '1975')
        })
      })

      describe('Item type of TEN_PERCENT', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({
              ivoryAge: [
                'It’s been in the family since before 3 March 1947',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
            .mockResolvedValueOnce(ItemType.TEN_PERCENT)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct checkboxes', () => {
          _testCheckboxes(document, false, '3 March 1947')
        })
      })

      describe('Item type of MINIATURE', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({
              ivoryAge: [
                'It’s been in the family since before 1918',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
            .mockResolvedValueOnce(ItemType.MINIATURE)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct checkboxes', () => {
          _testCheckboxes(document, false, '1918')
        })
      })

      describe('Item type of MUSEUM', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({
              ivoryAge: [
                'It’s been in the family since before 1918',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
            .mockResolvedValueOnce(ItemType.MUSEUM)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct checkboxes', () => {
          _testCheckboxes(document, false, '1918')
        })
      })

      describe('Item type of HIGH_VALUE', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce({
              ivoryAge: [
                'It’s been in the family since before 1918',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
            .mockResolvedValueOnce(ItemType.HIGH_VALUE)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct checkboxes', () => {
          _testCheckboxes(document, true, '1918')
        })
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
          .mockResolvedValueOnce({
            ivoryAge: [
              'It has a stamp, serial number or signature to prove its age'
            ]
          })
          .mockResolvedValueOnce(ItemType.MUSICAL)
      })

      it('should store the value in Redis and progress to the next route when the first option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It has a stamp, serial number or signature to prove its age',
          nextUrlWhoOwnsTheItem
        )
      })

      it('should store the value in Redis and progress to the next route when the second option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'I have a dated receipt showing when it was bought or repaired',
          nextUrlWhoOwnsTheItem
        )
      })

      it('should store the value in Redis and progress to the next route when the third option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'I have a dated publication that shows or describes the item',
          nextUrlWhoOwnsTheItem
        )
      })

      it('should store the value in Redis and progress to the next route when the fourth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It’s been in the family since before 1975',
          nextUrlWhoOwnsTheItem
        )
      })

      it('should store the value in Redis and progress to the next route when the fifth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'I have written verification from a relevant expert',
          nextUrlWhoOwnsTheItem
        )
      })

      it('should store the value in Redis and progress to the next route when the sixth option has been selected & Other text added', async () => {
        const otherReason = 'Some other reason'
        postOptions.payload.otherReason = otherReason
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          other,
          nextUrlWhoOwnsTheItem,
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
          nextUrlWhoOwnsTheItem
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
          nextUrlUploadDocument
        )
      })

      it('should store the value in Redis and progress to the next route when the sixth option has been selected', async () => {
        await _checkSelectedCheckboxAction(
          postOptions,
          server,
          'It’s been carbon-dated',
          nextUrlUploadDocument
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
          'You must tell us how you know the item’s age'
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
          'You must tell us how you know the item’s age'
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
  TestHelper.createMocks()
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

const _testCheckboxes = (document, isSection2, date) => {
  TestHelper.checkRadioOption(
    document,
    elementIds.ivoryAge,
    'It has a stamp, serial number or signature to prove its age',
    'It has a stamp, serial number or signature to prove its age'
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
    `It’s been in the family since before ${date}`,
    `It’s been in the family since before ${date}`,
    true
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

  if (isSection2) {
    TestHelper.checkRadioOption(
      document,
      elementIds.ivoryAge7,
      'It’s been carbon-dated',
      'It’s been carbon-dated'
    )

    TestHelper.checkRadioOption(
      document,
      elementIds.ivoryAge8,
      other,
      other,
      true
    )
  } else {
    TestHelper.checkRadioOption(
      document,
      elementIds.ivoryAge7,
      other,
      other,
      true
    )
  }

  TestHelper.checkFormField(
    document,
    elementIds.otherReason,
    'Give details',
    '',
    'Some other reason'
  )
}
