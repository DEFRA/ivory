const Options = {
  YES: 'yes',
  NO: 'no'
}

const Paths = {
  APPLICANT_DETAILS: '/user-details/applicant/contact-details',
  CHECK_YOUR_ANSWERS: '/check-your-answers',
  IVORY_ADDED: '/ivory-added',
  IVORY_INTEGRAL: '/ivory-integral',
  OWNER_DETAILS: '/user-details/owner/contact-details',
  TAKEN_FROM_ELEPHANT: '/taken-from-elephant',
  WHO_OWNS_ITEM: '/who-owns-the-item'
}

const Views = {
  CHECK_YOUR_ANSWERS: 'check-your-answers',
  HOME: 'home',
  IVORY_ADDED: 'ivory-added',
  IVORY_INTEGRAL: 'ivory-integral',
  CONTACT_DETAILS: 'user-details/contact-details',
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
  OWNER_NAME: 'owner.name'
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
