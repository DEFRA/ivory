'use strict'

const {
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../../utils/constants')
const { formatNumberWithCommas } = require('../../../utils/general')

const RedisService = require('../../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const handlers = {
  get: async (request, h) => {
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    return h.view(Views.CONTACT_DETAILS, {
      pageTitle: _getPageHeading(ownedByApplicant),
      ownerApplicant: ownedByApplicant === Options.YES
    })
  },

  post: async (request, h) => {
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    const payload = request.payload
    const errors = _validateForm(payload, ownedByApplicant)

    if (errors.length) {
      return h
        .view(Views.CONTACT_DETAILS, {
          pageTitle: _getPageHeading(ownedByApplicant),
          ownerApplicant: ownedByApplicant === Options.YES,
          ..._getContext(request),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    if (ownedByApplicant === Options.YES) {
      RedisService.set(
        request,
        RedisKeys.OWNER_NAME,
        payload.businessName ?? payload.name
      )
      RedisService.set(
        request,
        RedisKeys.OWNER_EMAIL_ADDRESS,
        payload.emailAddress
      )
      RedisService.set(request, RedisKeys.APPLICANT_NAME, payload.name)
      RedisService.set(
        request,
        RedisKeys.APPLICANT_EMAIL_ADDRESS,
        payload.emailAddress
      )
    } else {
      RedisService.set(request, RedisKeys.OWNER_NAME, payload.name)
      RedisService.set(
        request,
        RedisKeys.OWNER_EMAIL_ADDRESS,
        payload.emailAddress
      )
    }

    return h.redirect(Paths.OWNER_ADDRESS_FIND)
  }
}

const _getPageHeading = ownedByApplicant => {
  return ownedByApplicant === Options.YES
    ? 'Your contact details'
    : "Owner's contact details"
}

const _getContext = request => {
  return addPayloadToContext(request)
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
