'use strict'

const AnalyticsService = require('../../../services/analytics.service')
const RedisService = require('../../../services/redis.service')

const {
  Analytics,
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../../utils/constants')
const { formatNumberWithCommas } = require('../../../utils/general')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const pageTitle = 'Your contact details'

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.CONTACT_DETAILS_APPLICANT, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload, context.workForABusiness)

    const ownedByApplicant =
      (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
      Options.YES

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.CONTACT_DETAILS_APPLICANT, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.APPLICANT_CONTACT_DETAILS,
      JSON.stringify(payload)
    )

    if (ownedByApplicant) {
      await RedisService.set(
        request,
        RedisKeys.OWNER_CONTACT_DETAILS,
        JSON.stringify(payload)
      )
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.ENTERED,
      label: context.pageTitle
    })

    return h.redirect(Paths.APPLICANT_ADDRESS_FIND)
  }
}

const _getContext = async request => {
  const workForABusiness =
    (await RedisService.get(request, RedisKeys.WORK_FOR_A_BUSINESS)) ===
    Options.YES

  const contactDetails = await RedisService.get(
    request,
    RedisKeys.APPLICANT_CONTACT_DETAILS
  )

  const context = { pageTitle, workForABusiness, ...contactDetails }

  addPayloadToContext(request, context)

  return context
}

const _validateForm = (payload, workForABusiness) => {
  const errors = []

  _validateFullName(payload, errors)

  if (workForABusiness) {
    _validateBusinessName(payload, errors)
  }

  _validateEmailAddress(payload, errors)
  _validateConfirmEmailAddress(payload, errors)

  return errors
}

const _validateFullName = (payload, errors) => {
  if (Validators.empty(payload.fullName)) {
    errors.push({
      name: 'fullName',
      text: 'Enter your full name'
    })
  } else if (Validators.maxLength(payload.fullName, CharacterLimits.Input)) {
    errors.push({
      name: 'fullName',
      text: `Name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }
}

const _validateBusinessName = (payload, errors) => {
  if (Validators.empty(payload.businessName)) {
    errors.push({
      name: 'businessName',
      text: 'Enter the business name'
    })
  } else if (
    Validators.maxLength(payload.businessName, CharacterLimits.Input)
  ) {
    errors.push({
      name: 'businessName',
      text: `Business name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }
}

const _validateEmailAddress = (payload, errors) => {
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
}

const _validateConfirmEmailAddress = (payload, errors) => {
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
