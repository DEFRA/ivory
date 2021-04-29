'use strict'

const RedisService = require('../../../services/redis.service')
const { Paths, RedisKeys, Views } = require('../../../utils/constants')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const title = 'Your contact details'

const handlers = {
  get: (request, h) => {
    return h.view(Views.CONTACT_DETAILS, { ..._getContext(request) })
  },

  post: (request, h) => {
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

    RedisService.set(request, RedisKeys.APPLICANT_NAME, payload.name)
    RedisService.set(
      request,
      RedisKeys.APPLICANT_EMAIL_ADDRESS,
      payload.emailAddress
    )

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = request => {
  const context = { title, applicant: true }

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
    path: `${Paths.APPLICANT_DETAILS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_DETAILS}`,
    handler: handlers.post
  }
]
