'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  Analytics,
  ItemType,
  Options,
  Paths,
  RedisKeys,
  Views
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
  const exemptionType = await RedisService.get(
    request,
    RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
  )

  const isSection2 = exemptionType === ItemType.HIGH_VALUE
  const isMesuem = exemptionType === ItemType.MUSEUM

  const ownedByApplicant =
    (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
    Options.YES

  const [
    documentSummary,
    exemptionReasonSummary,
    itemDescriptionSummary,
    ownerSummary,
    photoSummary,
    saleIntentionSummary
  ] = await Promise.all([
    isSection2 ? _getDocumentSummary(request) : null,
    _getExemptionReasonSummary(request, exemptionType, isSection2, isMesuem),
    _getItemDescriptionSummary(request, isSection2),
    _getOwnerSummary(request, ownedByApplicant),
    _getPhotoSummary(request),
    _getSaleIntentionSummary(request)
  ])

  return {
    photoSummary,
    itemDescriptionSummary,
    exemptionReasonSummary,
    documentSummary,
    saleIntentionSummary,
    ownerSummary,
    isSection2,
    ownedByApplicant,
    isMesuem,
    pageTitle: 'Check your answers',
    legalAssertions: LEGAL_ASSERTIONS[exemptionType],
    legalAssertionsAdditionalSection2: LEGAL_ASSERTIONS.additionalSection2,
    exemptionTypeSummary: _getExemptionTypeSummary(exemptionType)
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
  const uploadDocuments = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_DOCUMENT)
  ) || {
    files: [],
    fileData: [],
    fileSizes: []
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
      _getChangeItems(Paths.YOUR_DOCUMENTS, CHANGE_LINK_HINT.YourDocuments),
      true
    )
  ]
}

const _getExemptionReasonSummary = async (
  request,
  exemptionType,
  isSection2,
  isMesuem
) => {
  const ivoryAge =
    JSON.parse(await RedisService.get(request, RedisKeys.IVORY_AGE)) || {}

  if (ivoryAge.otherReason) {
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
  const ivoryVolume = JSON.parse(
    (await RedisService.get(request, RedisKeys.IVORY_VOLUME)) || '{}'
  )
  const ivoryVolumeFormatted =
    ivoryVolume.ivoryVolume === 'Other reason'
      ? ivoryVolume.otherReason
      : ivoryVolume.ivoryVolume

  let ivoryIntegral = await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)
  if (ivoryIntegral === 'Both of the above') {
    ivoryIntegral =
      'The ivory is essential to the design or function of the item and you cannot remove the ivory easily or without damaging the item'
  }

  const ivoryVolumePercentage = getIvoryVolumePercentage(exemptionType)

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

    if (exemptionType === ItemType.TEN_PERCENT) {
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

const _getExemptionTypeSummary = exemptionType => [
  _getSummaryListRow(
    'Type of exemption',
    exemptionType,
    _getChangeItems(
      Paths.WHAT_TYPE_OF_ITEM_IS_IT,
      CHANGE_LINK_HINT.ExemptionType
    )
  )
]

const _getItemDescriptionSummary = async (request, isSection2) => {
  const itemDescription =
    JSON.parse(await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)) ||
    {}

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
      'Unique, identifying features (optional)',
      itemDescription.uniqueFeatures || NOTHING_ENTERED,
      _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.UniqueFeatures)
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

const _getOwnerSummary = async (request, ownedByApplicant) => {
  const ownerContactDetails =
    JSON.parse(
      await RedisService.get(request, RedisKeys.OWNER_CONTACT_DETAILS)
    ) || {}

  const applicantContactDetails =
    JSON.parse(
      await RedisService.get(request, RedisKeys.APPLICANT_CONTACT_DETAILS)
    ) || {}

  const ownerSummary = [
    _getSummaryListRow(
      'Who owns the item?',
      ownedByApplicant ? 'I own it' : 'Someone else owns it',
      _getChangeItems(Paths.WHO_OWNS_ITEM, CHANGE_LINK_HINT.WhoOwnsTheItem)
    )
  ]

  if (ownedByApplicant) {
    ownerSummary.push(
      _getSummaryListRow(
        'Your name',
        ownerContactDetails.name,
        _getChangeItems(Paths.OWNER_CONTACT_DETAILS, CHANGE_LINK_HINT.YourName)
      )
    )

    ownerSummary.push(
      _getSummaryListRow(
        'Business name (optional)',
        ownerContactDetails.businessName || NOTHING_ENTERED,
        _getChangeItems(
          Paths.OWNER_CONTACT_DETAILS,
          CHANGE_LINK_HINT.BusinessName
        )
      )
    )

    ownerSummary.push(
      _getSummaryListRow(
        'Your email',
        ownerContactDetails.emailAddress,
        _getChangeItems(Paths.OWNER_CONTACT_DETAILS, CHANGE_LINK_HINT.YourEmail)
      )
    )

    ownerSummary.push(
      _getSummaryListRow(
        'Your address',
        await RedisService.get(request, RedisKeys.OWNER_ADDRESS),
        _getChangeItems(Paths.OWNER_ADDRESS_FIND, CHANGE_LINK_HINT.YourAddress)
      )
    )
  } else {
    ownerSummary.push(
      _getSummaryListRow(
        'Owner’s name',
        ownerContactDetails.name,
        _getChangeItems(Paths.OWNER_CONTACT_DETAILS, CHANGE_LINK_HINT.OwnerName)
      )
    )

    ownerSummary.push(
      _getSummaryListRow(
        'Owner’s email',
        ownerContactDetails.emailAddress,
        _getChangeItems(
          Paths.OWNER_CONTACT_DETAILS,
          CHANGE_LINK_HINT.OwnerEmail
        )
      )
    )

    ownerSummary.push(
      _getSummaryListRow(
        'Owner’s address',
        await RedisService.get(request, RedisKeys.OWNER_ADDRESS),
        _getChangeItems(Paths.OWNER_ADDRESS_FIND, CHANGE_LINK_HINT.OwnerAddress)
      )
    )

    ownerSummary.push(
      _getSummaryListRow(
        'Your name',
        applicantContactDetails.name,
        _getChangeItems(
          Paths.APPLICANT_CONTACT_DETAILS,
          CHANGE_LINK_HINT.YourName
        )
      )
    )

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
        await RedisService.get(request, RedisKeys.APPLICANT_ADDRESS),
        _getChangeItems(
          Paths.APPLICANT_ADDRESS_FIND,
          CHANGE_LINK_HINT.YourAddress
        )
      )
    )
  }

  return ownerSummary
}

const _getPhotoSummary = async request => {
  const uploadPhotos = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)
  ) || {
    files: [],
    fileData: [],
    fileSizes: [],
    thumbnails: [],
    thumbnailData: []
  }

  const imageRows = uploadPhotos.thumbnails.map((file, index) => {
    return `<img id="photo${index}" class="govuk-!-padding-bottom-5" src="assets\\${file}" alt="Photo of item ${index}" width="200">`
  })

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
  ExemptionType: 'type of exemption',
  YourPhotos: 'your photos',
  WhatIsItem: 'your description of the item',
  WhereIsIvory: 'where the ivory is',
  UniqueFeatures: 'any unique features',
  WhereMade: 'where it was made',
  WhenMade: 'when it was made',
  ItemAge: 'your proof of age',
  WhyRmi: 'reason why item is of outstandingly high value',
  IvoryVolme: 'your proof that item has less than [##PERCENTAGE##]% ivory',
  WhyIvoryIntegral: 'reason why all ivory is integral to item',
  YourDocuments: 'your documents',
  WhoOwnsTheItem: 'who owns the item',
  YourName: 'your name',
  BusinessName: 'business name',
  YourEmail: 'your email',
  YourAddress: 'your address',
  OwnerName: 'owner’s name',
  OwnerEmail: 'owner’s email',
  OwnerAddress: 'owner’s address',
  SaleIntention: 'what owner intends to do'
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
  additionalSection2: [
    'the item is of outstandingly high artistic, cultural or historical value'
  ]
}

const NOTHING_ENTERED = 'Nothing entered'
const NO_DOCUMENTS_ADDED = 'No documents added'
