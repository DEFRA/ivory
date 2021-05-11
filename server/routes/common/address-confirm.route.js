'use strict'

const {
  AddressType,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const RedisService = require('../../services/redis.service')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_CONFIRM
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)

    return h.view(Views.ADDRESS_CONFIRM, {
      ...(await _getContext(request, addressType))
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const context = await _getContext(request, addressType)

    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      context.address.AddressLine
    )

    if (ownedByApplicant === Options.YES) {
      RedisService.set(
        request,
        RedisKeys.APPLICANT_ADDRESS,
        context.address.AddressLine
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

  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND)
  )

  context.address = addresses[0].Address

  _convertSingleLineAddressToMultipleLines(
    context,
    addresses[0].Address.AddressLine
  )

  return context
}

const _getContextForOwnerAddressType = ownedByApplicant => {
  return {
    pageTitle:
      ownedByApplicant === Options.YES
        ? 'Confirm your address'
        : "Confirm the owner's address"
  }
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'Confirm your address'
  }
}

const _convertSingleLineAddressToMultipleLines = (context, address) => {
  context.addressLines = address.split(',')
  context.addressLines = context.addressLines.map(address => address.trim())
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
