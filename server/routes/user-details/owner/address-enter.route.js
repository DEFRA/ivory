'use strict'

const { title } = require('case')

const { Paths, RedisKeys, Views } = require('../../../utils/constants')
const RedisService = require('../../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.ADDRESS_ENTER, {
      ...(await _getContext(request, true))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_ENTER, {
          ...(await _getContext(request, false)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    _updateAddressFieldCasing(payload)
    const address = _concatenateAddressFields(payload)

    RedisService.set(request, RedisKeys.OWNER_ADDRESS, address)

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = async (request, isGet) => {
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
      ? title(address.SubBuildingName)
      : `${title(address.BuildingNumber)} ${title(address.Street)}`,
    addressLine2: title(address.Locality),
    townOrCity: title(address.Town),
    postcode: address.Postcode
  }
}
const _updateAddressFieldCasing = payload => {
  for (const key in payload) {
    payload[key] =
      key === 'postcode' ? payload[key].toUpperCase() : title(payload[key])
  }
}

const _concatenateAddressFields = payload => {
  return Object.keys(payload)
    .map(key => payload[key])
    .join(', ')
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_ENTER}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_ENTER}`,
    handler: handlers.post
  }
]
