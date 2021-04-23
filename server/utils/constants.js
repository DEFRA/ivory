const Options = {
  YES: 'yes',
  NO: 'no'
}

const Paths = {
  APPLICANT_DETAILS: '/user-details/applicant/contact-details',
  CHECK_YOUR_ANSWERS: '/check-your-answers',
  IVORY_ADDED: '/ivory-added',
  IVORY_INTEGRAL: '/ivory-integral',
  // OWNER_ADDRESS_CHOOSE: '/user-details/owner/choose-address',
  // OWNER_ADDRESS_CONFIRM: '/user-details/owner/confirm-address',
  // OWNER_ADDRESS_ENTER: '/user-details/owner/enter-address',
  OWNER_ADDRESS_FIND: '/user-details/owner/address-find',
  OWNER_ADDRESS_INTERNATIONAL: '/user-details/owner/address-international',
  OWNER_DETAILS: '/user-details/owner/contact-details',
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
  APPLICANT_EMAIL_ADDRESS: 'applicant.emailAddress',
  APPLICANT_NAME: 'applicant.name',
  IVORY_ADDED: 'ivory-added',
  IVORY_INTEGRAL: 'ivory-integral',
  OWNER_APPLICANT: 'owner-applicant',
  OWNER_EMAIL_ADDRESS: 'owner.emailAddress',
  OWNER_NAME: 'owner.name',
  OWNER_INTERNATIONAL_ADDRESS: 'owner.internationalAddress'
}

module.exports = Object.freeze({
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
