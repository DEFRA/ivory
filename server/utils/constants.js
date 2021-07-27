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
  I_DONT_KNOW: 'I don’t know'
}

const AgeExemptionReasons = {
  STAMP_OR_SERIAL:
    'It has a stamp, serial number or signature to prove its age',
  DATED_RECEIPT:
    'I have a dated receipt showing when it was bought or repaired',
  DATED_PUBLICATION:
    'I have a dated publication that shows or describes the item',
  BEEN_IN_FAMILY_1975: 'It’s been in the family since before 1975',
  BEEN_IN_FAMILY_1947: 'It’s been in the family since before 3 March 1947',
  BEEN_IN_FAMILY_1918: 'It’s been in the family since before 1918',
  EXPERT_VERIFICATION: 'I have written verification from a relevant expert',
  PROFESSIONAL_OPINION: 'I am an expert, and it’s my professional opinion',
  CARBON_DATED: 'It’s been carbon-dated',
  OTHER_REASON: 'Other reason'
}

const Intention = {
  SELL: 'Sell it',
  HIRE: 'Hire it out',
  NOT_SURE_YET: "I'm not sure yet"
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

const IvoryIntegralReasons = {
  NOT_APPLICABLE: 'Not applicable',
  ESSENTIAL_TO_DESIGN_OR_FUNCTION:
    'The ivory is essential to the design or function of the item',
  CANNOT_EASILY_REMOVE:
    'You cannot remove the ivory easily or without damaging the item',
  BOTH_OF_ABOVE: 'Both of the above'
}

const IvoryVolumeReasons = {
  CLEAR_FROM_LOOKING_AT_IT: 'It’s clear from looking at it',
  MEASURED_IT: 'I measured it',
  WRITTEN_VERIFICATION: 'I have written verification from a relevant expert',
  OTHER_REASON: 'Other reason'
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
  PAGE_NOT_FOUND: '/errors/page-not-found',
  PRIVACY_NOTICE: '/privacy-notice',
  PROBLEM_WITH_SERVICE: '/errors/problem-with-service',
  REMOVE_PHOTO: '/remove-photo',
  RMI_AND_PRE_1918: '/eligibility-checker/rmi-and-pre-1918',
  SAVE_RECORD: '/save-record',
  SELLING_TO_MUSEUM: '/eligibility-checker/selling-to-museum',
  SERVICE_COMPLETE: '/service-complete',
  SERVICE_STATUS: '/service-status',
  SERVICE_UNAVAILABLE: '/errors/service-unavailable',
  TAKEN_FROM_ELEPHANT: '/eligibility-checker/taken-from-elephant',
  UPLOAD_PHOTOS: '/upload-photos',
  UPLOAD_TIMEOUT: '/errors/upload-timeout',
  WHAT_TYPE_OF_ITEM_IS_IT: '/what-type-of-item-is-it',
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
  PAGE_NOT_FOUND: 'errors/page-not-found',
  PRIVACY_NOTICE: 'privacy-notice',
  PROBLEM_WITH_SERVICE: 'errors/problem-with-service',
  RMI_AND_PRE_1918: 'eligibility-checker/rmi-and-pre-1918',
  SELLING_TO_MUSEUM: 'eligibility-checker/selling-to-museum',
  SERVICE_COMPLETE: 'service-complete',
  SERVICE_STATUS: 'service-status',
  SERVICE_UNAVAILABLE: 'errors/service-unavailable',
  TAKEN_FROM_ELEPHANT: 'eligibility-checker/taken-from-elephant',
  UPLOAD_PHOTOS: 'upload-photos',
  UPLOAD_TIMEOUT: 'errors/upload-timeout',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
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
  ARE_YOU_A_MUSEUM: 'eligibility-checker.are-you-a-museum',
  CONTAIN_ELEPHANT_IVORY: 'eligibility-checker.contain-elephant-ivory',
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
  SUBMISSION_DATE: 'submission-date',
  SUBMISSION_REFERENCE: 'submission-reference',
  TARGET_COMPLETION_DATE: 'target-completion-date',
  UPLOAD_PHOTOS: 'upload-photos',
  UPLOAD_PHOTOS_ERROR: 'upload-photos.error',
  USED_CHECKER: 'used-checker',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHY_IS_ITEM_RMI: 'why-is-item-rmi',
  YOUR_PHOTOS: 'your-photos'
}

const StatusCodes = {
  UNAUTHORIZED: 401,
  PAGE_NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  PAYLOAD_TOO_LARGE: 413,
  PROBLEM_WITH_SERVICE: 500,
  SERVICE_UNAVAILABLE: 503
}

module.exports = Object.freeze({
  AddressType,
  AgeExemptionReasons,
  CharacterLimits,
  DEFRA_IVORY_SESSION_KEY: 'DefraIvorySession',
  Intention,
  ItemType,
  IvoryIntegralReasons,
  IvoryVolumeReasons,
  Options,
  Paths,
  RedisKeys,
  StatusCodes,
  Urls,
  Views
})
