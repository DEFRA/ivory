'use strict'

const AddressType = {
  OWNER: 'owner',
  APPLICANT: 'applicant'
}

const Analytics = {
  Category: {
    ELIGIBILITY_CHECKER: 'Eligibilty Checker',
    ERROR: 'Page validation error',
    ERROR_PAGE: 'Error page',
    EXEMPTION_TYPE: 'Exemption Type',
    MAIN_QUESTIONS: 'Main Questions',
    PAYMENT: 'Payment',
    SERVICE_COMPLETE: 'Service Complete'
  },
  Action: {
    CONFIRM: 'Confirm and continue',
    CONTINUE: 'Continue',
    DOCUMENT_REMOVED: 'Document Removed',
    DROPOUT: 'Dropout',
    ENTERED: 'Details entered',
    PHOTO_REMOVED: 'Photo Removed',
    REDIRECT: 'Redirected to:',
    REFERRED: 'Referred by:',
    SELECTED: 'Selected:'
  }
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

const AlreadyCertifiedOptions = {
  YES: 'Yes',
  NO: 'No',
  USED_TO: 'It used to'
}

const BehalfOfBusinessOptions = {
  BUSINESS_I_WORK_FOR: 'The business I work for',
  AN_INDIVIDUAL: 'An individual',
  ANOTHER_BUSINESS: 'Another business',
  OTHER: 'Other'
}

const BehalfOfNotBusinessOptions = {
  FRIEND_OR_RELATIVE: 'A friend or relative',
  A_BUSINESS: 'A business',
  OTHER: 'Other'
}

const Capacities = {
  AGENT: 'Agent',
  EXECUTOR_ADMINISTRATOR: 'Executor or administrator',
  TRUSTEE: 'Trustee',
  OTHER: 'Other'
}

const DataVerseFieldName = {
  ALREADY_HAS_CERTIFICATE: 'cre2c_alreadyhascertificate',
  APPLICANT_ADDRESS: 'cre2c_applicantaddress',
  APPLICANT_EMAIL: 'cre2c_applicantemail',
  APPLICANT_NAME: 'cre2c_applicantname',
  APPLICANT_POSTCODE: 'cre2c_applicantpostcode',
  APPLIED_BEFORE: 'cre2c_appliedbefore',
  CAPACITY_OTHER: 'cre2c_capacityother',
  CAPACITY: 'cre2c_capacity',
  CERTIFICATE_ISSUE_DATE: 'cre2c_certificateissuedate',
  CERTIFICATE_KEY: 'cre2c_certificatekey',
  CERTIFICATE_LINK: 'cre2c_certificatelink',
  CERTIFICATE_LINK_EXPIRY: 'cre2c_certificatelinkexpiry',
  CERTIFICATE_NUMBER: 'cre2c_certificatenumber',
  CONSENT_TO_SHARE_INFORMATION: 'cre2c_consenttoshareinformation',
  DATE_STATUS_APPLIED: 'cre2c_datestatusapplied',
  DISTINGUISHING_FEATURES: 'cre2c_uniquefeatures',
  EXEMPTION_CATEGORY: 'cre2c_exemptioncategory',
  EXEMPTION_TYPE: 'cre2c_exemptiontype',
  INTENTION: 'cre2c_intention',
  HAS_DISTINGUISHING_FEATURES: 'cre2c_hasuniquefeatures',
  ITEM_SUMMARY: 'cre2c_itemsummary',
  MANUALLY_CREATED: 'cre2c_manuallycreated',
  NAME: 'cre2c_name',
  OWNED_BY_APPLICANT: 'cre2c_ownedbyapplicant',
  OWNER_ADDRESS: 'cre2c_owneraddress',
  OWNER_EMAIL: 'cre2c_owneremail',
  OWNER_NAME: 'cre2c_ownername',
  OWNER_POSTCODE: 'cre2c_ownerpostcode',
  PAYMENT_REFERENCE: 'cre2c_paymentreference',
  PHOTO_1: 'cre2c_photo1',
  PHOTO_1_ID: 'cre2c_photo1id',
  PHOTO_2: 'cre2c_photo2',
  PHOTO_2_ID: 'cre2c_photo2id',
  PHOTO_3: 'cre2c_photo3',
  PHOTO_3_ID: 'cre2c_photo3id',
  PHOTO_4: 'cre2c_photo4',
  PHOTO_4_ID: 'cre2c_photo4id',
  PHOTO_5: 'cre2c_photo5',
  PHOTO_5_ID: 'cre2c_photo5id',
  PHOTO_6: 'cre2c_photo6',
  PHOTO_6_ID: 'cre2c_photo6id',
  PI_LINK: 'cre2c_pilink',
  PI_LINK_EXPIRY: 'cre2c_pilinkexpiry',
  PREVIOUS_APPLICANT_ADDRESS: 'cre2c_previousapplicantaddress',
  PREVIOUS_APPLICANT_EMAIL: 'cre2c_previousapplicantemail',
  PREVIOUS_APPLICANT_NAME: 'cre2c_previousapplicantname',
  PREVIOUS_APPLICANT_POSTCODE: 'cre2c_previousapplicantpostcode',
  PREVIOUS_APPLICATION_NUMBER: 'cre2c_previousapplicationnumber',
  PREVIOUS_CAPACITY_OTHER: 'cre2c_previouscapacityother',
  PREVIOUS_CAPACITY: 'cre2c_previouscapacity',
  PREVIOUS_OWNED_BY_APPLICANT: 'cre2c_previousownedbyapplicant',
  PREVIOUS_OWNER_ADDRESS: 'cre2c_previousowneraddress',
  PREVIOUS_OWNER_EMAIL: 'cre2c_previousowneremail',
  PREVIOUS_OWNER_NAME: 'cre2c_previousownername',
  PREVIOUS_OWNER_POSTCODE: 'cre2c_previousownerpostcode',
  PREVIOUS_SELLING_ON_BEHALF_OF: 'cre2c_previoussellingonbehalfof',
  PREVIOUS_WORK_FOR_A_BUSINESS: 'cre2c_previousworkforabusiness',
  REVOKED_CERTIFICATE_NUMBER: 'cre2c_revokedcertificatenumber',
  SECTION_10_CASE_ID: 'cre2c_ivorysection10caseid',
  SECTION_2_CASE_ID: 'cre2c_ivorysection2caseid',
  SELLING_ON_BEHALF_OF: 'cre2c_sellingonbehalfof',
  STATUS: 'cre2c_status',
  SUBMISSION_DATE: 'cre2c_submissiondate',
  SUBMISSION_REFERENCE: 'cre2c_submissionreference',
  SUPPORTING_EVIDENCE_1_NAME: 'cre2c_supportingevidence1_name',
  SUPPORTING_EVIDENCE_1: 'cre2c_supportingevidence1',
  SUPPORTING_EVIDENCE_2_NAME: 'cre2c_supportingevidence2_name',
  SUPPORTING_EVIDENCE_2: 'cre2c_supportingevidence2',
  SUPPORTING_EVIDENCE_3_NAME: 'cre2c_supportingevidence3_name',
  SUPPORTING_EVIDENCE_3: 'cre2c_supportingevidence3',
  SUPPORTING_EVIDENCE_4_NAME: 'cre2c_supportingevidence4_name',
  SUPPORTING_EVIDENCE_4: 'cre2c_supportingevidence4',
  SUPPORTING_EVIDENCE_5_NAME: 'cre2c_supportingevidence5_name',
  SUPPORTING_EVIDENCE_5: 'cre2c_supportingevidence5',
  SUPPORTING_EVIDENCE_6_NAME: 'cre2c_supportingevidence6_name',
  SUPPORTING_EVIDENCE_6: 'cre2c_supportingevidence6',
  TARGET_COMPLETION_DATE: 'cre2c_targetcompletiondate',
  WHEN_IT_WAS_MADE: 'cre2c_whenitwasmade',
  WHERE_IS_THE_IVORY: 'cre2c_wherestheivory',
  WHERE_IT_WAS_MADE: 'cre2c_whereitwasmade',
  WHY_AGE_EXEMPT_OTHER_REASON: 'cre2c_whyageexemptotherreason',
  WHY_AGE_EXEMPT: 'cre2c_whyageexempt',
  WHY_IVORY_EXEMPT_OTHER_REASON: 'cre2c_whyivoryexemptotherreason',
  WHY_IVORY_EXEMPT: 'cre2c_whyivoryexempt',
  WHY_IVORY_INTEGRAL: 'cre2c_whyivoryintegral',
  WHY_OUTSTANDINLY_VALUABLE: 'cre2c_whyoutstandinglyvaluable',
  WORK_FOR_A_BUSINESS: 'cre2c_workforabusiness'
}

const DownloadReason = {
  SEND_DATA_TO_PI: 'send-data-to-pi',
  GENERATE_CERTIFICATE: 'generate-certificate'
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
  ESSENTIAL_TO_DESIGN_OR_FUNCTION:
    'The ivory is essential to the design, if detached the item could no longer function as intended',
  CANNOT_EASILY_REMOVE:
    'You cannot remove the ivory easily or without damaging the item',
  BOTH_OF_ABOVE: 'Both of the above'
}

const IvoryVolumeReasons = {
  CLEAR_FROM_LOOKING_AT_IT: 'It’s clear from looking at it',
  MEASURED_IT: 'I measured it',
  OTHER_REASON: 'Other reason'
}

const HOME_URL = '/'

const PaymentResult = {
  SUCCESS: 'success',
  FAILED: 'failed',
  ERROR: 'error',
  Codes: {
    CANCELLED: 'P0030'
  }
}

const Urls = {
  GOV_UK_HOME: 'https://www.gov.uk/'
}

const Paths = {
  ACCESSIBILITY_STATEMENT: '/accessibility-statement',
  ALREADY_CERTIFIED: '/already-certified',
  APPLICANT_ADDRESS_CHOOSE: '/user-details/applicant/address-choose',
  APPLICANT_ADDRESS_CONFIRM: '/user-details/applicant/address-confirm',
  APPLICANT_ADDRESS_ENTER: '/user-details/applicant/address-enter',
  APPLICANT_ADDRESS_FIND: '/user-details/applicant/address-find',
  APPLICANT_ADDRESS_INTERNATIONAL:
    '/user-details/applicant/address-international',
  APPLICANT_CONTACT_DETAILS: '/user-details/applicant/contact-details',
  APPLIED_BEFORE: '/applied-before',
  ARE_YOU_A_MUSEUM: '/eligibility-checker/are-you-a-museum',
  CAN_CONTINUE: '/can-continue',
  CANNOT_CONTINUE: '/eligibility-checker/cannot-continue',
  CANNOT_TRADE: '/eligibility-checker/cannot-trade',
  CHECK_YOUR_ANSWERS: '/check-your-answers',
  CONTAIN_ELEPHANT_IVORY: '/eligibility-checker/contain-elephant-ivory',
  COOKIE_POLICY: '/cookie-policy',
  DESCRIBE_THE_ITEM: '/describe-the-item',
  DO_NOT_NEED_SERVICE: '/eligibility-checker/do-not-need-service',
  DOWNLOAD_CERTIFICATE: '/download-certificate',
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
  PASS_DATA_TO_PI: '/pass-data-to-pi/application-details',
  PASS_DATA_TO_PI_APPLICATION_PDF: '/pass-data-to-pi/application-details-pdf',
  PASS_DATA_TO_PI_DOCUMENTS: '/pass-data-to-pi/application-documents',
  PASS_DATA_TO_PI_PHOTOS: '/pass-data-to-pi/application-photos',
  PREVIOUS_APPLICATION_NUMBER: '/previous-application-number',
  PRIVACY_NOTICE: '/privacy-notice',
  PROBLEM_WITH_SERVICE: '/errors/problem-with-service',
  RECORD_NOT_FOUND: '/errors/record-not-found',
  REMOVE_DOCUMENT: '/remove-document',
  REMOVE_PHOTO: '/remove-photo',
  REVOKED_CERTIFICATE: '/revoked-certificate',
  RMI_AND_PRE_1918: '/eligibility-checker/rmi-and-pre-1918',
  SAVE_RECORD: '/save-record',
  SELLING_ON_BEHALF_OF: '/selling-on-behalf-of',
  SELLING_TO_MUSEUM: '/eligibility-checker/selling-to-museum',
  SERVICE_COMPLETE: '/service-complete',
  SERVICE_STATUS: '/service-status',
  SERVICE_UNAVAILABLE: '/errors/service-unavailable',
  SESSION_TIMED_OUT: '/errors/session-timed-out',
  SHARE_DETAILS_OF_ITEM: '/share-details-of-item',
  TAKEN_FROM_ELEPHANT: '/eligibility-checker/taken-from-elephant',
  UPLOAD_DOCUMENT: '/upload-document',
  UPLOAD_PHOTO: '/upload-photo',
  UPLOAD_TIMEOUT: '/errors/upload-timeout',
  WHAT_CAPACITY: '/what-capacity',
  WANT_TO_ADD_DOCUMENTS: '/want-to-add-documents',
  WHAT_TYPE_OF_ITEM_IS_IT: '/what-type-of-item-is-it',
  WHO_OWNS_ITEM: '/who-owns-the-item',
  WHY_IS_ITEM_RMI: '/why-is-item-rmi',
  WORK_FOR_A_BUSINESS: '/work-for-a-business',
  YOUR_DOCUMENTS: '/your-documents',
  YOUR_PHOTOS: '/your-photos'
}

const Views = {
  ACCESSIBILITY_STATEMENT: 'accessibility-statement',
  ADDRESS_CHOOSE: 'user-details/address-choose',
  ADDRESS_CONFIRM: 'user-details/address-confirm',
  ADDRESS_ENTER: 'user-details/address-enter',
  ADDRESS_FIND: 'user-details/address-find',
  ADDRESS_INTERNATIONAL: 'user-details/address-international',
  ALREADY_CERTIFIED: 'already-certified',
  APPLIED_BEFORE: 'applied-before',
  ARE_YOU_A_MUSEUM: 'eligibility-checker/are-you-a-museum',
  CAN_CONTINUE: 'can-continue',
  CANNOT_CONTINUE: 'eligibility-checker/cannot-continue',
  CANNOT_TRADE: 'eligibility-checker/cannot-trade',
  CHECK_YOUR_ANSWERS: 'check-your-answers',
  CONTACT_DETAILS_APPLICANT: 'user-details/applicant/contact-details',
  CONTACT_DETAILS_OWNER: 'user-details/owner/contact-details',
  CONTAIN_ELEPHANT_IVORY: 'eligibility-checker/contain-elephant-ivory',
  COOKIE_POLICY: 'cookie-policy',
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
  PASS_DATA_TO_PI: 'pass-data-to-pi/application-details',
  PREVIOUS_APPLICATION_NUMBER: 'previous-application-number',
  PRIVACY_NOTICE: 'privacy-notice',
  PROBLEM_WITH_SERVICE: 'errors/problem-with-service',
  RECORD_NOT_FOUND: 'errors/record-not-found',
  REVOKED_CERTIFICATE: 'revoked-certificate',
  RMI_AND_PRE_1918: 'eligibility-checker/rmi-and-pre-1918',
  SELLING_ON_BEHALF_OF: 'selling-on-behalf-of',
  SELLING_TO_MUSEUM: 'eligibility-checker/selling-to-museum',
  SERVICE_COMPLETE: 'service-complete',
  SERVICE_STATUS: 'service-status',
  SERVICE_UNAVAILABLE: 'errors/service-unavailable',
  SESSION_TIMED_OUT: 'errors/session-timed-out',
  SHARE_DETAILS_OF_ITEM: 'share-details-of-item',
  TAKEN_FROM_ELEPHANT: 'eligibility-checker/taken-from-elephant',
  UPLOAD_DOCUMENT: 'upload-document',
  UPLOAD_PHOTO: 'upload-photo',
  UPLOAD_TIMEOUT: 'errors/upload-timeout',
  WANT_TO_ADD_DOCUMENTS: 'want-to-add-documents',
  WHAT_CAPACITY: 'what-capacity',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHO_OWNS_ITEM: 'who-owns-the-item',
  WHY_IS_ITEM_RMI: 'why-is-item-rmi',
  WORK_FOR_A_BUSINESS: 'work-for-a-business',
  YOUR_DOCUMENTS: 'your-documents',
  YOUR_PHOTOS: 'your-photos'
}

const RedisKeys = {
  ADDRESS_FIND_NAME_OR_NUMBER: 'address-find.nameOrNumber',
  ADDRESS_FIND_POSTCODE: 'address-find.postcode',
  ADDRESS_FIND_RESULTS: 'address-find.results',
  ALREADY_CERTIFIED_EXISTING_RECORD: 'already-certified.existing-record',
  ALREADY_CERTIFIED: 'already-certified',
  APPLICANT_ADDRESS_INTERNATIONAL: 'applicant.address.international',
  APPLICANT_ADDRESS: 'applicant.address',
  APPLICANT_CONTACT_DETAILS: 'applicant.contact-details',
  APPLIED_BEFORE: 'applied-before',
  ARE_YOU_A_MUSEUM: 'eligibility-checker.are-you-a-museum',
  CONTAIN_ELEPHANT_IVORY: 'eligibility-checker.contain-elephant-ivory',
  DESCRIBE_THE_ITEM: 'describe-the-item',
  INTENTION_FOR_ITEM: 'intention-for-item',
  IVORY_AGE: 'ivory-age',
  IVORY_INTEGRAL: 'ivory-integral',
  IVORY_VOLUME: 'ivory-volume',
  OWNED_BY_APPLICANT: 'owned-by-applicant',
  OWNER_ADDRESS_INTERNATIONAL: 'owner.address.international',
  OWNER_ADDRESS: 'owner.address',
  OWNER_CONTACT_DETAILS: 'owner.contact-details',
  PAYMENT_AMOUNT: 'payment-amount',
  PAYMENT_ID: 'payment-id',
  PREVIOUS_APPLICATION_NUMBER: 'previous-application-number',
  REVOKED_CERTIFICATE: 'revoked-certificate',
  SELLING_ON_BEHALF_OF: 'selling-on-behalf-of',
  SHARE_DETAILS_OF_ITEM: 'share-details-of-item',
  SUBMISSION_DATE: 'submission-date',
  SUBMISSION_REFERENCE: 'submission-reference',
  TARGET_COMPLETION_DATE: 'target-completion-date',
  UPLOAD_DOCUMENT_ERROR: 'upload-document.error',
  UPLOAD_DOCUMENT: 'upload-document',
  UPLOAD_PHOTO_ERROR: 'upload-photo.error',
  UPLOAD_PHOTO: 'upload-photo',
  USED_CHECKER: 'used-checker',
  WHAT_CAPACITY: 'what-capacity',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHY_IS_ITEM_RMI: 'why-is-item-rmi',
  WORK_FOR_A_BUSINESS: 'work-for-a-business',
  YOUR_DOCUMENTS: 'your-documents',
  YOUR_PHOTOS: 'your-photos'
}

const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
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
  AlreadyCertifiedOptions,
  Analytics,
  BehalfOfBusinessOptions,
  BehalfOfNotBusinessOptions,
  Capacities,
  CharacterLimits,
  DataVerseFieldName,
  DownloadReason,
  HOME_URL,
  Intention,
  ItemType,
  IvoryIntegralReasons,
  IvoryVolumeReasons,
  Options,
  Paths,
  PaymentResult,
  RedisKeys,
  StatusCodes,
  Urls,
  Views,
  DEFRA_IVORY_SESSION_KEY: 'DefraIvorySession'
})
