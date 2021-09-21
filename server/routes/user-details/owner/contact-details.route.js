'use strict'

const AnalyticsService = require('../../../services/analytics.service')
const RedisService = require('../../../services/redis.service')

const {
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../../../utils/constants')
const { formatNumberWithCommas } = require('../../../utils/general')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const handlers = {
  get: async (request, h) => {
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    const context = await _getContext(request, ownedByApplicant)

    return h.view(Views.CONTACT_DETAILS, {
      ...context,
      pageTitle: _getPageHeading(ownedByApplicant),
      ownerApplicant: ownedByApplicant === Options.YES
    })
  },

  post: async (request, h) => {
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    const context = await _getContext(request, ownedByApplicant)
    const payload = request.payload
    const errors = _validateForm(payload, ownedByApplicant)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: _getPageHeading(ownedByApplicant)
      })

      return h
        .view(Views.CONTACT_DETAILS, {
          pageTitle: _getPageHeading(ownedByApplicant),
          ownerApplicant: ownedByApplicant === Options.YES,
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.OWNER_CONTACT_DETAILS,
      JSON.stringify(payload)
    )

    if (ownedByApplicant === Options.YES) {
      await RedisService.set(
        request,
        RedisKeys.APPLICANT_CONTACT_DETAILS,
        JSON.stringify(payload)
      )
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.ENTERED,
      label: _getPageHeading(ownedByApplicant)
    })

    return h.redirect(Paths.OWNER_ADDRESS_FIND)
  }
}

const _getPageHeading = ownedByApplicant => {
  return ownedByApplicant === Options.YES
    ? 'Your contact details'
    : "Owner's contact details"
}

const _getContext = async (request, ownedByApplicant) => {
  let contactDetails = await RedisService.get(
    request,
    RedisKeys.OWNER_CONTACT_DETAILS
  )

  if (contactDetails) {
    contactDetails = JSON.parse(contactDetails)
  }

  const context = {
    pageTitle: _getPageHeading(ownedByApplicant),
    applicant: true,
    ownedByApplicant: ownedByApplicant === Options.YES,
    ...contactDetails
  }

  return addPayloadToContext(request, context)
}

const _validateForm = (payload, ownedByApplicant) => {
  return ownedByApplicant === Options.YES
    ? _validateOwnerApplicant(payload)
    : _validateApplicant(payload)
}

const _validateOwnerApplicant = payload => {
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

const _validateApplicant = payload => {
  const errors = []

  if (Validators.empty(payload.name)) {
    errors.push({
      name: 'name',
      text: "Enter the owner's full name or business name"
    })
  } else if (Validators.maxLength(payload.name, CharacterLimits.Input)) {
    errors.push({
      name: 'name',
      text: `Name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.empty(payload.emailAddress)) {
    errors.push({
      name: 'emailAddress',
      text: "Enter the owner's email address"
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
      text: "You must confirm the owner's email address"
    })
  } else if (payload.confirmEmailAddress !== payload.emailAddress) {
    errors.push({
      name: 'confirmEmailAddress',
      text: "This confirmation does not match the owner's email address"
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_CONTACT_DETAILS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_CONTACT_DETAILS}`,
    handler: handlers.post
  }
]
