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
  YES: 'yes',
  NO: 'no'
}

const Paths = {
  APPLICANT_ADDRESS_CHOOSE: '/user-details/applicant/address-choose',
  APPLICANT_ADDRESS_CONFIRM: '/user-details/applicant/address-confirm',
  APPLICANT_CONTACT_DETAILS: '/user-details/applicant/contact-details',
  APPLICANT_ADDRESS_ENTER: '/user-details/applicant/address-enter',
  APPLICANT_ADDRESS_FIND: '/user-details/applicant/address-find',
  APPLICANT_ADDRESS_INTERNATIONAL:
    '/user-details/applicant/address-international',
  CHECK_YOUR_ANSWERS: '/check-your-answers',
  IVORY_ADDED: '/ivory-added',
  IVORY_INTEGRAL: '/ivory-integral',
  MAKE_PAYMENT: '/make-payment',
  OWNER_ADDRESS_CHOOSE: '/user-details/owner/address-choose',
  OWNER_ADDRESS_CONFIRM: '/user-details/owner/address-confirm',
  OWNER_ADDRESS_ENTER: '/user-details/owner/address-enter',
  OWNER_ADDRESS_FIND: '/user-details/owner/address-find',
  OWNER_ADDRESS_INTERNATIONAL: '/user-details/owner/address-international',
  OWNER_CONTACT_DETAILS: '/user-details/owner/contact-details',
  SERVICE_COMPLETE: '/service-complete',
  TAKEN_FROM_ELEPHANT: '/taken-from-elephant',
  WHAT_TYPE_OF_ITEM_IS_IT: '/what-type-of-item-is-it',
  WHO_OWNS_ITEM: '/who-owns-the-item'
}

const Views = {
  ADDRESS_CHOOSE: 'user-details/address-choose',
  ADDRESS_CONFIRM: 'user-details/address-confirm',
  ADDRESS_ENTER: 'user-details/address-enter',
  ADDRESS_FIND: 'user-details/address-find',
  ADDRESS_INTERNATIONAL: 'user-details/address-international',
  CHECK_YOUR_ANSWERS: 'check-your-answers',
  CONTACT_DETAILS: 'user-details/contact-details',
  HOME: 'home',
  IVORY_ADDED: 'ivory-added',
  IVORY_INTEGRAL: 'ivory-integral',
  SERVICE_COMPLETE: 'service-complete',
  TAKEN_FROM_ELEPHANT: 'taken-from-elephant',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it',
  WHO_OWNS_ITEM: 'who-owns-the-item',
  YES_NO_IDK: 'yes-no-idk'
}

const RedisKeys = {
  ADDRESS_FIND_NAME_OR_NUMBER: 'address-find.nameOrNumber',
  ADDRESS_FIND_POSTCODE: 'address-find.postcode',
  ADDRESS_FIND_RESULTS: 'address-find.results',
  APPLICANT_ADDRESS: 'applicant.address',
  APPLICANT_EMAIL_ADDRESS: 'applicant.emailAddress',
  APPLICANT_NAME: 'applicant.name',
  IVORY_ADDED: 'ivory-added',
  IVORY_INTEGRAL: 'ivory-integral',
  OWNED_BY_APPLICANT: 'owned-by-applicant',
  OWNER_ADDRESS: 'owner.address',
  OWNER_EMAIL_ADDRESS: 'owner.emailAddress',
  OWNER_NAME: 'owner.name',
  PAYMENT_ID: 'payment-id',
  PAYMENT_AMOUNT: 'payment-amount',
  PAYMENT_REFERENCE: 'payment-reference',
  WHAT_TYPE_OF_ITEM_IS_IT: 'what-type-of-item-is-it'
}

module.exports = Object.freeze({
  AddressType,
  CharacterLimits,
  Options,
  Paths,
  Views,
  RedisKeys,
  ServerEvents: {
    PLUGINS_LOADED: 'pluginsLoaded'
  },
  DEFRA_IVORY_SESSION_KEY: 'DefraIvorySession',
  SESSION_ID: 'sessionId'
})
