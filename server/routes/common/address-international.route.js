'use strict'

const RedisService = require('../../services/redis.service')
const {
  AddressType,
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const { formatNumberWithCommas } = require('../../utils/general')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const {
  addPayloadToContext,
  convertToCommaSeparatedTitleCase
} = require('../../utils/general')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_INTERNATIONAL
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)

    return h.view(Views.ADDRESS_INTERNATIONAL, {
      ...(await _getContext(request, addressType))
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_INTERNATIONAL, {
          ...(await _getContext(request, addressType)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    payload.internationalAddress = convertToCommaSeparatedTitleCase(
      payload.internationalAddress
    )

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      payload.internationalAddress
    )

    if (ownedByApplicant === Options.YES) {
      await RedisService.set(
        request,
        RedisKeys.APPLICANT_ADDRESS,
        payload.internationalAddress
      )
    }

    let route
    if (addressType === AddressType.OWNER) {
      route =
        ownedByApplicant === Options.YES
          ? Paths.WHERE_IS_ITEM
          : Paths.APPLICANT_CONTACT_DETAILS
    } else {
      route = Paths.WHERE_IS_ITEM
    }

    return h.redirect(route)
  }
}

const _getContext = async (request, addressType) => {
  let context

  const ownedByApplicant = await RedisService.get(
    request,
    RedisKeys.OWNED_BY_APPLICANT
  )

  if (addressType === AddressType.OWNER) {
    context = _getContextForOwnerAddressType(ownedByApplicant)
  } else {
    context = _getContextForApplicantAddressType()
  }

  addPayloadToContext(request, context)

  return context
}

const _getContextForOwnerAddressType = ownedByApplicant => {
  let context
  if (ownedByApplicant === Options.YES) {
    context = {
      pageTitle: 'Enter your address',
      helpText: 'If your business owns the item, give your business address.'
    }
  } else {
    context = {
      pageTitle: "Enter the owner's address",
      helpText: 'If the owner is a business, give the business address.'
    }
  }
  return context
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'Enter your address',
    helpText:
      'If your business is helping someone else sell their item, give your business address.'
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.internationalAddress)) {
    errors.push({
      name: 'internationalAddress',
      text: 'Enter the address'
    })
  }

  if (
    Validators.maxLength(payload.internationalAddress, CharacterLimits.Textarea)
  ) {
    errors.push({
      name: 'internationalAddress',
      text: `Address must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Textarea
      )} characters`
    })
  }

  return errors
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
