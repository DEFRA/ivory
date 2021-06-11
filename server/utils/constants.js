'use strict'

const AddressType = {
  OWNER: 'owner',
  APPLICANT: 'applicant'
}

const CharacterLimits = {
  Input: 4000,
  Textarea: 100000
}

const Options = {
  YES: 'Yes',
  NO: 'No',
  I_DONT_KNOW: 'I dont know'
}

const ItemType = {
  MUSICAL: 'Musical instrument made before 1975 with less than 20% ivory',
  TEN_PERCENT: 'Item made before 3 March 1947 with less than 10% ivory',
  MINIATURE:
    'Portrait miniature made before 1918 with a surface area less than 320 square centimetres',
  MUSEUM: 'Item to be sold or hired out to a qualifying museum',
  HIGH_VALUE:
    'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
}

const SaleIntention = {
  SELL: 'Sell it',
  HIRE: 'Hire it out',
  NOT_SURE_YET: "I'm not sure yet"
}

const Urls = {
  GOV_UK_HOME: 'https://www.gov.uk/'
}

const Paths = {
  ACCESSIBILITY_STATEMENT: '/accessibility-statement',
  API_TEST: '/api-test',
  APPLICANT_ADDRESS_CHOOSE: '/user-details/applicant/address-choose',
  APPLICANT_ADDRESS_CONFIRM: '/user-details/applicant/address-confirm',
  APPLICANT_ADDRESS_ENTER: '/user-details/applicant/address-enter',
  APPLICANT_ADDRESS_FIND: '/user-details/applicant/address-find',
  APPLICANT_ADDRESS_INTERNATIONAL:
    '/user-details/applicant/address-international',
  APPLICANT_CONTACT_DETAILS: '/user-details/applicant/contact-details',
  ARE_YOU_A_MUSEUM: '/eligibility-checker/are-you-a-museum',
  CAN_CONTINUE: '/can-continue',
  CANNOT_CONTINUE: '/eligibility-checker/cannot-continue',
  CANNOT_TRADE: '/eligibility-checker/cannot-trade',
  CHECK_YOUR_ANSWERS: '/check-your-answers',
  CONTAIN_ELEPHANT_IVORY: '/eligibility-checker/contain-elephant-ivory',
  DESCRIBE_THE_ITEM: '/describe-the-item',
  DO_NOT_NEED_SERVICE: '/eligibility-checker/do-not-need-service',
  HOW_CERTAIN: '/eligibility-checker/how-certain',
  INTENTION_FOR_ITEM: '/intention-for-item',
  IS_IT_A_MUSICAL_INSTRUMENT: '/eligibility-checker/is-it-a-musical-instrument',
  IS_IT_A_PORTRAIT_MINIATURE: '/eligibility-checker/is-it-a-portrait-miniature',
  IS_IT_RMI: '/eligibility-checker/is-it-rmi',
  IS_ITEM_PRE_1918: '/eligibility-checker/is-item-pre-1918',
  IVORY_ADDED: '/eligibility-checker/ivory-added',
  IVORY_AGE: '/ivory-age',
  IVORY_INTEGRAL: '/ivory-integral',
  IVORY_VOLUME: '/ivory-volume',
  LEGAL_REPONSIBILITY: '/legal-responsibility',
  LESS_THAN_10_IVORY: '/eligibility-checker/less-than-10-ivory',
  LESS_THAN_20_IVORY: '/eligibility-checker/less-than-20-ivory',
  LESS_THAN_320CM_SQUARED: '/eligibility-checker/less-than-320cm-squared',
  MADE_BEFORE_1947: '/eligibility-checker/made-before-1947',
  MADE_BEFORE_1975: '/eligibility-checker/made-before-1975',
  MAKE_PAYMENT: '/make-payment',
  OWNER_ADDRESS_CHOOSE: '/user-details/owner/address-choose',
  OWNER_ADDRESS_CONFIRM: '/user-details/owner/address-confirm',
  OWNER_ADDRESS_ENTER: '/user-details/owner/address-enter',
  OWNER_ADDRESS_FIND: '/user-details/owner/address-find',
  OWNER_ADDRESS_INTERNATIONAL: '/user-details/owner/address-international',
  OWNER_CONTACT_DETAILS: '/user-details/owner/contact-details',
  PAGE_NOT_FOUND: '/page-not-found',
  PRIVACY_NOTICE: '/privacy-notice',
  PROBLEM_WITH_SERVICE: '/problem-with-service',
  RMI_AND_PRE_1918: '/eligibility-checker/rmi-and-pre-1918',
  SALE_INTENTION: '/sale-intention',
  SELLING_TO_MUSEUM: '/eligibility-checker/selling-to-museum',
  SERVICE_COMPLETE: '/service-complete',
  SERVICE_UNAVAILABLE: '/service-unavailable',
  TAKEN_FROM_ELEPHANT: '/eligibility-checker/taken-from-elephant',
  UPLOAD_PHOTOS: '/upload-photos',
  WHAT_TYPE_OF_ITEM_IS_IT: '/what-type-of-item-is-it',
  WHERE_IS_ITEM: '/where-is-item',
  WHO_OWNS_ITEM: '/who-owns-the-item',
  WHY_IS_ITEM_RMI: '/why-is-item-rmi',
  YOUR_PHOTOS: '/your-photos'
}

const Views = {
  ACCESSIBILITY_STATEMENT: 'accessibility-statement',
  API_TEST: 'api-test',
  ADDRESS_CHOOSE: 'user-details/address-choose',
  ADDRESS_CONFIRM: 'user-details/address-confirm',
  ADDRESS_ENTER: 'user-details/address-enter',
  ADDRESS_FIND: 'user-details/address-find',
  ADDRESS_INTERNATIONAL: 'user-details/address-international',
  ARE_YOU_A_MUSEUM: 'eligibility-checker/are-you-a-museum',
  CAN_CONTINUE: 'can-continue',
  CANNOT_CONTINUE: 'eligibility-checker/cannot-continue',
  CANNOT_TRADE: 'eligibility-checker/cannot-trade',
  CHECK_YOUR_ANSWERS: 'check-your-answers',
  CONTACT_DETAILS: 'user-details/contact-details',
  CONTAIN_ELEPHANT_IVORY: 'eligibility-checker/contain-elephant-ivory',
  DESCRIBE_THE_ITEM: 'describe-the-item',
  DO_NOT_NEED_SERVICE: 'eligibility-checker/do-not-need-service',
  HOME: 'home',
  HOW_CERTAIN: 'eligibility-checker/how-certain',
  INTENTION_FOR_ITEM: 'intention-for-item',
  IS_IT_A_MUSICAL_INSTRUMENT: 'eligibility-checker/is-it-a-musical-instrument',
  IS_IT_A_PORTRAIT_MINIATURE: 'eligibility-checker/is-it-a-portrait-miniature',
  IS_IT_RMI: 'eligibility-checker/is-it-rmi',
  IS_ITEM_PRE_1918: 'eligibility-checker/is-item-pre-1918',
  IVORY_ADDED: 'eligibility-checker/ivory-added',
  IVORY_AGE: 'ivory-age',
  IVORY_INTEGRAL: 'ivory-integral',
  IVORY_VOLUME: 'ivory-volume',
  LEGAL_REPONSIBILITY: 'legal-responsibility',
  LESS_THAN_10_IVORY: 'eligibility-checker/less-than-10-ivory',
  LESS_THAN_20_IVORY: 'eligibility-checker/less-than-20-ivory',
  LESS_THAN_320CM_SQUARED: 'eligibility-checker/less-than-320cm-squared',
  MADE_BEFORE_1947: 'eligibility-checker/made-before-1947',
  MADE_BEFORE_1975: 'eligibility-checker/made-before-1975',
  PAGE_NOT_FOUND: 'page-not-found',
  PRIVACY_NOTICE: 'privacy-notice',
  PROBLEM_WITH_SERVICE: 'problem-with-service',
  RMI_AND_PRE_1918: 'eligibility-checker/rmi-and-pre-1918',
  SALE_INTENTION: 'sale-intention',
  SELLING_TO_MUSEUM: 'eligibility-checker/selling-to-museum',
  SERVICE_COMPLETE: 'service-complete',
  SERVICE_UNAVAILABLE: 'service-unavailable',
  TAKEN_FROM_ELEPHANT: 'eligibility-checker/taken-from-elephant',
  UPLOAD_PHOTOS: 'upload-photos',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHERE_IS_ITEM: 'where-is-item',
  WHO_OWNS_ITEM: 'who-owns-the-item',
  WHY_IS_ITEM_RMI: 'why-is-item-rmi',
  YOUR_PHOTOS: 'your-photos'
}

const RedisKeys = {
  ADDRESS_FIND_NAME_OR_NUMBER: 'address-find.nameOrNumber',
  ADDRESS_FIND_POSTCODE: 'address-find.postcode',
  ADDRESS_FIND_RESULTS: 'address-find.results',
  APPLICANT_ADDRESS: 'applicant.address',
  APPLICANT_EMAIL_ADDRESS: 'applicant.emailAddress',
  APPLICANT_NAME: 'applicant.name',
  DESCRIBE_THE_ITEM: 'describe-the-item',
  INTENTION_FOR_ITEM: 'intention-for-item',
  IVORY_AGE: 'ivory-age',
  IVORY_INTEGRAL: 'ivory-integral',
  IVORY_VOLUME: 'ivory-volume',
  OWNED_BY_APPLICANT: 'owned-by-applicant',
  OWNER_ADDRESS: 'owner.address',
  OWNER_EMAIL_ADDRESS: 'owner.emailAddress',
  OWNER_NAME: 'owner.name',
  PAYMENT_AMOUNT: 'payment-amount',
  PAYMENT_ID: 'payment-id',
  PAYMENT_REFERENCE: 'payment-reference',
  SALE_INTENTION: 'sale-intention',
  UPLOAD_PHOTOS_IMAGE_DATA: 'upload-photos.image-data-',
  UPLOAD_PHOTOS_IMAGE_FILELIST: 'upload-photos.image-filelist',
  UPLOAD_PHOTOS_THUMBNAIL_DATA: 'upload-photos.thumbnail-data',
  UPLOAD_PHOTOS_THUMBNAIL_FILESLIST: 'upload-photos.thumbnail-filelist',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHERE_IS_ITEM: 'where-is-item',
  YOUR_PHOTOS: 'your-photos'
}

const StatusCodes = {
  PAGE_NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  PROBLEM_WITH_SERVICE: 500,
  SERVICE_UNAVAILABLE: 503
}

module.exports = Object.freeze({
  AddressType,
  CharacterLimits,
  Options,
  ItemType,
  Paths,
  Views,
  RedisKeys,
  SaleIntention,
  StatusCodes,
  Urls,
  DEFRA_IVORY_SESSION_KEY: 'DefraIvorySession'
})
