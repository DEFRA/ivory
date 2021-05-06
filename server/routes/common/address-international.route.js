'use strict'

const RedisService = require('../../services/redis.service')
const {
  AddressType,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
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
  get: (request, h) => {
    const addressType = getAddressType(request)

    return h.view(Views.ADDRESS_INTERNATIONAL, {
      ..._getContext(request, addressType)
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_INTERNATIONAL, {
          ..._getContext(request, addressType),
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

    RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      payload.internationalAddress
    )

    if (ownedByApplicant === Options.YES) {
      RedisService.set(
        request,
        RedisKeys.APPLICANT_ADDRESS,
        payload.internationalAddress
      )
    }

    let route
    if (addressType === AddressType.OWNER) {
      route =
        ownedByApplicant === Options.YES
          ? Paths.CHECK_YOUR_ANSWERS
          : Paths.APPLICANT_CONTACT_DETAILS
    } else {
      route = Paths.CHECK_YOUR_ANSWERS
    }

    return h.redirect(route)
  }
}

const _getContext = (request, completedBy) => {
  let context

  if (completedBy === AddressType.OWNER) {
    context = {
      title: 'Enter your address',
      hintText: 'If your business owns the item, give your business address.'
    }
  } else {
    context = {
      title: 'Enter the owner’s address',
      hintText: 'If the owner is a business, give the business address.'
    }
  }

  addPayloadToContext(request, context)

  return context
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.internationalAddress)) {
    errors.push({
      name: 'internationalAddress',
      text: 'Enter the address'
    })
  }

  const characterLimit = 4000
  if (Validators.maxLength(payload.internationalAddress, characterLimit)) {
    errors.push({
      name: 'internationalAddress',
      text: `Enter a shorter address with no more than ${characterLimit} characters`
    })
  }

  return errors
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
