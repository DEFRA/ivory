'use strict'

const { Paths, RedisKeys, Views } = require('../../../utils/constants')
const RedisService = require('../../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { title } = require('case')

const notOnList = false // Temporary to be used until hooked up properly

const handlers = {
  get: async (request, h) => {
    return h.view(Views.ADDRESS_ENTER, {
      ...(await _getContext(request))
    })
  },
  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_ENTER, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    } else {
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }
  }
}

const _getContext = async request => {
  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND)
  )
  const resultSize = (addresses.length)

  if (notOnList === true) {
    return {
      title: 'Enter your address',
      helpText: 'If your business owns the item, give your business address.'
    }
  } else if (resultSize === 0) {
    return {
      title: 'No results, you will need to enter the address',
      helpText: 'If your business owns the item, give your business address.'
    }
  } else if (resultSize === 1) {
    return {
      title: 'Edit your address',
      helpText: 'If your business owns the item, give your business address.',
      buildingStreet: addresses[0].Address.SubBuildingName
        ? title(addresses[0].Address.SubBuildingName)
        : `${title(addresses[0].Address.BuildingNumber)} ${title(addresses[0].Address.Street)}`,
      locality: title(addresses[0].Address.Locality),
      town: title(addresses[0].Address.Town),
      postcode: addresses[0].Address.Postcode
    }
  } else if (resultSize > 50) {
    return {
      title: 'Too many results, you will need to enter the address',
      helpText: 'If your business owns the item, give your business address.'
    }
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.addressLine1)) {
    errors.push({
      name: 'addressLine1',
      text: 'Enter the building and street information'
    })
  }

  if (Validators.empty(payload.addressTownOrCity)) {
    errors.push({
      name: 'addressTownOrCity',
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
