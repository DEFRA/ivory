'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType, Paths, RedisKeys } = require('../../server/utils/constants')

jest.mock('../../server/services/cookie.service')
const CookieService = require('../../server/services/cookie.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const MAX_FILES = 6

const elementIds = {
  pageTitle: 'pageTitle',
  helpText: 'helpText',
  subHeadings: {
    exemptionType: 'exemptionTypeHeading',
    photos: 'photosSubHeading',
    itemDescription: 'itemDescriptionSubHeading',
    exemptionReason: 'exemptionReasonHeading',
    documents: 'documentsSummaryHeading',
    owner: 'ownerSubHeading',
    saleIntention: 'saleIntentionSubHeading'
  },
  summaries: {
    exemptionType: 'exemptionTypeSummary',
    photos: 'photoSummary',
    itemDescription: 'itemDescriptionSummary',
    exemptionReason: 'exemptionReasonSummary',
    documents: 'documentSummary',
    owner: 'ownerSummary',
    saleIntention: 'saleIntentionSummary'
  },
  document0: 'document0',
  document1: 'document1',
  document2: 'document2',
  document3: 'document3',
  document4: 'document4',
  document5: 'document5',
  photo0: 'photo0',
  photo1: 'photo1',
  photo2: 'photo2',
  photo3: 'photo3',
  photo4: 'photo4',
  photo5: 'photo5',
  ivoryAgeReason: 'ivoryAgeReason',
  legalDeclarationHeading: 'legalDeclarationHeading',
  legalDeclarationPara1: 'legalDeclarationPara1',
  legalDeclarationPara2: 'legalDeclarationPara2',
  legalAssertion1: 'legalAssertion1',
  legalAssertion2: 'legalAssertion2',
  legalAssertion3: 'legalAssertion3',
  legalAssertion4: 'legalAssertion4',
  legalAssertion5: 'legalAssertion5',
  agree: 'agree',
  agreeAndSubmit: 'agreeAndSubmit'
}

describe('/check-your-answers route', () => {
  let server
  const url = '/check-your-answers'
  const nextUrl = '/make-payment'

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

    describe('GET: Common content', () => {
      beforeEach(async () => {
        _createMocks(ItemType.HIGH_VALUE, true)
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
        expect(TestHelper.getTextContent(element)).toEqual('Check your answers')
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.agreeAndSubmit}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Agree and submit')
      })
    })

    describe('GET: Page sections', () => {
      beforeEach(async () => {
        _createMocks(ItemType.HIGH_VALUE, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct "Item" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.exemptionType,
          'The item'
        )

        _checkSummary(document, elementIds.summaries.exemptionType)

        _checkSummaryKeys(
          document,
          elementIds.summaries.exemptionType,
          'Type of exemption'
        )

        _checkSummaryValues(
          document,
          elementIds.summaries.exemptionType,
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
        )

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.exemptionType,
          'Change Change type of exemption',
          Paths.WHAT_TYPE_OF_ITEM_IS_IT
        )
      })

      it('should have the correct "Photos" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.photos,
          'Photos of the item'
        )

        _checkSummary(document, elementIds.summaries.photos)

        _checkSummaryKeys(document, elementIds.summaries.photos, 'Your photos')

        for (let i = 0; i < MAX_FILES; i++) {
          const element = document.querySelector(
            `#${elementIds.summaries.photos} #photo${i}`
          )
          expect(element).toBeTruthy()
        }

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.photos,
          'Change Change your photos',
          Paths.YOUR_PHOTOS
        )
      })

      it('should have the correct "Description" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.itemDescription,
          'Description of the item'
        )

        _checkSummary(document, elementIds.summaries.itemDescription)

        _checkSummaryKeys(document, elementIds.summaries.itemDescription, [
          'What is it?',
          'Where’s the ivory?',
          'Unique, identifying features (optional)',
          'Where was it made? (optional)',
          'When was it made? (optional)'
        ])

        _checkSummaryValues(
          document,
          elementIds.summaries.itemDescription,
          Object.values(mockItemDescription)
        )

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.itemDescription,
          [
            'Change Change your description of the item',
            'Change Change where the ivory is',
            'Change Change any unique features',
            'Change Change where it was made',
            'Change Change when it was made'
          ],
          [
            Paths.DESCRIBE_THE_ITEM,
            Paths.DESCRIBE_THE_ITEM,
            Paths.DESCRIBE_THE_ITEM,
            Paths.DESCRIBE_THE_ITEM,
            Paths.DESCRIBE_THE_ITEM
          ]
        )
      })

      it('should have the correct "Exemption Reason" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.exemptionReason,
          'Reasons why item is exempt'
        )

        _checkSummary(document, elementIds.summaries.exemptionReason)

        _checkSummaryKeys(document, elementIds.summaries.exemptionReason, [
          'Proof of item’s age',
          'Why it’s of outstandingly high value'
        ])

        const elements = document.querySelectorAll(
          `#${elementIds.summaries.exemptionReason} .${VALUE_CLASS}`
        )
        expect(elements[0]).toBeTruthy()

        for (let i = 0; i < mockIvoryAge.ivoryAge.length - 1; i++) {
          const element = document.querySelector(
            `#${elementIds.ivoryAgeReason}${i}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            mockIvoryAge.ivoryAge[i]
          )
        }

        const element = document.querySelector(`#${elementIds.ivoryAgeReason}6`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          mockIvoryAge.otherReason
        )

        expect(elements[1]).toBeTruthy()
        expect(TestHelper.getTextContent(elements[1])).toEqual(whyRmi)

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.exemptionReason,
          [
            'Change Change your proof of age',
            'Change Change reason why item is of outstandingly high value'
          ],
          [Paths.IVORY_AGE, Paths.WHY_IS_ITEM_RMI]
        )
      })

      it('should have the correct "Documents" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.documents,
          'Documents to support application'
        )

        _checkSummary(document, elementIds.summaries.documents)

        _checkSummaryKeys(
          document,
          elementIds.summaries.documents,
          'Your documents'
        )

        for (let i = 0; i < MAX_FILES; i++) {
          const element = document.querySelector(
            `#${elementIds.summaries.documents} #document${i}`
          )
          expect(element).toBeTruthy()
        }

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.documents,
          'Change Change your documents',
          Paths.YOUR_DOCUMENTS
        )
      })

      it('should have the correct "Owner" summary section - NOT owned by applicant', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner and applicant details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Who owns the item?',
          'Owner’s name',
          'Owner’s email',
          'Owner’s address',
          'Your name',
          'Your email',
          'Your address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          'Someone else owns it',
          mockOwnerContactDetails.name,
          mockOwnerContactDetails.emailAddress,
          ownerAddress,
          mockApplicantContactDetails.name,
          mockApplicantContactDetails.emailAddress,
          applicantAddress
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.owner,
          [
            'Change Change who owns the item',
            'Change Change owner’s name',
            'Change Change owner’s email',
            'Change Change owner’s address',
            'Change Change your name',
            'Change Change your email',
            'Change Change your address'
          ],
          [
            Paths.WHO_OWNS_ITEM,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_ADDRESS_FIND,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_ADDRESS_FIND
          ]
        )
      })

      it('should have the correct "Sale Intention" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.saleIntention,
          'What will happen to the item'
        )

        _checkSummary(document, elementIds.summaries.saleIntention)

        _checkSummaryKeys(
          document,
          elementIds.summaries.saleIntention,
          'What owner intends to do'
        )

        _checkSummaryValues(
          document,
          elementIds.summaries.saleIntention,
          saleIntention
        )

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.saleIntention,
          'Change Change what owner intends to do',
          Paths.INTENTION_FOR_ITEM
        )
      })
    })

    describe('GET: Page sections - owned by applicant', () => {
      beforeEach(async () => {
        _createMocks(ItemType.HIGH_VALUE, true)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct "Owner" summary section - owned by applicant', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner’s details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Who owns the item?',
          'Your name',
          'Business name (optional)',
          'Your email',
          'Your address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          'I own it',
          mockOwnerContactDetails.name,
          businessName,
          mockOwnerContactDetails.emailAddress,
          ownerAddress
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.owner,
          [
            'Change Change who owns the item',
            'Change Change your name',
            'Change Change business name',
            'Change Change your email',
            'Change Change your address'
          ],
          [
            Paths.WHO_OWNS_ITEM,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_ADDRESS_FIND
          ]
        )
      })
    })

    describe('GET: Page sections - non-RMI item type', () => {
      beforeEach(async () => {
        _createMocks(ItemType.MUSICAL, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should NOT have the "Documents" sub heading', () => {
        const element = document.querySelector(
          `#${elementIds.subHeadings.documentSummary}`
        )
        expect(element).toBeFalsy()
      })

      it('should NOT have the "Documents" summary section', () => {
        const element = document.querySelector(
          `#${elementIds.summaries.documents}`
        )
        expect(element).toBeFalsy()
      })
    })

    describe('GET: Page sections for ItemType = MUSEUM', () => {
      beforeEach(async () => {
        _createMocks(ItemType.MUSEUM, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should NOT have the "Exemption Reason" sub heading', () => {
        const element = document.querySelector(
          `#${elementIds.subHeadings.exemptionReason}`
        )
        expect(element).toBeFalsy()
      })

      it('should NOT have the "Exemption Reason" summary section', () => {
        const element = document.querySelector(
          `#${elementIds.summaries.exemptionReason}`
        )
        expect(element).toBeFalsy()
      })
    })

    describe('GET: Page sections for ItemType = TEN_PERCENT', () => {
      beforeEach(async () => {
        _createMocks(ItemType.TEN_PERCENT, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct "Exemption Reason" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.exemptionReason,
          'Reasons why item is exempt'
        )

        _checkSummary(document, elementIds.summaries.exemptionReason)

        _checkSummaryKeys(document, elementIds.summaries.exemptionReason, [
          'Proof of item’s age',
          'Proof it has less than 10% ivory',
          'Why all ivory is integral'
        ])

        _checkSummaryValues(document, elementIds.summaries.exemptionReason, [
          'It has a stamp, serial number or signature to prove its ageI have a dated receipt showing when it was bought or repairedI have a dated publication that shows or describes the itemIt’s been in the family since before 1918I have written verification from a relevant expertI am an expert, and it’s my professional opinionIvory age reason',
          mockIvoryVolume.otherReason,
          ivoryIntegral
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.exemptionReason,
          [
            'Change Change your proof of age',
            'Change Change your proof that item has less than 10% ivory',
            'Change Change reason why all ivory is integral to item'
          ],
          [Paths.IVORY_AGE, Paths.IVORY_VOLUME, Paths.IVORY_INTEGRAL]
        )
      })
    })

    describe('GET: Legal declarations', () => {
      describe('Summary paragraphs', () => {
        it('should have the correct heading and summary paragraphs when item is owned by applicant', async () => {
          _createMocks(ItemType.HIGH_VALUE, true)
          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(
            `#${elementIds.legalDeclarationHeading}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Legal declaration'
          )

          element = document.querySelector(
            `#${elementIds.legalDeclarationPara1}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Before you continue, you must agree to the following:'
          )

          element = document.querySelector(
            `#${elementIds.legalDeclarationPara2}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct heading and summary paragraphs when item is owned by applicant', async () => {
          _createMocks(ItemType.HIGH_VALUE, false)
          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(
            `#${elementIds.legalDeclarationHeading}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Legal declaration'
          )

          element = document.querySelector(
            `#${elementIds.legalDeclarationPara1}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Before you continue, you must agree that you have permission to act on the owner’s behalf.'
          )

          element = document.querySelector(
            `#${elementIds.legalDeclarationPara2}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You must also agree that the owner confirms the following:'
          )
        })
      })

      describe('Declaration list', () => {
        beforeEach(async () => {
          _createMocks(ItemType.HIGH_VALUE)
          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct legal declarations for ItemType = MUSICAL', async () => {
          _createMocks(ItemType.MUSICAL)

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(`#${elementIds.legalAssertion1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the musical instrument was made before 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the instrument contains less than 20% ivory by volume'
          )

          element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'any replacement ivory was taken from an elephant before 1 January 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
        })

        it('should have the correct legal declarations for ItemType = MUSICAL', async () => {
          _createMocks(ItemType.TEN_PERCENT)

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'all the ivory in the item is integral to it'
          )

          element = document.querySelector(`#${elementIds.legalAssertion4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'any replacement ivory was taken from an elephant before 1 January 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
        })

        it('should have the correct legal declarations for ItemType = MINIATURE', async () => {
          _createMocks(ItemType.MINIATURE)

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(`#${elementIds.legalAssertion1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the portrait miniature was made before 1918'
          )

          element = document.querySelector(`#${elementIds.legalAssertion2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the surface area of ivory on the miniature is less than 320 square centimetres'
          )

          element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'any replacement ivory was taken from an elephant before 1 January 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
        })

        it('should have the correct legal declarations for ItemType = MUSEUM', async () => {
          _createMocks(ItemType.MUSEUM)

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(`#${elementIds.legalAssertion1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'you are selling or hiring out the ivory item to a qualifying museum'
          )

          element = document.querySelector(`#${elementIds.legalAssertion2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
        })

        it('should have the correct legal declarations for ItemType = HIGH_VALUE', async () => {
          _createMocks(ItemType.HIGH_VALUE)

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(`#${elementIds.legalAssertion1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the item was made before 1918'
          )

          element = document.querySelector(`#${elementIds.legalAssertion2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the item is of outstandingly high artistic, cultural or historical value'
          )

          element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'any replacement ivory was taken from an elephant before 1 January 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
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

    describe('Success', () => {
      beforeEach(async () => {
        postOptions.payload.agree = 'agree'
      })

      it('should progress to the next route', async () => {
        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not check a box', async () => {
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'agree',
          'agree-error',
          'You must agree with the legal declaration'
        )
      })
    })
  })
})

const KEY_CLASS = 'govuk-summary-list__key'
const VALUE_CLASS = 'govuk-summary-list__value'
const LINK_CLASS = 'govuk-link'

const mockItemDescription = {
  whatIsItem: 'Chest of drawers',
  whereIsIvory: 'Chest has ivory knobs',
  uniqueFeatures: 'One of the feet is cracked',
  whereMade: 'Europe',
  whenMade: 'Georgian era'
}

const mockPhotos = {
  files: ['1.png', '2.jpeg', '3.png', '4.jpeg', '5.png', '6.png'],
  fileData: [
    'file-data',
    'file-data',
    'file-data',
    'file-data',
    'file-data',
    'file-data'
  ],
  fileSizes: [100, 200, 300, 400, 500, 600],
  thumbnails: [
    '1-thumbnail.png',
    '2-thumbnail.jpeg',
    '3-thumbnail.png',
    '4-thumbnail.jpeg',
    '5-thumbnail.png',
    '6-thumbnail.jpeg'
  ],
  thumbnailData: [
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data'
  ]
}
const whyRmi = 'RMI_REASON'
const mockIvoryVolume = {
  ivoryVolume: 'Other reason',
  otherReason: 'IVORY VOLUME REASON'
}
const ivoryIntegral =
  'The ivory is essential to the design or function of the item'

const mockIvoryAge = {
  ivoryAge: [
    'It has a stamp, serial number or signature to prove its age',
    'I have a dated receipt showing when it was bought or repaired',
    'I have a dated publication that shows or describes the item',
    'It’s been in the family since before 1918',
    'I have written verification from a relevant expert',
    'I am an expert, and it’s my professional opinion',
    'Other reason'
  ],
  otherReason: 'Ivory age reason'
}

const mockDocuments = {
  files: [
    'document1.pdf',
    'document2.pdf',
    'document3.pdf',
    'document4.pdf',
    'document5.pdf',
    'document6.pdf'
  ],
  fileData: [
    'document1',
    'document2',
    'document3',
    'document4',
    'document5',
    'document6'
  ],
  fileSizes: [100, 200, 300, 400, 500, 600]
}

const mockOwnerContactDetails = {
  name: 'OWNER_NAME',
  emailAddress: 'OWNER@EMAIL.COM',
  confirmEmailAddress: 'OWNER@EMAIL.COM'
}

const mockApplicantContactDetails = {
  name: 'APPLICANT_NAME',
  emailAddress: 'APPLICANT@EMAIL.COM',
  confirmEmailAddress: 'APPLICANT@EMAIL.COM'
}

const ownerAddress = 'OWNER_ADDRESS'
const applicantAddress = 'APPLICANT_ADDRESS'

const businessName = 'Nothing entered'

const saleIntention = 'Sell it'

const _createMocks = (itemType, ownedByApplicant = true) => {
  CookieService.checkSessionCookie = jest
    .fn()
    .mockReturnValue('THE_SESSION_COOKIE')

  RedisService.get = jest.fn((request, redisKey) => {
    const mockDataMap = {
      [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType,
      [RedisKeys.DESCRIBE_THE_ITEM]: JSON.stringify(mockItemDescription),
      [RedisKeys.UPLOAD_PHOTO]: JSON.stringify(mockPhotos),
      [RedisKeys.WHY_IS_ITEM_RMI]: whyRmi,
      [RedisKeys.IVORY_VOLUME]: JSON.stringify(mockIvoryVolume),
      [RedisKeys.IVORY_INTEGRAL]: ivoryIntegral,
      [RedisKeys.IVORY_AGE]: JSON.stringify(mockIvoryAge),
      [RedisKeys.UPLOAD_DOCUMENT]: JSON.stringify(mockDocuments),
      [RedisKeys.OWNED_BY_APPLICANT]: ownedByApplicant ? 'Yes' : 'No',
      [RedisKeys.OWNER_CONTACT_DETAILS]: JSON.stringify(
        mockOwnerContactDetails
      ),
      [RedisKeys.APPLICANT_CONTACT_DETAILS]: JSON.stringify(
        mockApplicantContactDetails
      ),
      [RedisKeys.OWNER_ADDRESS]: ownerAddress,
      [RedisKeys.APPLICANT_ADDRESS]: applicantAddress,
      [RedisKeys.INTENTION_FOR_ITEM]: saleIntention
    }

    return mockDataMap[redisKey]
  })

  RedisService.set = jest.fn()
}

const _checkSubheading = (document, id, expectedValue) => {
  const element = document.querySelector(`#${id}`)
  expect(element).toBeTruthy()
  expect(TestHelper.getTextContent(element)).toEqual(expectedValue)
}

const _checkSummary = (document, id) => {
  const element = document.querySelector(`#${id}`)
  expect(element).toBeTruthy()
}

const _checkSummaryKeys = (document, id, expectedValue) => {
  if (Array.isArray(expectedValue)) {
    const elements = document.querySelectorAll(`#${id} .${KEY_CLASS}`)
    expect(elements).toBeTruthy()
    elements.forEach((element, index) => {
      expect(TestHelper.getTextContent(element)).toEqual(expectedValue[index])
    })
  } else {
    const element = document.querySelector(`#${id} .${KEY_CLASS}`)
    expect(element).toBeTruthy()
    expect(TestHelper.getTextContent(element)).toEqual(expectedValue)
  }
}

const _checkSummaryValues = (document, id, expectedValue, indicies) => {
  if (Array.isArray(expectedValue)) {
    const elements = document.querySelectorAll(`#${id} .${VALUE_CLASS}`)
    expect(elements).toBeTruthy()

    if (indicies && indicies.length) {
      indicies.forEach(index => {
        expect(TestHelper.getTextContent(elements[index])).toEqual(
          expectedValue[index]
        )
      })
    } else {
      elements.forEach((element, index) => {
        expect(TestHelper.getTextContent(element)).toEqual(expectedValue[index])
      })
    }
  } else {
    const element = document.querySelector(`#${id} .${VALUE_CLASS}`)
    expect(element).toBeTruthy()
    expect(TestHelper.getTextContent(element)).toEqual(expectedValue)
  }
}

const _checkSummaryChangeLinks = (
  document,
  id,
  expectedValue,
  expectedPath
) => {
  if (Array.isArray(expectedValue)) {
    const elements = document.querySelectorAll(`#${id} .${LINK_CLASS}`)
    expect(elements).toBeTruthy()
    elements.forEach((element, index) => {
      TestHelper.checkLink(element, expectedValue[index], expectedPath[index])
    })
  } else {
    const element = document.querySelector(`#${id} .${LINK_CLASS}`)
    TestHelper.checkLink(element, expectedValue, expectedPath)
  }
}
