'use strict'

const RedisService = require('../../../services/redis.service')
const {
  CharacterLimits,
  Paths,
  RedisKeys,
  Views
} = require('../../../utils/constants')
const { formatNumberWithCommas } = require('../../../utils/general')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const pageTitle = 'Your contact details'

const handlers = {
  get: (request, h) =>
    h.view(Views.CONTACT_DETAILS, { ..._getContext(request) }),

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CONTACT_DETAILS, {
          ..._getContext(request),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(request, RedisKeys.APPLICANT_NAME, payload.name)
    await RedisService.set(
      request,
      RedisKeys.APPLICANT_EMAIL_ADDRESS,
      payload.emailAddress
    )

    return h.redirect(Paths.APPLICANT_ADDRESS_FIND)
  }
}

const _getContext = request => {
  const context = { pageTitle, applicant: true }

  addPayloadToContext(request, context)

  return context
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.name)) {
    errors.push({
      name: 'name',
      text: 'Enter your full name'
    })
  } else if (Validators.maxLength(payload.name, CharacterLimits.Input)) {
    errors.push({
      name: 'name',
      text: `Name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.maxLength(payload.businessName, CharacterLimits.Input)) {
    errors.push({
      name: 'businessName',
      text: `Business name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.empty(payload.emailAddress)) {
    errors.push({
      name: 'emailAddress',
      text: 'Enter your email address'
    })
  } else if (!Validators.email(payload.emailAddress)) {
    errors.push({
      name: 'emailAddress',
      text:
        'Enter an email address in the correct format, like name@example.com'
    })
  } else if (
    Validators.maxLength(payload.emailAddress, CharacterLimits.Input)
  ) {
    errors.push({
      name: 'emailAddress',
      text: `Email address must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.empty(payload.confirmEmailAddress)) {
    errors.push({
      name: 'confirmEmailAddress',
      text: 'You must confirm your email address'
    })
  } else if (payload.confirmEmailAddress !== payload.emailAddress) {
    errors.push({
      name: 'confirmEmailAddress',
      text: 'This confirmation does not match your email address'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.APPLICANT_CONTACT_DETAILS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_CONTACT_DETAILS}`,
    handler: handlers.post
  }
]
