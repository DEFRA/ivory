'use strict'

const {
  AddressType,
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const { formatNumberWithCommas } = require('../../utils/general')
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

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      address
    )

    if (ownedByApplicant === Options.YES) {
      await RedisService.set(request, RedisKeys.APPLICANT_ADDRESS, address)
    }

    let route
    if (addressType === AddressType.OWNER) {
      route =
        ownedByApplicant === Options.YES
          ? Paths.INTENTION_FOR_ITEM
          : Paths.APPLICANT_CONTACT_DETAILS
    } else {
      route = Paths.INTENTION_FOR_ITEM
    }

    return h.redirect(route)
  }
}

const _getContext = async (request, addressType, isGet) => {
  const context = {}

  const ownedByApplicant = await RedisService.get(
    request,
    RedisKeys.OWNED_BY_APPLICANT
  )

  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND_RESULTS)
  )

  const resultSize = addresses.length

  if (resultSize === 0) {
    context.pageTitle = 'No results, you will need to enter the address'
  } else if (resultSize === 1) {
    if (addressType === AddressType.OWNER) {
      context.pageTitle =
        ownedByApplicant === Options.YES
          ? 'Edit your address'
          : "Edit the owner's address"
    } else {
      context.pageTitle = 'Edit your address'
    }
    if (isGet) {
      Object.assign(context, _getAddressFieldsFromAddress(addresses[0].Address))
    }
  } else if (resultSize > 1 && resultSize <= 50) {
    if (addressType === AddressType.OWNER) {
      context.pageTitle =
        ownedByApplicant === Options.YES
          ? 'Enter your address'
          : "Enter the owner's address"
    } else {
      context.pageTitle = 'Enter your address'
    }
  } else if (resultSize > 50) {
    context.pageTitle = 'Too many results, you will need to enter the address'
  }

  if (addressType === AddressType.OWNER) {
    context.helpText =
      ownedByApplicant === Options.YES
        ? 'If your business owns the item, give your business address.'
        : 'If the owner is a business, give the business address.'
  } else {
    context.helpText =
      'If your business is helping someone else sell their item, give your business address.'
  }

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
  } else if (
    Validators.maxLength(payload.addressLine1, CharacterLimits.Input)
  ) {
    errors.push({
      name: 'addressLine1',
      text: `Building and street information must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.maxLength(payload.addressLine2, CharacterLimits.Input)) {
    errors.push({
      name: 'addressLine2',
      text: `Field must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.empty(payload.townOrCity)) {
    errors.push({
      name: 'townOrCity',
      text: 'Enter a town or city'
    })
  } else if (Validators.maxLength(payload.townOrCity, CharacterLimits.Input)) {
    errors.push({
      name: 'townOrCity',
      text: `Town or city must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
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
    addressLine1: convertToCommaSeparatedTitleCase(_buildAddressLine1(address)),
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

const _buildAddressLine1 = address => {
  let addressLine1 = ''
  const buildingNameOrNumber = _getBuildingNameOrNumber(address)

  if (buildingNameOrNumber) {
    addressLine1 += buildingNameOrNumber
  }

  if (address.Street) {
    addressLine1 += address.Street
  } else {
    addressLine1 = addressLine1.substring(0, addressLine1.length - 2)
  }

  return addressLine1
}

const _getBuildingNameOrNumber = address => {
  let nameOrNumber = ''
  const fields = ['BuildingName', 'SubBuildingName', 'BuildingNumber']

  for (const field of fields) {
    const value = address[field]
    if (value && value.length) {
      nameOrNumber += `${value}, `
    }
  }
  return nameOrNumber
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
