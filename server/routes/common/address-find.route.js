'use strict'

const {
  AddressType,
  Paths,
  RedisKeys,
  Views,
  Options
} = require('../../utils/constants')
const AddressService = require('../../services/address.service')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { addPayloadToContext } = require('../../utils/general')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_FIND
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    return h.view(Views.ADDRESS_FIND, {
      ...(await _getContext(request, getAddressType(request)))
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const payload = request.payload
    const errors = _validateForm(payload, addressType)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_FIND, {
          ...(await _getContext(request, addressType)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const searchResults = await AddressService.addressSearch(
      payload.nameOrNumber,
      payload.postcode
    )
    await RedisService.set(
      request,
      RedisKeys.ADDRESS_FIND,
      JSON.stringify(searchResults)
    )

    const resultSize = searchResults.length

    if (resultSize === 0 || resultSize > 50) {
      return h.redirect(
        addressType === AddressType.OWNER
          ? Paths.OWNER_ADDRESS_ENTER
          : Paths.APPLICANT_ADDRESS_ENTER
      )
    }

    if (resultSize === 1) {
      return h.redirect(
        addressType === AddressType.OWNER
          ? Paths.OWNER_ADDRESS_CONFIRM
          : Paths.APPLICANT_ADDRESS_CONFIRM
      )
    }

    if (resultSize > 1) {
      return h.redirect(
        addressType === AddressType.OWNER
          ? Paths.OWNER_ADDRESS_CHOOSE
          : Paths.APPLICANT_ADDRESS_CHOOSE
      )
    }
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
      title: 'What is your address?',
      helpText:
        'If your business is the legal owner of the item, give your business address.'
    }
  } else {
    context = {
      title: 'What is the owner’s address?',
      helpText:
        'If the legal owner of the item is a business, give the business address.'
    }
  }
  return context
}

const _getContextForApplicantAddressType = () => {
  return {
    title: 'What is your address?',
    helpText:
      'If your business is helping someone else sell their item, give your business address.'
  }
}

const _validateForm = (payload, completedBy) => {
  const errors = []

  if (Validators.empty(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text:
        completedBy === AddressType.OWNER
          ? 'Enter your postcode'
          : 'Enter the owner’s postcode'
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

module.exports = {
  get: handlers.get,
  post: handlers.post
}
