'use strict'

const AddressType = {
  OWNER: 'owner',
  APPLICANT: 'applicant'
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
  OWNER_ADDRESS_CHOOSE: '/user-details/owner/address-choose',
  OWNER_ADDRESS_CONFIRM: '/user-details/owner/address-confirm',
  OWNER_ADDRESS_ENTER: '/user-details/owner/address-enter',
  OWNER_ADDRESS_FIND: '/user-details/owner/address-find',
  OWNER_ADDRESS_INTERNATIONAL: '/user-details/owner/address-international',
  OWNER_CONTACT_DETAILS: '/user-details/owner/contact-details',
  TAKEN_FROM_ELEPHANT: '/taken-from-elephant',
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
  TAKEN_FROM_ELEPHANT: 'taken-from-elephant',
  WHO_OWNS_ITEM: 'who-owns-the-item',
  YES_NO_IDK: 'yes-no-idk'
}

const RedisKeys = {
  ADDRESS_FIND: 'address-find',
  APPLICANT_ADDRESS: 'applicant.address',
  APPLICANT_EMAIL_ADDRESS: 'applicant.emailAddress',
  APPLICANT_NAME: 'applicant.name',
  IVORY_ADDED: 'ivory-added',
  IVORY_INTEGRAL: 'ivory-integral',
  OWNED_BY_APPLICANT: 'owned-by-applicant',
  OWNER_ADDRESS: 'owner.address',
  OWNER_EMAIL_ADDRESS: 'owner.emailAddress',
  OWNER_NAME: 'owner.name'
}

module.exports = Object.freeze({
  AddressType,
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
