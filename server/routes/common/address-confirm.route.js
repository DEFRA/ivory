'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')
const RedisHelper = require('../../services/redis-helper.service')

const {
  AddressType,
  Analytics,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_CONFIRM
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)

    const context = await _getContext(request, addressType)

    return h.view(Views.ADDRESS_CONFIRM, {
      ...context
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const context = await _getContext(request, addressType)

    AnalyticsService.sendEvent(request, {
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

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS_INTERNATIONAL
        : RedisKeys.APPLICANT_ADDRESS_INTERNATIONAL,
      false
    )

    if (addressType === AddressType.APPLICANT && context.isOwnedByApplicant) {
      await RedisService.set(
        request,
        RedisKeys.OWNER_ADDRESS,
        context.address.AddressLine
      )

      await RedisService.set(
        request,
        RedisKeys.OWNER_ADDRESS_INTERNATIONAL,
        false
      )
    }

    let route
    if (addressType === AddressType.OWNER) {
      route = context.isOwnedByApplicant
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

  if (addressType === AddressType.OWNER) {
    context = _getContextForOwnerAddressType()
  } else {
    context = _getContextForApplicantAddressType()
  }

  context.isOwnedByApplicant = await RedisHelper.isOwnedByApplicant(request)

  const addresses = await RedisService.get(
    request,
    RedisKeys.ADDRESS_FIND_RESULTS
  )

  context.address = addresses[0].Address

  _convertSingleLineAddressToMultipleLines(
    context,
    addresses[0].Address.AddressLine
  )

  return context
}

const _getContextForOwnerAddressType = () => {
  return {
    pageTitle: 'Confirm address',
    editAddressUrl: '/user-details/owner/address-enter'
  }
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'Confirm address',
    editAddressUrl: '/user-details/applicant/address-enter'
  }
}

const _convertSingleLineAddressToMultipleLines = (context, address) => {
  const firstCommaReplacementToken = '###'

  address = address.replace(', ', firstCommaReplacementToken)
  context.addressLines = address.split(',')
  context.addressLines[0] = context.addressLines[0].replace(
    firstCommaReplacementToken,
    ', '
  )
  context.addressLines = context.addressLines.map(addressLine =>
    addressLine.trim()
  )
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
