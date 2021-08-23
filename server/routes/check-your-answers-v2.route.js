'use strict'

const {
  ItemType,
  Paths,
  Views,
  RedisKeys,
  Options
} = require('../utils/constants')
const { getIvoryVolumePercentage } = require('../utils/general')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const CHANGE_LINK_HINT = {
  ExemptionType: 'Change type of exemption',
  YourPhotos: 'Change your photos',
  WhatIsItem: 'Change your description of the item',
  WhereIsIvory: 'Change where the ivory is',
  UniqueFeatures: 'Change any unique features',
  WhereMade: 'Change where it was made',
  WhenMade: 'Change when it was made',
  ItemAge: 'Change your proof of age',
  WhyRmi: 'Change reason why item is of outstandingly high value',
  IvoryVolme:
    'Change your proof that item has less than [##PERCENTAGE##]% ivory',
  WhyIvoryIntegral: 'Change reason why all ivory is integral to item',
  YourDocuments: 'Change your documents',
  WhoOwnsItem: 'Change who owns the item',
  YourName: 'Change your name',
  BusinessName: 'Change business name',
  YourEmail: 'Change your email',
  YourAddress: 'Change your address',
  OwnerName: 'Change owner’s name',
  OwnerEmail: 'Change owner’s email',
  OwnerAddress: 'Change owner’s name',
  SaleIntention: 'Change what owner intends to do'
}

const LEGAL_ASSERTIONS = {
  [ItemType.MUSICAL]: [
    'the musical instrument was made before 1975',
    'the instrument contains less than 20% ivory by volume',
    'any replacement ivory was taken from an elephant before 1 January 1975',
    'the information you’ve provided is complete and correct'
  ],
  [ItemType.TEN_PERCENT]: [
    'the item was made before 3 March 1947',
    'the item contains less than 10% ivory by volume',
    'all the ivory in the item is integral to it',
    'any replacement ivory was taken from an elephant before 1 January 1975',
    'the information you’ve provided is complete and correct'
  ],
  [ItemType.MINIATURE]: [
    'the portrait miniature was made before 1918',
    'the surface area of ivory on the miniature is less than 320 square centimetres',
    'any replacement ivory was taken from an elephant before 1 January 1975',
    'the information you’ve provided is complete and correct'
  ],
  [ItemType.MUSEUM]: [
    'you are selling or hiring out the ivory item to a qualifying museum',
    'the information you’ve provided is complete and correct'
  ],
  [ItemType.HIGH_VALUE]: [
    'the item was made before 1918',
    'the item is of outstandingly high artistic, cultural or historical value',
    'any replacement ivory was taken from an elephant before 1 January 1975',
    'the information you’ve provided is complete and correct'
  ]
}

const NOTHING_ENTERED = 'Nothing entered'
const NO_DOCUMENTS_ADDED = 'No documents added'

const handlers = {
  get: async (request, h) => {
    return h.view(Views.CHECK_YOUR_ANSWERS_V2, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CHECK_YOUR_ANSWERS_V2, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

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

  const itemDescription =
    JSON.parse(await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)) ||
    {}

  const exemptionTypeSummary = [
    _getSummaryListRow(
      'Type of exemption',
      exemptionType,
      _getChangeItems(
        Paths.WHAT_TYPE_OF_ITEM_IS_IT,
        CHANGE_LINK_HINT.ExemptionType
      )
    )
  ]

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
    return `<img id="image-${index}" class="govuk-!-padding-bottom-5" src="assets\\${file}" alt="Photo of item ${index}" width="200">`
  })

  const photoSummary = [
    _getSummaryListRow(
      'Your photos',
      imageRows && imageRows.length ? imageRows.join('') : '',
      _getChangeItems(Paths.YOUR_PHOTOS, CHANGE_LINK_HINT.YourPhotos),
      true
    )
  ]

  const itemDescriptionSummary = [
    _getSummaryListRow(
      'What is it?',
      itemDescription.whatIsItem,
      _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.WhatIsItem)
    ),
    _getSummaryListRow(
      'Where’s the ivory?',
      itemDescription.whereIsIvory,
      _getChangeItems(Paths.DESCRIBE_THE_ITEM, CHANGE_LINK_HINT.ItemDescription)
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

  const whyRmi = await RedisService.get(request, RedisKeys.WHY_IS_ITEM_RMI)
  const ivoryVolume = JSON.parse(
    (await RedisService.get(request, RedisKeys.IVORY_VOLUME)) || '{}'
  )
  const ivoryVolumeFormatted =
    ivoryVolume.ivoryVolume === 'Other reason'
      ? ivoryVolume.otherReason
      : ivoryVolume.ivoryVolume
  const ivoryIntegral = await RedisService.get(
    request,
    RedisKeys.IVORY_INTEGRAL
  )

  const ivoryVolumePercentage = getIvoryVolumePercentage(exemptionType)

  const ivoryAge =
    JSON.parse(await RedisService.get(request, RedisKeys.IVORY_AGE)) || {}

  if (ivoryAge.otherReason) {
    ivoryAge.ivoryAge.pop()
    ivoryAge.ivoryAge.push(ivoryAge.otherReason)
  }
  const ivoryAgeFormatted = ivoryAge.ivoryAge.map((reason, index) => {
    return `<li id="ivory-age-reason-${index}">${reason}</li>`
  })

  const ivoryAgeList = `<ul>${ivoryAgeFormatted.join('')}</ul>`

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

  let documentSummary
  if (isSection2) {
    const uploadDocuments = JSON.parse(
      await RedisService.get(request, RedisKeys.UPLOAD_DOCUMENT)
    ) || {
      files: [],
      fileData: [],
      fileSizes: []
    }

    const documentRows = uploadDocuments.files.map((file, index) => {
      return `<p id="document-${index}">${file}</p>`
    })

    documentSummary = [
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

  const ownedByApplicant =
    (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
    Options.YES

  if (ownedByApplicant) {
    // TODO owner details
  } else {
    // TODO owner and applicant details
  }

  console.log('owned by applicant?', ownedByApplicant)

  const saleIntentionSummary = [
    _getSummaryListRow(
      'What owner intends to do',
      await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM),
      _getChangeItems(Paths.INTENTION_FOR_ITEM, CHANGE_LINK_HINT.SaleIntention)
    )
  ]

  return {
    exemptionTypeSummary,
    photoSummary,
    itemDescriptionSummary,
    exemptionReasonSummary,
    documentSummary,
    saleIntentionSummary,
    ownedByApplicant,
    pageTitle: 'Check your answers',
    legalAssertions: LEGAL_ASSERTIONS[exemptionType],

    ownerName: `${await RedisService.get(request, RedisKeys.OWNER_NAME)}`,
    ownerEmail: `${await RedisService.get(
      request,
      RedisKeys.OWNER_EMAIL_ADDRESS
    )}`,
    ownerAddress: `${await RedisService.get(request, RedisKeys.OWNER_ADDRESS)}`,

    applicantDetails: `${await RedisService.get(
      request,
      RedisKeys.APPLICANT_NAME
    )} ${await RedisService.get(request, RedisKeys.APPLICANT_EMAIL_ADDRESS)}`,
    applicantAddress: `${await RedisService.get(
      request,
      RedisKeys.APPLICANT_ADDRESS
    )}`,

    intentionForItem: `${await RedisService.get(
      request,
      RedisKeys.INTENTION_FOR_ITEM
    )}`,

    cost:
      parseInt(await RedisService.get(request, RedisKeys.PAYMENT_AMOUNT)) / 100
  }
}

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
    path: `${Paths.CHECK_YOUR_ANSWERS_V2}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CHECK_YOUR_ANSWERS_V2}`,
    handler: handlers.post
  }
]
