'use strict'

const {
  AddressType,
  Options,
  Paths,
  RedisKeys,
  Views,
  Analytics
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

    await request.ga.event({
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.CONFIRM,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      context.address.AddressLine
    )

    if (ownedByApplicant === Options.YES) {
      await RedisService.set(
        request,
        RedisKeys.APPLICANT_ADDRESS,
        context.address.AddressLine
      )
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
    await RedisService.get(request, RedisKeys.ADDRESS_FIND_RESULTS)
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
        : "Confirm the owner's address",
    editAddressUrl: '/user-details/owner/address-enter'
  }
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'Confirm your address',
    editAddressUrl: '/user-details/applicant/address-enter'
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
