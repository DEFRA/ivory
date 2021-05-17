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

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_CHOOSE
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)
    return h.view(Views.ADDRESS_CHOOSE, {
      ...(await _getContext(request, addressType))
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_CHOOSE, {
          ...(await _getContext(request, addressType)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      payload.address
    )

    if (ownedByApplicant === Options.YES) {
      RedisService.set(request, RedisKeys.APPLICANT_ADDRESS, payload.address)
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

const _getContext = async (request, addressType) => {
  let context

  const ownedByApplicant = await RedisService.get(
    request,
    RedisKeys.OWNED_BY_APPLICANT
  )

  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND_RESULTS)
  )

  const items = addresses.map(item => {
    return {
      value: item.Address.AddressLine,
      text: item.Address.AddressLine
    }
  })

  if (addressType === AddressType.OWNER) {
    context = _getContextForOwnerAddressType(ownedByApplicant)
  } else {
    context = _getContextForApplicantAddressType()
  }

  context.addresses = items

  await _addBuildingNameOrNumberAndPostcodeToContext(request, context)

  return context
}

const _getContextForOwnerAddressType = ownedByApplicant => {
  return {
    pageTitle:
      ownedByApplicant === Options.YES
        ? 'Choose your address'
        : "Choose the owner's address"
  }
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'Choose your address'
  }
}

const _addBuildingNameOrNumberAndPostcodeToContext = async (
  request,
  context
) => {
  const nameOrNumber = await RedisService.get(
    request,
    RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER
  )

  const postcode = await RedisService.get(
    request,
    RedisKeys.ADDRESS_FIND_POSTCODE
  )

  context.showHelpText = nameOrNumber && postcode
  context.nameOrNumber = nameOrNumber
  context.postcode = postcode
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.address)) {
    errors.push({
      name: 'address',
      text: 'You must choose an address'
    })
  }

  return errors
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
