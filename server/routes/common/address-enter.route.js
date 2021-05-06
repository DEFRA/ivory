'use strict'

const {
  AddressType,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const {
  addPayloadToContext,
  convertToCommaSeparatedTitleCase
} = require('../../utils/general')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_ENTER
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)

    return h.view(Views.ADDRESS_ENTER, {
      ...(await _getContext(request, addressType, true))
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_ENTER, {
          ...(await _getContext(request, addressType, false)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    _updateAddressFieldCasing(payload)
    const address = _concatenateAddressFields(payload)

    RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      address
    )

    if (ownedByApplicant === Options.YES) {
      RedisService.set(request, RedisKeys.APPLICANT_ADDRESS, address)
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

const _getContext = async (request, addressType, isGet) => {
  const context = {}

  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND)
  )

  const resultSize = addresses.length

  if (resultSize === 0) {
    context.title = 'No results, you will need to enter the address'
  } else if (resultSize === 1) {
    context.title = 'Edit your address'
    if (isGet) {
      Object.assign(context, _getAddressFieldsFromAddress(addresses[0].Address))
    }
  } else if (resultSize > 1 && resultSize <= 50) {
    context.title = 'Enter your address'
  } else if (resultSize > 50) {
    context.title = 'Too many results, you will need to enter the address'
  }

  context.helpText =
    'If your business owns the item, give your business address.'

  addPayloadToContext(request, context)

  return context
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.addressLine1)) {
    errors.push({
      name: 'addressLine1',
      text: 'Enter the building and street information'
    })
  }

  if (Validators.empty(payload.townOrCity)) {
    errors.push({
      name: 'townOrCity',
      text: 'Enter a town or city'
    })
  }

  if (Validators.empty(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text: 'Enter the postcode'
    })
  }

  if (!Validators.postcode(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text: 'Enter a UK postcode in the correct format'
    })
  }

  return errors
}

const _getAddressFieldsFromAddress = address => {
  return {
    addressLine1: address.SubBuildingName
      ? convertToCommaSeparatedTitleCase(address.SubBuildingName)
      : `${convertToCommaSeparatedTitleCase(
          address.BuildingNumber
        )} ${convertToCommaSeparatedTitleCase(address.Street)}`,
    addressLine2: convertToCommaSeparatedTitleCase(address.Locality),
    townOrCity: convertToCommaSeparatedTitleCase(address.Town),
    postcode: address.Postcode
  }
}
const _updateAddressFieldCasing = payload => {
  for (const key in payload) {
    payload[key] =
      key === 'postcode'
        ? payload[key].toUpperCase()
        : convertToCommaSeparatedTitleCase(payload[key])
  }
}

const _concatenateAddressFields = payload => {
  return Object.keys(payload)
    .map(key => payload[key])
    .join(', ')
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
