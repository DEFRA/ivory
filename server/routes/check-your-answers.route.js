'use strict'

const path = require('path')

const AnalyticsService = require('../services/analytics.service')
const RedisHelper = require('../services/redis-helper.service')
const RedisService = require('../services/redis.service')

const {
  Analytics,
  ItemType,
  Options,
  Paths,
  RedisKeys,
  Views,
  AlreadyCertifiedOptions
} = require('../utils/constants')
const { getIvoryVolumePercentage } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.CHECK_YOUR_ANSWERS, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.CHECK_YOUR_ANSWERS, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.CONFIRM,
      label: context.pageTitle
    })

    return h.redirect(Paths.MAKE_PAYMENT)
  }
}

const _getContext = async request => {
  const itemType = await RedisHelper.getItemType(request)
  const isSection2 = await RedisHelper.isSection2(request, itemType)
  const isMesuem = await RedisHelper.isMuseum(request, itemType)
  const isOwnedByApplicant = await RedisHelper.isOwnedByApplicant(request)
  const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

  const [
    itemSummary,
    documentSummary,
    exemptionReasonSummary,
    itemDescriptionSummary,
    ownerSummary,
    photoSummary,
    saleIntentionSummary
  ] = await Promise.all([
    _getItemSummary(request, itemType),
    isSection2 ? _getDocumentSummary(request) : null,
    _getExemptionReasonSummary(request, itemType, isSection2, isMesuem),
    _getItemDescriptionSummary(request, isSection2),
    _getOwnerSummary(request, isOwnedByApplicant),
    _getPhotoSummary(request),
    _getSaleIntentionSummary(request)
  ])

  return {
    itemSummary,
    photoSummary,
    itemDescriptionSummary,
    exemptionReasonSummary,
    documentSummary,
    saleIntentionSummary,
    ownerSummary,
    isSection2,
    isOwnedByApplicant,
    isMesuem,
    isAlreadyCertified,
    pageTitle: 'Check your answers',
    legalAssertions: isAlreadyCertified
      ? LEGAL_ASSERTIONS.Section2AlreadyCertified
      : LEGAL_ASSERTIONS[itemType],
    legalAssertionsAdditionalSection2: isAlreadyCertified
      ? null
      : LEGAL_ASSERTIONS.additionalSection2
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.agree)) {
    errors.push({
      name: 'agree',
      text: 'You must agree with the legal declaration'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CHECK_YOUR_ANSWERS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CHECK_YOUR_ANSWERS}`,
    handler: handlers.post
  }
]

const _getDocumentSummary = async request => {
  let uploadDocuments = await RedisService.get(
    request,
    RedisKeys.UPLOAD_DOCUMENT
  )

  if (!uploadDocuments) {
    uploadDocuments = {
      files: [],
      fileData: [],
      fileSizes: []
    }
  }

  const documentRows = uploadDocuments.files.map((file, index) => {
    return `<p id="document${index}">${file}</p>`
  })

  return [
    _getSummaryListRow(
      'Your documents',
      documentRows && documentRows.length
        ? documentRows.join('')
        : NO_DOCUMENTS_ADDED,
      _getChangeItems(Paths.YOUR_DOCUMENTS, CHANGE_LINK_HINT.YourFiles),
      true
    )
  ]
}

const _getExemptionReasonSummary = async (
  request,
  itemType,
  isSection2,
  isMesuem
) => {
  const ivoryAge = await RedisService.get(request, RedisKeys.IVORY_AGE)

  if (ivoryAge && ivoryAge.otherReason) {
    ivoryAge.ivoryAge.pop()
    ivoryAge.ivoryAge.push(ivoryAge.otherReason)
  }

  const ivoryAgeFormatted =
    ivoryAge && ivoryAge.ivoryAge
      ? ivoryAge.ivoryAge.map((reason, index) => {
          return `<li id="ivoryAgeReason${index}">${reason}</li>`
        })
      : []

  const ivoryAgeList = `<ul>${ivoryAgeFormatted.join('')}</ul>`

  const whyRmi = await RedisService.get(request, RedisKeys.WHY_IS_ITEM_RMI)
  const ivoryVolume = await RedisService.get(request, RedisKeys.IVORY_VOLUME)

  let ivoryVolumeFormatted

  if (ivoryVolume) {
    ivoryVolumeFormatted =
      ivoryVolume.ivoryVolume === 'Other reason'
        ? ivoryVolume.otherReason
        : ivoryVolume.ivoryVolume
  }

  let ivoryIntegral = await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)
  if (ivoryIntegral === 'Both of the above') {
    ivoryIntegral =
      'The ivory is essential to the design, if detached the item could no longer function as intended and you cannot remove the ivory easily or without damaging the item'
  }

  const ivoryVolumePercentage = getIvoryVolumePercentage(itemType)

  let exemptionReasonSummary
  if (!isMesuem) {
    exemptionReasonSummary = [
      _getSummaryListRow(
        'Proof of item’s age',
        ivoryAgeList,
        _getChangeItems(Paths.IVORY_AGE, CHANGE_LINK_HINT.ItemAge),
        true
      )
    ]

    if (isSection2) {
      exemptionReasonSummary.push(
        _getSummaryListRow(
          'Why it’s of outstandingly high value',
          whyRmi,
          _getChangeItems(Paths.WHY_IS_ITEM_RMI, CHANGE_LINK_HINT.WhyRmi)
        )
      )
    } else {
      exemptionReasonSummary.push(
        _getSummaryListRow(
          `Proof it has less than ${ivoryVolumePercentage}% ivory`,
          ivoryVolumeFormatted,
          _getChangeItems(
            Paths.IVORY_VOLUME,
            CHANGE_LINK_HINT.IvoryVolme.replace(
              '[##PERCENTAGE##]',
              ivoryVolumePercentage
            )
          )
        )
      )
    }

    if (itemType === ItemType.TEN_PERCENT) {
      exemptionReasonSummary.push(
        _getSummaryListRow(
          'Why all ivory is integral',
          ivoryIntegral,
          _getChangeItems(
            Paths.IVORY_INTEGRAL,
            CHANGE_LINK_HINT.WhyIvoryIntegral
          )
        )
      )
    }
  }

  return exemptionReasonSummary
}

const _getItemSummary = async (request, itemType) => {
  const itemSummary = [
    _getSummaryListRow(
      'Type of exemption',
      itemType,
      _getChangeItems(
        Paths.WHAT_TYPE_OF_ITEM_IS_IT,
        CHANGE_LINK_HINT.ExemptionType
      )
    )
  ]

  const isSection2 = await RedisHelper.isSection2(null, itemType)

  if (isSection2) {
    const alreadyCertified = await RedisService.get(
      request,
      RedisKeys.ALREADY_CERTIFIED
    )

    const isAlreadyCertified = await RedisHelper.isAlreadyCertified(
      request,
      alreadyCertified
    )

    const revokedCertificateNumber = await RedisService.get(
      request,
      RedisKeys.REVOKED_CERTIFICATE
    )

    const isRevoked = await RedisHelper.isRevoked(
      request,
      revokedCertificateNumber
    )

    const hasAppliedBefore = await RedisHelper.hasAppliedBefore(request)

    itemSummary.push(
      _getSummaryListRow(
        'Already has a certificate',
        alreadyCertified.alreadyCertified,
        _getChangeItems(Paths.ALREADY_CERTIFIED, CHANGE_LINK_HINT.WhereMade)
      )
    )

    if (isAlreadyCertified) {
      itemSummary.push(
        _getSummaryListRow(
          'Certificate number',
          alreadyCertified.certificateNumber,
          _getChangeItems(Paths.ALREADY_CERTIFIED, CHANGE_LINK_HINT.WhereMade)
        )
      )
    }

    if (isRevoked) {
      itemSummary.push(
        _getSummaryListRow(
          'Revoked certificate number',
          revokedCertificateNumber,
          _getChangeItems(Paths.REVOKED_CERTIFICATE, CHANGE_LINK_HINT.WhereMade)
        )
      )
    }

    if (alreadyCertified.alreadyCertified === AlreadyCertifiedOptions.NO) {
      itemSummary.push(
        _getSummaryListRow(
          'Applied before',
          hasAppliedBefore ? Options.YES : Options.NO,
          _getChangeItems(Paths.APPLIED_BEFORE, CHANGE_LINK_HINT.WhereMade)
        )
      )
    }

    if (hasAppliedBefore) {
      const previousApplicationNumber = await RedisService.get(
        request,
        RedisKeys.PREVIOUS_APPLICATION_NUMBER
      )

      itemSummary.push(
        _getSummaryListRow(
          'Previous application number',
          previousApplicationNumber,
          _getChangeItems(
            Paths.PREVIOUS_APPLICATION_NUMBER,
            CHANGE_LINK_HINT.WhereMade
          )
        )
      )
    }
  }

  return itemSummary
}

const _getItemDescriptionSummary = async (request, isSection2) => {
  const itemDescription =
    (await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)) || {}

  const itemDescriptionSummary = [
    _getSummaryListRow(
      'What is it?',
      itemDescription.whatIsItem,
      _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.WhatIsItem)
    ),
    _getSummaryListRow(
      'Where’s the ivory?',
      itemDescription.whereIsIvory,
      _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.WhereIsIvory)
    ),
    _getSummaryListRow(
      'Distinguishing features',
      itemDescription.distinguishingFeatures || NONE,
      _getChangeItems(
        Paths.DESCRIBE_THE_ITEM,
        CHANGE_LINK_HINT.DistinguishingFeatures
      )
    )
  ]

  if (isSection2) {
    itemDescriptionSummary.push(
      _getSummaryListRow(
        'Where was it made? (optional)',
        itemDescription.whereMade || NOTHING_ENTERED,
        _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.WhereMade)
      )
    )
    itemDescriptionSummary.push(
      _getSummaryListRow(
        'When was it made? (optional)',
        itemDescription.whenMade || NOTHING_ENTERED,
        _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.WhenMade)
      )
    )
  }

  return itemDescriptionSummary
}

const _getOwnerSummary = async (request, isOwnedByApplicant) => {
  const sellingOnBehalfOf = await RedisService.get(
    request,
    RedisKeys.SELLING_ON_BEHALF_OF
  )

  const workForABusiness = await RedisService.get(
    request,
    RedisKeys.WORK_FOR_A_BUSINESS
  )

  const capacity = _formatCapacity(
    await RedisService.get(request, RedisKeys.WHAT_CAPACITY)
  )

  const ownerContactDetails =
    (await RedisService.get(request, RedisKeys.OWNER_CONTACT_DETAILS)) || {}

  let ownerAddress = await RedisService.get(request, RedisKeys.OWNER_ADDRESS)
  ownerAddress = _formatAddress(ownerAddress)

  const applicantContactDetails =
    (await RedisService.get(request, RedisKeys.APPLICANT_CONTACT_DETAILS)) || {}

  let applicantAddress = await RedisService.get(
    request,
    RedisKeys.APPLICANT_ADDRESS
  )
  applicantAddress = _formatAddress(applicantAddress)

  const ownerSummary = [
    _getSummaryListRow(
      'Do you own the item?',
      isOwnedByApplicant ? Options.YES : Options.NO,
      _getChangeItems(Paths.WHO_OWNS_ITEM, CHANGE_LINK_HINT.WhoOwnsTheItem)
    )
  ]

  if (isOwnedByApplicant) {
    await _getOwnerSummaryOwnedByApplicant(
      ownerSummary,
      ownerContactDetails,
      ownerAddress
    )
  } else {
    if (sellingOnBehalfOf === 'The business I work for') {
      await _getOwnerSummaryApplicantBusiness(
        ownerSummary,
        workForABusiness,
        sellingOnBehalfOf,
        applicantContactDetails,
        applicantAddress
      )
    } else if (sellingOnBehalfOf === 'Other') {
      await _getOwnerSummaryApplicantOther(
        ownerSummary,
        workForABusiness,
        sellingOnBehalfOf,
        capacity,
        applicantContactDetails,
        applicantAddress
      )
    } else {
      await _getOwnerSummaryApplicantDefault(
        ownerSummary,
        workForABusiness,
        sellingOnBehalfOf,
        ownerContactDetails,
        ownerAddress,
        applicantContactDetails,
        applicantAddress
      )
    }
  }

  return ownerSummary
}

const _formatAddress = address => {
  const firstCommaReplacementToken = '###'

  if (address) {
    address = address.replace(', ', firstCommaReplacementToken)
    address = address.replaceAll(', ', '<br/>')
    address = address.replace(firstCommaReplacementToken, ', ')
  }
  return address
}

const _formatCapacity = whatCapacity => {
  let capacity
  if (whatCapacity && whatCapacity.whatCapacity) {
    capacity = whatCapacity.whatCapacity

    if (capacity === 'Other') {
      capacity += ` - ${whatCapacity.otherCapacity}`
    }
  }

  return capacity
}

const _getOwnerSummaryOwnedByApplicant = async (
  ownerSummary,
  ownerContactDetails,
  ownerAddress
) => {
  ownerSummary.push(
    _getSummaryListRow(
      'Your name',
      ownerContactDetails.fullName,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourName
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your email',
      ownerContactDetails.emailAddress,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourEmail
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your address',
      ownerAddress,
      _getChangeItems(
        Paths.APPLICANT_ADDRESS_FIND,
        CHANGE_LINK_HINT.YourAddress
      ),
      true
    )
  )
}

const _getOwnerSummaryApplicantBusiness = async (
  ownerSummary,
  workForABusiness,
  sellingOnBehalfOf,
  applicantContactDetails,
  applicantAddress
) => {
  ownerSummary.push(
    _getSummaryListRow(
      'Work for a business',
      workForABusiness,
      _getChangeItems(
        Paths.WORK_FOR_A_BUSINESS,
        CHANGE_LINK_HINT.WorkForABusiness
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Selling on behalf of',
      sellingOnBehalfOf,
      _getChangeItems(
        Paths.SELLING_ON_BEHALF_OF,
        CHANGE_LINK_HINT.WhoOwnsTheItem
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your name',
      applicantContactDetails.fullName,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourName
      )
    )
  )

  if (workForABusiness === Options.YES) {
    ownerSummary.push(
      _getSummaryListRow(
        'Business name',
        applicantContactDetails.businessName || NOTHING_ENTERED,
        _getChangeItems(
          Paths.APPLICANT_CONTACT_DETAILS,
          CHANGE_LINK_HINT.BusinessName
        )
      )
    )
  }

  ownerSummary.push(
    _getSummaryListRow(
      'Your email',
      applicantContactDetails.emailAddress,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourEmail
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your address',
      applicantAddress,
      _getChangeItems(
        Paths.APPLICANT_ADDRESS_FIND,
        CHANGE_LINK_HINT.YourAddress
      ),
      true
    )
  )
}

const _getOwnerSummaryApplicantOther = async (
  ownerSummary,
  workForABusiness,
  sellingOnBehalfOf,
  capacity,
  applicantContactDetails,
  applicantAddress
) => {
  ownerSummary.push(
    _getSummaryListRow(
      'Work for a business',
      workForABusiness,
      _getChangeItems(
        Paths.WORK_FOR_A_BUSINESS,
        CHANGE_LINK_HINT.WorkForABusiness
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Selling on behalf of',
      sellingOnBehalfOf,
      _getChangeItems(
        Paths.SELLING_ON_BEHALF_OF,
        CHANGE_LINK_HINT.WhoOwnsTheItem
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Capacity you’re acting',
      capacity,
      _getChangeItems(Paths.WHAT_CAPACITY, CHANGE_LINK_HINT.WorkForABusiness)
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your name',
      applicantContactDetails.fullName,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourName
      )
    )
  )

  if (workForABusiness === Options.YES) {
    ownerSummary.push(
      _getSummaryListRow(
        'Business name',
        applicantContactDetails.businessName || NOTHING_ENTERED,
        _getChangeItems(
          Paths.APPLICANT_CONTACT_DETAILS,
          CHANGE_LINK_HINT.BusinessName
        )
      )
    )
  }

  ownerSummary.push(
    _getSummaryListRow(
      'Your email',
      applicantContactDetails.emailAddress,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourEmail
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your address',
      applicantAddress,
      _getChangeItems(
        Paths.APPLICANT_ADDRESS_FIND,
        CHANGE_LINK_HINT.YourAddress
      ),
      true
    )
  )
}

const _getOwnerSummaryApplicantDefault = async (
  ownerSummary,
  workForABusiness,
  sellingOnBehalfOf,
  ownerContactDetails,
  ownerAddress,
  applicantContactDetails,
  applicantAddress
) => {
  ownerSummary.push(
    _getSummaryListRow(
      'Work for a business',
      workForABusiness,
      _getChangeItems(
        Paths.WORK_FOR_A_BUSINESS,
        CHANGE_LINK_HINT.WorkForABusiness
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Selling on behalf of',
      sellingOnBehalfOf,
      _getChangeItems(
        Paths.SELLING_ON_BEHALF_OF,
        CHANGE_LINK_HINT.WhoOwnsTheItem
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Owner’s name',
      ownerContactDetails.fullName || ownerContactDetails.businessName,
      _getChangeItems(Paths.OWNER_CONTACT_DETAILS, CHANGE_LINK_HINT.OwnerName)
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Owner’s email',
      ownerContactDetails.emailAddress || 'None given',
      _getChangeItems(Paths.OWNER_CONTACT_DETAILS, CHANGE_LINK_HINT.OwnerEmail)
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Owner’s address',
      ownerAddress,
      _getChangeItems(Paths.OWNER_ADDRESS_FIND, CHANGE_LINK_HINT.OwnerAddress),
      true
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your name',
      applicantContactDetails.fullName,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourName
      )
    )
  )

  if (workForABusiness === Options.YES) {
    ownerSummary.push(
      _getSummaryListRow(
        'Business name',
        applicantContactDetails.businessName || NOTHING_ENTERED,
        _getChangeItems(
          Paths.APPLICANT_CONTACT_DETAILS,
          CHANGE_LINK_HINT.BusinessName
        )
      )
    )
  }

  ownerSummary.push(
    _getSummaryListRow(
      'Your email',
      applicantContactDetails.emailAddress,
      _getChangeItems(
        Paths.APPLICANT_CONTACT_DETAILS,
        CHANGE_LINK_HINT.YourEmail
      )
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Your address',
      applicantAddress,
      _getChangeItems(
        Paths.APPLICANT_ADDRESS_FIND,
        CHANGE_LINK_HINT.YourAddress
      ),
      true
    )
  )
}

const _getPhotoSummary = async request => {
  let uploadPhotos = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  if (!uploadPhotos) {
    uploadPhotos = {
      files: [],
      fileData: [],
      fileSizes: [],
      thumbnails: [],
      thumbnailData: []
    }
  }

  const imageRows = uploadPhotos.thumbnailData.map(
    (imageThumbnailFile, index) => {
      const extension = path
        .extname(uploadPhotos.thumbnails[index])
        .substring(1)
      const imageFile = `data:image/${extension};base64,${imageThumbnailFile}`

      return `<img id="photo${index}" class="govuk-!-padding-bottom-5" src=${imageFile} alt="Photo ${index +
        1}" width="200">`
    }
  )

  return [
    _getSummaryListRow(
      'Your photos',
      imageRows && imageRows.length ? imageRows.join('') : '',
      _getChangeItems(Paths.YOUR_PHOTOS, CHANGE_LINK_HINT.YourPhotos),
      true
    )
  ]
}

const _getSaleIntentionSummary = async request => [
  _getSummaryListRow(
    'What owner intends to do',
    await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM),
    _getChangeItems(Paths.INTENTION_FOR_ITEM, CHANGE_LINK_HINT.SaleIntention)
  )
]

const _getSummaryListRow = (key, value, items, isHtml = false) => {
  items.forEach(item => (item.text = 'Change'))

  return {
    key: {
      text: key
    },
    value: {
      [`${isHtml ? 'html' : 'text'}`]: value
    },
    actions: {
      items
    }
  }
}

const _getChangeItems = (href, visuallyHiddenText) => [
  {
    href,
    visuallyHiddenText
  }
]

const CHANGE_LINK_HINT = {
  BusinessName: 'business name',
  ExemptionType: 'type of exemption',
  ItemAge: 'your proof of age',
  IvoryVolme: 'your proof that item has less than [##PERCENTAGE##]% ivory',
  OwnerAddress: 'owner’s address',
  OwnerEmail: 'owner’s email',
  OwnerName: 'owner’s name',
  SellingOnBehalfOf: 'who owns the item',
  SaleIntention: 'what owner intends to do',
  DistinguishingFeatures: 'any distinguishing features',
  WhatIsItem: 'your description of the item',
  WhenMade: 'when it was made',
  WhereIsIvory: 'where the ivory is',
  WhereMade: 'where it was made',
  WhoOwnsTheItem: 'who owns the item',
  WhyIvoryIntegral: 'reason why all ivory is integral to item',
  WhyRmi: 'reason why item is of outstandingly high value',
  WorkForABusiness: 'if you work for a business',
  YourAddress: 'your address',
  YourFiles: 'your files',
  YourEmail: 'your email',
  YourName: 'your name',
  YourPhotos: 'your photos'
}

const BEFORE_1975 =
  'any replacement ivory was taken from an elephant before 1 January 1975'
const COMPLETE_AND_CORRECT =
  'the information you’ve provided is complete and correct'

const LEGAL_ASSERTIONS = {
  [ItemType.MUSICAL]: [
    'the musical instrument was made before 1975',
    'the instrument contains less than 20% ivory by volume',
    BEFORE_1975,
    COMPLETE_AND_CORRECT
  ],
  [ItemType.TEN_PERCENT]: [
    'the item was made before 3 March 1947',
    'the item contains less than 10% ivory by volume',
    'all the ivory in the item is integral to it',
    BEFORE_1975,
    COMPLETE_AND_CORRECT
  ],
  [ItemType.MINIATURE]: [
    'the portrait miniature was made before 1918',
    'the surface area of ivory on the miniature is less than 320 square centimetres',
    BEFORE_1975,
    COMPLETE_AND_CORRECT
  ],
  [ItemType.MUSEUM]: [
    'the item is to be sold or hired out to a qualifying museum',
    COMPLETE_AND_CORRECT
  ],
  [ItemType.HIGH_VALUE]: [
    'the item was made before 1918',
    BEFORE_1975,
    COMPLETE_AND_CORRECT
  ],
  Section2AlreadyCertified: [
    'the information on the certificate remains accurate and complete',
    'the exemption certificate relates to the item that is to be sold or hired out'
  ],
  additionalSection2: [
    'the item is of outstandingly high artistic, cultural or historical value'
  ]
}

const NONE = 'None'
const NOTHING_ENTERED = 'Nothing entered'
const NO_DOCUMENTS_ADDED = 'No files added'
