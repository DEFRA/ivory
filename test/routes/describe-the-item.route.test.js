'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/cookie.service')
const CookieService = require('../../server/services/cookie.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const CharacterLimits = require('../mock-data/character-limits')

const ItemTypes = {
  MUSICAL: 'Musical instrument made before 1975 with less than 20% ivory',
  TEN_PERCENT: 'Item made before 3 March 1947 with less than 10% ivory',
  MINIATURE:
    'Portrait miniature made before 1918 with a surface area less than 320 square centimetres',
  MUSEUM: 'Item to be sold or hired out to a qualifying museum',
  HIGH_VALUE:
    'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
}

describe('/describe-the-item route', () => {
  let server
  const url = '/describe-the-item'

  const nextUrls = {
    ivoryAge: '/ivory-age',
    ivoryVolume: '/ivory-volume',
    uploadPhotos: '/upload-photos',
    whyIsItemRMI: '/why-is-item-rmi'
  }

  const elementIds = {
    pageTitle: 'pageTitle',
    whatIsItem: 'whatIsItem',
    whereIsIvory: 'whereIsIvory',
    uniqueFeatures: 'uniqueFeatures',
    whereMade: 'whereMade',
    whenMade: 'whenMade',
    continue: 'continue'
  }

  const itemDescription = {
    whatIsItem: 'chest of drawers',
    whereIsIvory: 'chest has ivory knobs',
    uniqueFeatures: 'one of the feet is cracked',
    whereMade: 'Europe',
    whenMade: 'Georgian era'
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

    describe('GET: non-RMI', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(ItemTypes.MUSICAL)
          .mockResolvedValueOnce(JSON.stringify(itemDescription))

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
          'Tell us about the item'
        )
      })

      it('should have the "what is the item" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.whatIsItem,
          'What is the item?',
          "For example, 'sword', 'chest of drawers'",
          itemDescription.whatIsItem
        )
      })

      it('should have the "where is the ivory" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.whereIsIvory,
          'Where is the ivory on it?',
          "For example, 'scabbard has ivory inlay', 'chest has ivory knobs'",
          itemDescription.whereIsIvory
        )
      })

      it('should have the "unique features" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.uniqueFeatures,
          'Describe any unique, identifying features (optional)',
          "For example, 'handle has a carved image of a soldier', 'one of the feet is cracked'",
          itemDescription.uniqueFeatures
        )
      })

      it('should NOT have the "where was it made" form field', () => {
        const element = document.querySelector(`#${elementIds.whereMade}`)
        expect(element).toBeFalsy()
      })

      it('should NOT have the "when was it made" form field', () => {
        const element = document.querySelector(`#${elementIds.whenMade}`)
        expect(element).toBeFalsy()
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: RMI', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(ItemTypes.HIGH_VALUE)
          .mockResolvedValueOnce(JSON.stringify(itemDescription))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the "where was it made" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.whereMade,
          'Where was it made? (optional)',
          "For example, 'Japan', 'Europe'",
          itemDescription.whereMade
        )
      })

      it('should have the "when was it made" form field', () => {
        TestHelper.checkFormField(
          document,
          elementIds.whenMade,
          'When was it made? (optional)',
          "For example, '5th century', 'Georgian era'",
          itemDescription.whenMade
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
      it('should store the query terms and address array in Redis and progress to the next route for HIGH VALUE items', async () => {
        await _checkSuccessfulPost(
          ItemTypes.HIGH_VALUE,
          itemDescription,
          postOptions,
          server,
          nextUrls.whyIsItemRMI
        )
      })

      it('should store the query terms and address array in Redis and progress to the next route for MINIATURE items', async () => {
        await _checkSuccessfulPost(
          ItemTypes.MINIATURE,
          itemDescription,
          postOptions,
          server,
          nextUrls.ivoryAge
        )
      })

      it('should store the query terms and address array in Redis and progress to the next route for MUSEUM items', async () => {
        await _checkSuccessfulPost(
          ItemTypes.MUSEUM,
          itemDescription,
          postOptions,
          server,
          nextUrls.uploadPhotos
        )
      })

      it('should store the query terms and address array in Redis and progress to the next route for 10 PERCENT items', async () => {
        await _checkSuccessfulPost(
          ItemTypes.TEN_PERCENT,
          itemDescription,
          postOptions,
          server,
          nextUrls.ivoryVolume
        )
      })

      it('should store the query terms and address array in Redis and progress to the next route for MUSICAL items', async () => {
        await _checkSuccessfulPost(
          ItemTypes.MUSICAL,
          itemDescription,
          postOptions,
          server,
          nextUrls.ivoryVolume
        )
      })
    })

    describe('Failure', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce(ItemTypes.HIGH_VALUE)
          .mockResolvedValueOnce(JSON.stringify(itemDescription))
      })

      it('should display a validation error message if the user does not enter "What is the item?"', async () => {
        postOptions.payload = {
          whatIsItem: '',
          whereIsIvory: 'SOME_VALUE_2'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whatIsItem,
          'You must tell us what the item is'
        )
      })

      it('should display a validation error message if "What is the item?" is too long', async () => {
        postOptions.payload = {
          whatIsItem: `${CharacterLimits.fourThousandCharacters}X`,
          whereIsIvory: 'SOME_VALUE_2'
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whatIsItem,
          'You must use fewer than 4,000 characters to tell us what the item is'
        )
      })

      it('should display a validation error message if the user does not enter "Where is the ivory"', async () => {
        postOptions.payload = {
          whatIsItem: 'SOME_VALUE_1',
          whereIsIvory: ''
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whereIsIvory,
          'You must tell us where the ivory is'
        )
      })

      it('should display a validation error message if "Where is the ivory?" is too long', async () => {
        postOptions.payload = {
          whatIsItem: 'SOME_VALUE_1',
          whereIsIvory: `${CharacterLimits.fourThousandCharacters}X`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whereIsIvory,
          'You must use fewer than 4,000 characters to tell us where the ivory is'
        )
      })

      it('should display a validation error message if "Unique features" is too long', async () => {
        postOptions.payload = {
          whatIsItem: 'SOME_VALUE_1',
          whereIsIvory: 'SOME_VALUE_2',
          uniqueFeatures: `${CharacterLimits.fourThousandCharacters}X`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.uniqueFeatures,
          'You must use fewer than 4,000 characters to describe any unique, identifying features'
        )
      })

      it('should display a validation error message if "Where made" is too long', async () => {
        postOptions.payload = {
          whatIsItem: 'SOME_VALUE_1',
          whereIsIvory: 'SOME_VALUE_2',
          whereMade: `${CharacterLimits.fourThousandCharacters}X`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whereMade,
          'You must use fewer than 4,000 characters to tell us where the item was made'
        )
      })

      it('should display a validation error message if "When made" is too long', async () => {
        postOptions.payload = {
          whatIsItem: 'SOME_VALUE_1',
          whereIsIvory: 'SOME_VALUE_2',
          whenMade: `${CharacterLimits.fourThousandCharacters}X`
        }
        await TestHelper.checkFormFieldValidation(
          postOptions,
          server,
          elementIds.whenMade,
          'You must use fewer than 4,000 characters to tell us when the item was made'
        )
      })

      it('should NOT display any validation error messages if the optional fields are not entered', async () => {
        postOptions.payload = {
          whatIsItem: 'SOME_VALUE_1',
          whereIsIvory: 'SOME_VALUE_2',
          uniqueFeatures: '',
          whereMade: '',
          whenMade: ''
        }
        await TestHelper.submitPostRequest(server, postOptions, 302)
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

const _checkSuccessfulPost = async (
  itemType,
  itemDescription,
  postOptions,
  server,
  nextUrl
) => {
  RedisService.get = jest
    .fn()
    .mockResolvedValueOnce(itemType)
    .mockResolvedValueOnce(JSON.stringify(itemDescription))

  postOptions.payload = itemDescription

  const response = await TestHelper.submitPostRequest(server, postOptions, 302)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    'describe-the-item',
    JSON.stringify(itemDescription)
  )

  expect(response.headers.location).toEqual(nextUrl)
}
