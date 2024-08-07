'use strict'

const TestHelper = require('../utils/test-helper')
const {
  AlreadyCertifiedOptions,
  BehalfOfBusinessOptions,
  BusinessOrIndividual,
  ItemType,
  Options,
  Paths,
  RedisKeys,
  Species
} = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const MAX_FILES = 6

const elementIds = {
  pageTitle: 'pageTitle',
  helpText: 'helpText',
  subHeadings: {
    item: 'itemHeading',
    photos: 'photosSubHeading',
    itemDescription: 'itemDescriptionSubHeading',
    exemptionReason: 'exemptionReasonHeading',
    documents: 'documentsSummaryHeading',
    owner: 'ownerSubHeading',
    saleIntention: 'saleIntentionSubHeading'
  },
  summaries: {
    item: 'itemSummary',
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
  legalDeclarationPara3: 'legalDeclarationPara3',
  legalDeclarationPara4: 'legalDeclarationPara4',
  legalAssertion1: 'legalAssertion1',
  legalAssertion2: 'legalAssertion2',
  legalAssertion3: 'legalAssertion3',
  legalAssertion4: 'legalAssertion4',
  legalAssertion5: 'legalAssertion5',
  legalAssertionsAdditional1: 'legalAssertionsAdditional1',
  somethingWrongWithCertificate: 'somethingWrongWithCertificate',
  agree: 'agree',
  callToAction: 'callToAction'
}

describe('/check-your-answers route', () => {
  let server
  const url = '/check-your-answers'
  const nextUrlMakePayment = '/make-payment'
  const nextUrlShareDetailsOfItem = '/share-details-of-item'

  let document

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    describe('GET: Common content', () => {
      beforeEach(async () => {
        _createMocks(ItemType.HIGH_VALUE)
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
    })

    describe('GET: Page sections', () => {
      beforeEach(async () => {
        _createMocks(ItemType.HIGH_VALUE, true, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct "Item" summary section', () => {
        _checkSubheading(document, elementIds.subHeadings.item, 'The item')

        _checkSummary(document, elementIds.summaries.item)

        _checkSummaryKeys(document, elementIds.summaries.item, [
          'Ivory type',
          'Type of exemption',
          'Already has a certificate',
          'Revoked certificate number',
          'Applied before'
        ])

        _checkSummaryValues(document, elementIds.summaries.item, [
          'Hippopotamus',
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
          'No',
          '',
          'No'
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.item,
          [
            'Change type of ivory',
            'Change type of exemption',
            'Change whether the item has a certificate',
            'Change revoked certificate number',
            'Change whether an application has been made before'
          ],
          [
            Paths.WHAT_SPECIES_EXPERT,
            Paths.WHAT_TYPE_OF_ITEM_IS_IT,
            Paths.ALREADY_CERTIFIED,
            Paths.REVOKED_CERTIFICATE,
            Paths.APPLIED_BEFORE
          ]
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
          'Change your photos',
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
          'Distinguishing features',
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
            'Change your description of the item',
            'Change where the ivory is',
            'Change any distinguishing features',
            'Change where it was made',
            'Change when it was made'
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

      it('should have the correct "Description" summary section when none of the optional fields have been entered', async () => {
        _createMocks(ItemType.HIGH_VALUE, false, false)
        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.itemDescription,
          'Description of the item'
        )

        _checkSummary(document, elementIds.summaries.itemDescription)

        _checkSummaryKeys(document, elementIds.summaries.itemDescription, [
          'What is it?',
          'Where’s the ivory?',
          'Distinguishing features',
          'Where was it made? (optional)',
          'When was it made? (optional)'
        ])

        _checkSummaryValues(document, elementIds.summaries.itemDescription, [
          mockItemDescriptionWithoutOptionalValues.whatIsItem,
          mockItemDescriptionWithoutOptionalValues.whereIsIvory,
          'None',
          'Nothing entered',
          'Nothing entered'
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.itemDescription,
          [
            'Change your description of the item',
            'Change where the ivory is',
            'Change any distinguishing features',
            'Change where it was made',
            'Change when it was made'
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
          'Why item qualifies for exemption'
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
            'Change your proof of age',
            'Change reason why item is of outstandingly high value'
          ],
          [Paths.IVORY_AGE, Paths.WHY_IS_ITEM_RMI]
        )
      })

      it('should have the correct "Documents" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.documents,
          'Supporting evidence'
        )

        _checkSummary(document, elementIds.summaries.documents)

        _checkSummaryKeys(
          document,
          elementIds.summaries.documents,
          'Your files'
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
          'Change your files',
          Paths.YOUR_DOCUMENTS
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
          'Change what owner intends to do',
          Paths.INTENTION_FOR_ITEM
        )
      })
    })

    describe('GET: Page sections - non-RMI item type', () => {
      beforeEach(async () => {
        _createMocks(ItemType.MUSICAL, true, false)
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
        _createMocks(ItemType.MUSEUM, true, false)
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
        _createMocks(ItemType.TEN_PERCENT, true, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct "Exemption Reason" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.exemptionReason,
          'Why item qualifies for exemption'
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
            'Change your proof of age',
            'Change your proof that item has less than 10% ivory',
            'Change reason why all ivory is integral to item'
          ],
          [Paths.IVORY_AGE, Paths.IVORY_VOLUME, Paths.IVORY_INTEGRAL]
        )
      })
    })

    describe('GET: Page sections for ItemType = MINIATURE', () => {
      beforeEach(async () => {
        _createMocks(ItemType.MINIATURE, true, false)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct "Exemption Reason" summary section', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.exemptionReason,
          'Why item qualifies for exemption'
        )

        _checkSummary(document, elementIds.summaries.exemptionReason)

        _checkSummaryKeys(
          document,
          elementIds.summaries.exemptionReason,
          'Proof of item’s age'
        )

        _checkSummaryValues(document, elementIds.summaries.exemptionReason, [
          'It has a stamp, serial number or signature to prove its ageI have a dated receipt showing when it was bought or repairedI have a dated publication that shows or describes the itemIt’s been in the family since before 1918I have written verification from a relevant expertI am an expert, and it’s my professional opinionIvory age reason',
          mockIvoryVolume.otherReason,
          ivoryIntegral
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.exemptionReason,
          [
            'Change your proof of age',
            'Change your proof that item has less than 10% ivory',
            'Change reason why all ivory is integral to item'
          ],
          [Paths.IVORY_AGE, Paths.IVORY_VOLUME, Paths.IVORY_INTEGRAL]
        )
      })
    })

    describe('GET: Page sections for "Owner’s details"', () => {
      it('should have the correct "Owner’s details" summary section - owned by applicant', async () => {
        _createMocks(ItemType.TEN_PERCENT)
        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner’s details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Do you own the item?',
          'Your name',
          'Your email',
          'Your address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          'Yes',
          mockOwnerContactDetails.fullName,
          mockOwnerContactDetails.emailAddress,
          ownerAddress
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.owner,
          [
            'Change who owns the item',
            'Change your name',
            'Change your email',
            'Change your address'
          ],
          [
            Paths.WHO_OWNS_ITEM,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_ADDRESS_FIND
          ]
        )
      })

      it('should have the correct "Owner’s details" summary section - answered selling on behalf of "the business I work for"', async () => {
        _createMocks(
          ItemType.TEN_PERCENT,
          true,
          false,
          BehalfOfBusinessOptions.BUSINESS_I_WORK_FOR
        )
        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner’s details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Do you own the item?',
          'Completing the service',
          'Who’s the owner?',
          'Your name',
          'Business name',
          'Your email',
          'Your address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          Options.NO,
          BusinessOrIndividual.AS_A_BUSINESS,
          BehalfOfBusinessOptions.BUSINESS_I_WORK_FOR,
          mockApplicantContactDetails.fullName,
          mockApplicantContactDetails.businessName,
          mockApplicantContactDetails.emailAddress,
          applicantAddress
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.owner,
          [
            'Change who owns the item',
            'Change the capacity you’re completing the service',
            'Change who owns the item',
            'Change your name',
            'Change business name',
            'Change your email',
            'Change your address'
          ],
          [
            Paths.WHO_OWNS_ITEM,
            Paths.WORK_FOR_A_BUSINESS,
            Paths.SELLING_ON_BEHALF_OF,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_ADDRESS_FIND
          ]
        )
      })

      it('should have the correct "Owner’s details" summary section - answered selling on behalf of "other"', async () => {
        _createMocks(
          ItemType.TEN_PERCENT,
          true,
          false,
          BehalfOfBusinessOptions.OTHER
        )
        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner’s details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Do you own the item?',
          'Completing the service',
          'Who’s the owner?',
          'Capacity you’re acting',
          'Your name',
          'Business name',
          'Your email',
          'Your address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          Options.NO,
          BusinessOrIndividual.AS_A_BUSINESS,
          BehalfOfBusinessOptions.OTHER,
          'Other',
          mockApplicantContactDetails.fullName,
          mockApplicantContactDetails.businessName,
          mockApplicantContactDetails.emailAddress,
          applicantAddress
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.owner,
          [
            'Change who owns the item',
            'Change the capacity you’re completing the service',
            'Change who owns the item',
            'Change the capacity you’re completing the service',
            'Change your name',
            'Change business name',
            'Change your email',
            'Change your address'
          ],
          [
            Paths.WHO_OWNS_ITEM,
            Paths.WORK_FOR_A_BUSINESS,
            Paths.SELLING_ON_BEHALF_OF,
            Paths.WHAT_CAPACITY,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_ADDRESS_FIND
          ]
        )
      })

      it('should have the correct "Owner’s details" summary section - all other scenarios', async () => {
        _createMocks(
          ItemType.TEN_PERCENT,
          true,
          false,
          BehalfOfBusinessOptions.AN_INDIVIDUAL
        )
        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner’s details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Do you own the item?',
          'Completing the service',
          'Who’s the owner?',
          'Owner’s name',
          'Owner’s email',
          'Owner’s address',
          'Your name',
          'Business name',
          'Your email',
          'Your address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          Options.NO,
          BusinessOrIndividual.AS_A_BUSINESS,
          BehalfOfBusinessOptions.AN_INDIVIDUAL,
          mockOwnerContactDetails.fullName,
          mockOwnerContactDetails.emailAddress,
          ownerAddress,
          mockApplicantContactDetails.fullName,
          mockApplicantContactDetails.businessName,
          mockApplicantContactDetails.emailAddress,
          applicantAddress
        ])

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.owner,
          [
            'Change who owns the item',
            'Change the capacity you’re completing the service',
            'Change who owns the item',
            'Change owner’s name',
            'Change owner’s email',
            'Change owner’s address',
            'Change your name',
            'Change business name',
            'Change your email',
            'Change your address'
          ],
          [
            Paths.WHO_OWNS_ITEM,
            Paths.WORK_FOR_A_BUSINESS,
            Paths.SELLING_ON_BEHALF_OF,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_CONTACT_DETAILS,
            Paths.OWNER_ADDRESS_FIND,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_CONTACT_DETAILS,
            Paths.APPLICANT_ADDRESS_FIND
          ]
        )
      })
    })

    describe('GET: Legal declarations', () => {
      describe('Summary paragraphs', () => {
        it('should have the correct heading and summary paragraphs when item is owned by applicant', async () => {
          _createMocks(ItemType.HIGH_VALUE)
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
            'Before you continue, you must agree with the following:'
          )

          element = document.querySelector(
            `#${elementIds.legalDeclarationPara2}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct heading and summary paragraphs when item is owned by applicant', async () => {
          _createMocks(ItemType.HIGH_VALUE, true, false)
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
            'Both you and the owner must also agree with the following:'
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
            'any replacement ivory that is from a listed species was taken from its source before 1 January 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
        })

        it('should have the correct legal declarations for ItemType = TEN_PERCENT', async () => {
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
            'any replacement ivory that is from a listed species was taken from its source before 1 January 1975'
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
            'the surface area of ivory on the miniature is no more than 320 square centimetres'
          )

          element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'any replacement ivory that is from a listed species was taken from its source before 1 January 1975'
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
            'the item is to be sold or hired out to a qualifying museum'
          )

          element = document.querySelector(`#${elementIds.legalAssertion2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )
        })

        it('should have the correct legal declarations for ItemType = HIGH_VALUE, not already certified', async () => {
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
            'any replacement ivory that is from a listed species was taken from its source before 1 January 1975'
          )

          element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information you’ve provided is complete and correct'
          )

          element = document.querySelector(
            `#${elementIds.legalDeclarationPara3}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'By making this application, I confirm that I believe:'
          )

          element = document.querySelector(
            `#${elementIds.legalAssertionsAdditional1}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the item is of outstandingly high artistic, cultural or historical value'
          )
        })

        it('should have the correct legal declarations for ItemType = HIGH_VALUE, Already Certified', async () => {
          _createMocks(
            ItemType.HIGH_VALUE,
            true,
            false,
            BehalfOfBusinessOptions.AN_INDIVIDUAL,
            true
          )

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(`#${elementIds.legalAssertion1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the information on the certificate remains accurate and complete'
          )

          element = document.querySelector(`#${elementIds.legalAssertion2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the exemption certificate relates to the item that is to be sold or hired out'
          )

          element = document.querySelector(`#${elementIds.legalAssertion3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'the item continues to satisfy the criteria of being of outstandingly high artistic, cultural or historical value'
          )

          element = document.querySelector(
            `#${elementIds.legalAssertionsAdditional1}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct summary text title, ItemType = HIGH_VALUE, Already Certified', async () => {
          _createMocks(
            ItemType.HIGH_VALUE,
            true,
            false,
            BehalfOfBusinessOptions.AN_INDIVIDUAL,
            true
          )

          document = await TestHelper.submitGetRequest(server, getOptions)

          const element = document.querySelector(
            `#${elementIds.somethingWrongWithCertificate} .govuk-details__summary-text`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Something is wrong with the certificate'
          )
        })

        it('should have the correct summary text details, ItemType = HIGH_VALUE, Already Certified', async () => {
          _createMocks(
            ItemType.HIGH_VALUE,
            true,
            false,
            BehalfOfBusinessOptions.AN_INDIVIDUAL,
            true
          )

          document = await TestHelper.submitGetRequest(server, getOptions)

          let element = document.querySelector(
            `#${elementIds.somethingWrongWithCertificate} .govuk-details__text > #${elementIds.legalDeclarationPara3}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            "If you notice something is inaccurate or missing from the item's certificate, you must contact the Animal Health and Plant Agency (APHA): IvoryAct@apha.gov.uk before continuing."
          )

          element = document.querySelector(
            `#${elementIds.somethingWrongWithCertificate} .govuk-details__text > #${elementIds.legalDeclarationPara4}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Make sure you include the certificate number in your email.'
          )
        })
      })
    })

    describe('GET: Call to action button', () => {
      it('should have the correct Call to Action button for Section 2 application', async () => {
        _createMocks(ItemType.HIGH_VALUE)
        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.callToAction}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Agree and continue')
      })

      it('should have the correct Call to Action button for Section 10 registration', async () => {
        _createMocks(ItemType.MUSICAL)
        document = await TestHelper.submitGetRequest(server, getOptions)

        const element = document.querySelector(`#${elementIds.callToAction}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Agree and submit')
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

      it('should progress to the correct route - Section 2', async () => {
        _createMocks(ItemType.HIGH_VALUE)
        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(response.headers.location).toEqual(nextUrlShareDetailsOfItem)
      })

      it('should progress to the correct route - Section 10', async () => {
        _createMocks(ItemType.MUSICAL)
        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(response.headers.location).toEqual(nextUrlMakePayment)
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

      it('should display a validation error message if the user does not supply mandatory itemSummary', async () => {
        _createEmptyMocks()
        postOptions.payload.agree = 'agree'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'itemSummary',
          'itemSummary-error',
          'You must provide the item details',
          'You must provide the item details',
          'There is a problem',
          true,
          false
        )
      })

      it('should display a validation error message if the user does not supply mandatory itemDescriptionSummary', async () => {
        _createMocksForDescription(ItemType.HIGH_VALUE)
        postOptions.payload.agree = 'agree'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'itemDescriptionSummary',
          'itemDescriptionSummary-error',
          'You must provide the description of item',
          'You must provide the description of item',
          'There is a problem',
          true,
          false
        )
      })

      it('should display a validation error message if the user does not supply mandatory photos', async () => {
        _createMocksForPhotos(ItemType.HIGH_VALUE)
        postOptions.payload.agree = 'agree'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'photoSummary',
          'photoSummary-error',
          'You must provide the photos of the item',
          'You must provide the photos of the item',
          'There is a problem',
          true,
          false
        )
      })

      it('should display a validation error message if the user does not supply mandatory photos', async () => {
        _createMocksForPhotos(ItemType.HIGH_VALUE)
        postOptions.payload.agree = 'agree'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'photoSummary',
          'photoSummary-error',
          'You must provide the photos of the item',
          'You must provide the photos of the item',
          'There is a problem',
          true,
          false
        )
      })

      it('should display a validation error message if the user does not supply sale Intention summary', async () => {
        _createMocksForSaleIntentionSummary(ItemType.HIGH_VALUE)
        postOptions.payload.agree = 'agree'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'saleIntentionSummary',
          'saleIntentionSummary-error',
          'You must provide the sale intention',
          'You must provide the sale intention',
          'There is a problem',
          true,
          false
        )
      })

      it('should display a validation error message if the user does not supply legal assertions', async () => {
        _createMocksForLegalAssertions('Test')
        postOptions.payload.agree = 'agree'
        const response = await TestHelper.submitPostRequest(
          server,
          postOptions,
          400
        )
        await TestHelper.checkValidationError(
          response,
          'legalAssertions',
          'legalAssertions-error',
          'You must provide the legal Assertions',
          'You must provide the legal Assertions',
          'There is a problem',
          true,
          false
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
  distinguishingFeatures: 'One of the feet is cracked',
  whereMade: 'Europe',
  whenMade: 'Georgian era'
}

const mockItemDescriptionWithoutOptionalValues = {
  whatIsItem: 'Chest of drawers',
  whereIsIvory: 'Chest has ivory knobs'
}

const mockPhotos = {
  files: ['1.png', '2.jpeg', '3.png', '4.jpeg', '5.png', '6.png'],
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
  'The ivory is essential to the design, if detached the item could no longer function as intended'

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
  fileSizes: [100, 200, 300, 400, 500, 600]
}

const mockOwnerContactDetails = {
  fullName: 'OWNER_NAME',
  emailAddress: 'OWNER@EMAIL.COM',
  confirmEmailAddress: 'OWNER@EMAIL.COM'
}

const mockApplicantContactDetails = {
  fullName: 'APPLICANT_NAME',
  businessName: 'APPLICANT_BUSINESS_NAME',
  emailAddress: 'APPLICANT@EMAIL.COM',
  confirmEmailAddress: 'APPLICANT@EMAIL.COM'
}

const ownerAddress = 'OWNER_ADDRESS'
const applicantAddress = 'APPLICANT_ADDRESS'

const saleIntention = 'Sell it'

const _getDefaultMocks = (itemType,
  includeOptionalItemDetails = true,
  ownedByApplicant = true,
  sellingOnBehalfOf = null,
  isAlreadyCertified = false
) => {
  return {
    [RedisKeys.WHAT_SPECIES]: Species.HIPPOPOTAMUS,
    [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType,
    [RedisKeys.DESCRIBE_THE_ITEM]: includeOptionalItemDetails
      ? mockItemDescription
      : mockItemDescriptionWithoutOptionalValues,
    [RedisKeys.UPLOAD_PHOTO]: mockPhotos,
    [RedisKeys.WHY_IS_ITEM_RMI]: whyRmi,
    [RedisKeys.IVORY_VOLUME]: mockIvoryVolume,
    [RedisKeys.IVORY_INTEGRAL]: ivoryIntegral,
    [RedisKeys.IVORY_AGE]: mockIvoryAge,
    [RedisKeys.UPLOAD_DOCUMENT]: mockDocuments,
    [RedisKeys.OWNED_BY_APPLICANT]: ownedByApplicant
      ? Options.YES
      : Options.NO,
    [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerContactDetails,
    [RedisKeys.APPLICANT_CONTACT_DETAILS]: ownedByApplicant
      ? mockOwnerContactDetails
      : mockApplicantContactDetails,
    [RedisKeys.OWNER_ADDRESS]: ownerAddress,
    [RedisKeys.APPLICANT_ADDRESS]: applicantAddress,
    [RedisKeys.INTENTION_FOR_ITEM]: saleIntention,
    [RedisKeys.WHAT_CAPACITY]: {
      whatCapacity: 'Other'
    },
    [RedisKeys.WORK_FOR_A_BUSINESS]: true,
    [RedisKeys.SELLING_ON_BEHALF_OF]: sellingOnBehalfOf,
    [RedisKeys.PREVIOUS_APPLICATION_NUMBER]: '',
    [RedisKeys.ALREADY_CERTIFIED]: {
      alreadyCertified: isAlreadyCertified
        ? AlreadyCertifiedOptions.YES
        : AlreadyCertifiedOptions.NO
    },
    [RedisKeys.REVOKED_CERTIFICATE]: '',
    [RedisKeys.APPLIED_BEFORE]: '',
    [RedisKeys.PREVIOUS_APPLICATION_NUMBER]: ''
  }
}

const _createMocks = (
  itemType,
  includeOptionalItemDetails = true,
  ownedByApplicant = true,
  sellingOnBehalfOf = null,
  isAlreadyCertified = false
) => {
  TestHelper.createMocks()

  const defaultMocks = _getDefaultMocks(
    itemType,
    includeOptionalItemDetails,
    ownedByApplicant,
    sellingOnBehalfOf,
    isAlreadyCertified
  )

  RedisService.get = jest.fn((request, redisKey) => {
    const mockDataMap = { ...defaultMocks }

    return mockDataMap[redisKey]
  })
}

const _createEmptyMocks = () => {
  TestHelper.createMocks()
  RedisService.get = jest.fn((request, redisKey) => {
    const mockDataMap = {
    }
    return mockDataMap[redisKey]
  })
}

const _createMocksForDescription = (itemType) => {
  TestHelper.createMocks()
  RedisService.get = jest.fn((request, redisKey) => {
    const defaultMocks = _getDefaultMocks(itemType)
    const mockDataMap = {
      ...defaultMocks,
      [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType,
      [RedisKeys.DESCRIBE_THE_ITEM]: null
    }
    return mockDataMap[redisKey]
  })
}

const _createMocksForPhotos = (itemType,
  includeOptionalItemDetails = true) => {
  TestHelper.createMocks()
  RedisService.get = jest.fn((request, redisKey) => {
    const defaultMocks = _getDefaultMocks(itemType, includeOptionalItemDetails)
    const mockDataMap = {
      ...defaultMocks,
      [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType,
      [RedisKeys.DESCRIBE_THE_ITEM]: includeOptionalItemDetails
        ? mockItemDescription
        : mockItemDescriptionWithoutOptionalValues,
      [RedisKeys.UPLOAD_PHOTO]: null
    }
    return mockDataMap[redisKey]
  })
}

const _createMocksForSaleIntentionSummary = (itemType,
  includeOptionalItemDetails = true, ownedByApplicant = true) => {
  TestHelper.createMocks()
  RedisService.get = jest.fn((request, redisKey) => {
    const defaultMocks = _getDefaultMocks(itemType, includeOptionalItemDetails, ownedByApplicant)
    const mockDataMap = {
      ...defaultMocks,
      [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType,
      [RedisKeys.DESCRIBE_THE_ITEM]: includeOptionalItemDetails
        ? mockItemDescription
        : mockItemDescriptionWithoutOptionalValues,
      [RedisKeys.UPLOAD_PHOTO]: mockPhotos,
      [RedisKeys.OWNED_BY_APPLICANT]: ownedByApplicant
        ? Options.YES
        : Options.NO,
      [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerContactDetails,
      [RedisKeys.APPLICANT_CONTACT_DETAILS]: ownedByApplicant
        ? mockOwnerContactDetails
        : mockApplicantContactDetails,
      [RedisKeys.OWNER_ADDRESS]: ownerAddress,
      [RedisKeys.INTENTION_FOR_ITEM]: null
    }
    return mockDataMap[redisKey]
  })
}

const _createMocksForLegalAssertions = (itemType,
  includeOptionalItemDetails = true, ownedByApplicant = true) => {
  TestHelper.createMocks()
  RedisService.get = jest.fn((request, redisKey) => {
    const defaultMocks = _getDefaultMocks(itemType, includeOptionalItemDetails, ownedByApplicant)
    const mockDataMap = {
      ...defaultMocks,
      [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: itemType,
      [RedisKeys.DESCRIBE_THE_ITEM]: includeOptionalItemDetails
        ? mockItemDescription
        : mockItemDescriptionWithoutOptionalValues,
      [RedisKeys.UPLOAD_PHOTO]: mockPhotos,
      [RedisKeys.OWNED_BY_APPLICANT]: ownedByApplicant
        ? Options.YES
        : Options.NO,
      [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerContactDetails,
      [RedisKeys.APPLICANT_CONTACT_DETAILS]: ownedByApplicant
        ? mockOwnerContactDetails
        : mockApplicantContactDetails,
      [RedisKeys.OWNER_ADDRESS]: ownerAddress,
      [RedisKeys.INTENTION_FOR_ITEM]: saleIntention
    }
    return mockDataMap[redisKey]
  })
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
