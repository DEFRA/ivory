'use strict'

jest.mock('../../../server/services/odata.service')
const ODataService = require('../../../server/services/odata.service')

const TestHelper = require('../../utils/test-helper')

const mockEntity = require('../../mock-data/section-2-entity')
const {
  AlreadyCertifiedOptions,
  DataVerseFieldName
} = require('../../../server/utils/constants')

const {
  AgeExemptionReasonReverseLookup,
  AlreadyCertifiedLookup
} = require('../../../server/services/dataverse-choice-lookups')

const KEY = '___THE_KEY___'

const elementIds = {
  pageTitle: 'pageTitle',
  downloadApplicationPdfLink: 'downloadApplicationPdfLink',
  downloadApplicationPdfHelpText: 'downloadApplicationPdfHelpText',
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
  ivoryAgeReason: 'ivoryAgeReason',
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
  photo5: 'photo5'
}

describe('/pass-data-to-pi/application-details route', () => {
  let server
  const url = `/pass-data-to-pi/application-details?id=123&key=${KEY}`

  const getOptions = {
    method: 'GET',
    url
  }

  let document

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    describe('Common content', () => {
      beforeEach(async () => {
        _createMocks()
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', async () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should NOT have the Back link', () => {
        TestHelper.checkBackLink(document, false)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          `Ivory application: ${mockEntity.cre2c_name}`
        )
      })

      it('should have the correct application details download link', () => {
        const element = document.querySelector(
          `#${elementIds.downloadApplicationPdfLink}`
        )
        TestHelper.checkLink(
          element,
          'Download details of application (PDF)',
          `/pass-data-to-pi/application-details-pdf?id=${
            mockEntity[DataVerseFieldName.SECTION_2_CASE_ID]
          }&key=${KEY}`
        )
      })

      it('should have the correct application details download help text', () => {
        const element = document.querySelector(
          `#${elementIds.downloadApplicationPdfHelpText}`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You will need to download images and supporting documents separately.'
        )
      })
    })

    describe('GET: Page sections for "Owner and applicant" details"', () => {
      it('should have the correct content - owned by appicant', async () => {
        _createMocks({
          isOwnedByApplicant: true,
          alreadyCertified: AlreadyCertifiedLookup[AlreadyCertifiedOptions.NO],
          hasAppliedBefore: false
        })

        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner’s details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Owner’s name',
          'Owner’s address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          mockEntity[DataVerseFieldName.OWNER_NAME],
          `${mockEntity[DataVerseFieldName.OWNER_ADDRESS]}, ${
            mockEntity[DataVerseFieldName.OWNER_POSTCODE]
          }`
        ])
      })

      it('should have the correct content - NOT owned by appicant', async () => {
        _createMocks({
          isOwnedByApplicant: false,
          alreadyCertified: AlreadyCertifiedLookup[AlreadyCertifiedOptions.NO],
          hasAppliedBefore: false
        })

        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(
          document,
          elementIds.subHeadings.owner,
          'Owner and applicant details'
        )

        _checkSummary(document, elementIds.summaries.owner)

        _checkSummaryKeys(document, elementIds.summaries.owner, [
          'Owner’s name',
          'Owner’s address',
          'Applicant’s name',
          'Applicant’s address'
        ])

        _checkSummaryValues(document, elementIds.summaries.owner, [
          mockEntity[DataVerseFieldName.OWNER_NAME],
          `${mockEntity[DataVerseFieldName.OWNER_ADDRESS]}, ${
            mockEntity[DataVerseFieldName.OWNER_POSTCODE]
          }`,
          mockEntity[DataVerseFieldName.APPLICANT_NAME],
          `${mockEntity[DataVerseFieldName.APPLICANT_ADDRESS]}, ${
            mockEntity[DataVerseFieldName.APPLICANT_POSTCODE]
          }`
        ])
      })
    })

    describe('"The item" section', () => {
      it('should have the correct content when "Already has certificate" is "It used to"', async () => {
        _createMocks({
          isOwnedByApplicant: true,
          alreadyCertified:
            AlreadyCertifiedLookup[AlreadyCertifiedOptions.USED_TO],
          hasAppliedBefore: false
        })

        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(document, elementIds.subHeadings.item, 'The item')

        _checkSummary(document, elementIds.summaries.item)

        _checkSummaryKeys(document, elementIds.summaries.item, [
          'Type of exemption',
          'Already has a certificate',
          'Revoked certificate number'
        ])

        _checkSummaryValues(document, elementIds.summaries.item, [
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
          'It used to',
          REVOKED_CERTIFICATE_NUMBER
        ])
      })

      it('should have the correct content when "Already has certificate" is "No", has not applied before', async () => {
        _createMocks({
          isOwnedByApplicant: true,
          alreadyCertified: AlreadyCertifiedLookup[AlreadyCertifiedOptions.NO],
          hasAppliedBefore: false
        })

        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(document, elementIds.subHeadings.item, 'The item')

        _checkSummary(document, elementIds.summaries.item)

        _checkSummaryKeys(document, elementIds.summaries.item, [
          'Type of exemption',
          'Already has a certificate',
          'Applied before'
        ])

        _checkSummaryValues(document, elementIds.summaries.item, [
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
          'No',
          'No'
        ])
      })

      it('should have the correct content when "Already has certificate" is "No", has applied before', async () => {
        _createMocks({
          isOwnedByApplicant: true,
          alreadyCertified: AlreadyCertifiedLookup[AlreadyCertifiedOptions.NO],
          hasAppliedBefore: true
        })

        document = await TestHelper.submitGetRequest(server, getOptions)

        _checkSubheading(document, elementIds.subHeadings.item, 'The item')

        _checkSummary(document, elementIds.summaries.item)

        _checkSummaryKeys(document, elementIds.summaries.item, [
          'Type of exemption',
          'Already has a certificate',
          'Applied before',
          'Previous application number'
        ])

        _checkSummaryValues(document, elementIds.summaries.item, [
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value',
          'No',
          'Yes',
          mockEntity[DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER]
        ])
      })
    })

    describe('"Description of the item" section', () => {
      beforeEach(async () => {
        _createMocks()
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct content', () => {
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

        _checkSummaryValues(document, elementIds.summaries.itemDescription, [
          mockEntity[DataVerseFieldName.ITEM_SUMMARY],
          mockEntity[DataVerseFieldName.WHERE_IS_THE_IVORY],
          mockEntity[DataVerseFieldName.UNIQUE_FEATURES],
          mockEntity[DataVerseFieldName.WHERE_IT_WAS_MADE],
          mockEntity[DataVerseFieldName.WHEN_IT_WAS_MADE]
        ])
      })
    })

    describe('"Exemption Reason" summary section', () => {
      beforeEach(async () => {
        _createMocks()
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct content', () => {
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

        const reasons = mockEntity[DataVerseFieldName.WHY_AGE_EXEMPT].split(',')

        for (let i = 0; i < reasons.length - 1; i++) {
          const element = document.querySelector(
            `#${elementIds.ivoryAgeReason}${i}`
          )
          expect(element).toBeTruthy()

          expect(TestHelper.getTextContent(element)).toEqual(
            AgeExemptionReasonReverseLookup[parseInt(reasons[i])]
          )
        }

        const element = document.querySelector(
          `#${elementIds.ivoryAgeReason}${reasons.length - 1}`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          mockEntity[DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON]
        )
      })
    })

    describe('"Photos" summary section', () => {
      beforeEach(async () => {
        _createMocks()
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct content', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.photos,
          'Photos of the item'
        )

        _checkSummary(document, elementIds.summaries.photos)

        _checkSummaryKeys(document, elementIds.summaries.photos, [
          'Photo 1',
          'Photo 2',
          'Photo 3',
          'Photo 4'
        ])

        for (let i = 1; i <= 4; i++) {
          const element = document.querySelector(
            `#${elementIds.summaries.photos} #photo${i}`
          )
          expect(element).toBeTruthy()
        }

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.photos,
          [
            'Download Photo 1',
            'Download Photo 2',
            'Download Photo 3',
            'Download Photo 4'
          ],
          [
            `/pass-data-to-pi/application-photos?record_id=${
              mockEntity[DataVerseFieldName.SECTION_2_CASE_ID]
            }&index=1&key=${KEY}`,
            `/pass-data-to-pi/application-photos?record_id=${
              mockEntity[DataVerseFieldName.SECTION_2_CASE_ID]
            }&index=3&key=${KEY}`,
            `/pass-data-to-pi/application-photos?record_id=${
              mockEntity[DataVerseFieldName.SECTION_2_CASE_ID]
            }&index=4&key=${KEY}`,
            `/pass-data-to-pi/application-photos?record_id=${
              mockEntity[DataVerseFieldName.SECTION_2_CASE_ID]
            }&index=5&key=${KEY}`
          ]
        )
      })
    })

    describe('"Documents" summary section', () => {
      beforeEach(async () => {
        _createMocks()
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct content', () => {
        _checkSubheading(
          document,
          elementIds.subHeadings.documents,
          'Documents to support application'
        )

        _checkSummary(document, elementIds.summaries.documents)

        _checkSummaryKeys(document, elementIds.summaries.documents, [
          'Document 1',
          'Document 2',
          'Document 3',
          'Document 4'
        ])

        for (let i = 0; i < 4; i++) {
          const element = document.querySelector(
            `#${elementIds.summaries.documents} #document${i}`
          )
          expect(element).toBeTruthy()
        }

        _checkSummaryChangeLinks(
          document,
          elementIds.summaries.documents,
          [
            'Download Document 1',
            'Download Document 2',
            'Download Document 3',
            'Download Document 4'
          ],
          [
            `/pass-data-to-pi/application-documents?id=97b52b94-e758-ec11-8f8f-000d3ad5417a&key=${KEY}`,
            `/pass-data-to-pi/application-documents?id=4e9f249a-e758-ec11-8f8f-000d3ad5417a&key=${KEY}`,
            `/pass-data-to-pi/application-documents?id=e1b0249a-e758-ec11-8f8f-000d3ad5417a&key=${KEY}`,
            `/pass-data-to-pi/application-documents?id=3bff1ca0-e758-ec11-8f8f-000d3ad5417a&key=${KEY}`
          ]
        )
      })
    })
  })
})

const KEY_CLASS = 'govuk-summary-list__key'
const VALUE_CLASS = 'govuk-summary-list__value'
const LINK_CLASS = 'govuk-link'

const REVOKED_CERTIFICATE_NUMBER = 'REV-123'

const _createMocks = (
  params = {
    isOwnedByApplicant: null,
    alreadyCertified: AlreadyCertifiedLookup[AlreadyCertifiedOptions.NO],
    hasAppliedBefore: false
  }
) => {
  TestHelper.createMocks()

  const testEntity = Object.assign({}, mockEntity)

  if (params.isOwnedByApplicant) {
    testEntity[DataVerseFieldName.OWNED_BY_APPLICANT] =
      params.isOwnedByApplicant
  }

  testEntity[DataVerseFieldName.ALREADY_HAS_CERTIFICATE] =
    params.alreadyCertified

  if (
    params.alreadyCertified ===
    AlreadyCertifiedLookup[AlreadyCertifiedOptions.USED_TO]
  ) {
    testEntity[
      DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER
    ] = REVOKED_CERTIFICATE_NUMBER
  }

  if (params.hasAppliedBefore) {
    testEntity[DataVerseFieldName.APPLIED_BEFORE] = params.hasAppliedBefore
  }

  ODataService.getRecord = jest.fn().mockResolvedValue(testEntity)
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
