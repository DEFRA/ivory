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
  NO: 'No'
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

const Paths = {
  APPLICANT_ADDRESS_CHOOSE: '/user-details/applicant/address-choose',
  APPLICANT_ADDRESS_CONFIRM: '/user-details/applicant/address-confirm',
  APPLICANT_CONTACT_DETAILS: '/user-details/applicant/contact-details',
  APPLICANT_ADDRESS_ENTER: '/user-details/applicant/address-enter',
  APPLICANT_ADDRESS_FIND: '/user-details/applicant/address-find',
  APPLICANT_ADDRESS_INTERNATIONAL:
    '/user-details/applicant/address-international',
  CAN_CONTINUE: '/can-continue',
  CHECK_YOUR_ANSWERS: '/check-your-answers',
  DESCRIBE_THE_ITEM: '/describe-the-item',
  INTENTION_FOR_ITEM: '/intention-for-item',
  IVORY_ADDED: '/ivory-added',
  IVORY_AGE: '/ivory-age',
  IVORY_INTEGRAL: '/ivory-integral',
  IVORY_VOLUME: '/ivory-volume',
  MAKE_PAYMENT: '/make-payment',
  OWNER_ADDRESS_CHOOSE: '/user-details/owner/address-choose',
  OWNER_ADDRESS_CONFIRM: '/user-details/owner/address-confirm',
  OWNER_ADDRESS_ENTER: '/user-details/owner/address-enter',
  OWNER_ADDRESS_FIND: '/user-details/owner/address-find',
  OWNER_ADDRESS_INTERNATIONAL: '/user-details/owner/address-international',
  OWNER_CONTACT_DETAILS: '/user-details/owner/contact-details',
  SALE_INTENTION: '/sale-intention',
  SERVICE_COMPLETE: '/service-complete',
  TAKEN_FROM_ELEPHANT: '/taken-from-elephant',
  UPLOAD_PHOTOS: '/upload-photos',
  WHAT_TYPE_OF_ITEM_IS_IT: '/what-type-of-item-is-it',
  WHERE_IS_ITEM: '/where-is-item',
  WHO_OWNS_ITEM: '/who-owns-the-item',
  WHY_IS_ITEM_RMI: '/why-is-item-rmi'
}

const Views = {
  ADDRESS_CHOOSE: 'user-details/address-choose',
  ADDRESS_CONFIRM: 'user-details/address-confirm',
  ADDRESS_ENTER: 'user-details/address-enter',
  ADDRESS_FIND: 'user-details/address-find',
  ADDRESS_INTERNATIONAL: 'user-details/address-international',
  CAN_CONTINUE: 'can-continue',
  CHECK_YOUR_ANSWERS: 'check-your-answers',
  CONTACT_DETAILS: 'user-details/contact-details',
  DESCRIBE_THE_ITEM: 'describe-the-item',
  HOME: 'home',
  INTENTION_FOR_ITEM: 'intention-for-item',
  IVORY_ADDED: 'ivory-added',
  IVORY_AGE: 'ivory-age',
  IVORY_INTEGRAL: 'ivory-integral',
  IVORY_VOLUME: 'ivory-volume',
  SALE_INTENTION: 'sale-intention',
  SERVICE_COMPLETE: 'service-complete',
  TAKEN_FROM_ELEPHANT: 'taken-from-elephant',
  UPLOAD_PHOTOS: 'upload-photos',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHERE_IS_ITEM: 'where-is-item',
  WHO_OWNS_ITEM: 'who-owns-the-item',
  YES_NO_IDK: 'yes-no-idk',
  WHY_IS_ITEM_RMI: 'why-is-item-rmi'
}

const RedisKeys = {
  ADDRESS_FIND_NAME_OR_NUMBER: 'address-find.nameOrNumber',
  ADDRESS_FIND_POSTCODE: 'address-find.postcode',
  ADDRESS_FIND_RESULTS: 'address-find.results',
  APPLICANT_ADDRESS: 'applicant.address',
  APPLICANT_EMAIL_ADDRESS: 'applicant.emailAddress',
  APPLICANT_NAME: 'applicant.name',
  INTENTION_FOR_ITEM: 'intention-for-item',
  IVORY_ADDED: 'ivory-added',
  IVORY_AGE: 'ivory-age',
  IVORY_INTEGRAL: 'ivory-integral',
  IVORY_VOLUME: 'ivory-volume',
  OWNED_BY_APPLICANT: 'owned-by-applicant',
  OWNER_ADDRESS: 'owner.address',
  OWNER_EMAIL_ADDRESS: 'owner.emailAddress',
  OWNER_NAME: 'owner.name',
  PAYMENT_ID: 'payment-id',
  PAYMENT_AMOUNT: 'payment-amount',
  PAYMENT_REFERENCE: 'payment-reference',
  SALE_INTENTION: 'sale-intention',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHERE_IS_ITEM: 'where-is-item'
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
  ServerEvents: {
    PLUGINS_LOADED: 'pluginsLoaded'
  },
  DEFRA_IVORY_SESSION_KEY: 'DefraIvorySession',
  SESSION_ID: 'sessionId'
})
