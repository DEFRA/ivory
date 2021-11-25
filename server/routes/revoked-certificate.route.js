'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const { Paths, RedisKeys, Views, Analytics } = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const MAX_LENGTH = 10

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.REVOKED_CERTIFICATE, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.REVOKED_CERTIFICATE, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.revokedCertificateNumber}`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.REVOKED_CERTIFICATE,
      payload.revokedCertificateNumber
    )

    return h.redirect(Paths.CAN_CONTINUE)
  }
}

const _getContext = async request => {
  let revokedCertificateNumber
  if (request.payload) {
    revokedCertificateNumber = request.payload.revokedCertificateNumber
  } else {
    revokedCertificateNumber = await RedisService.get(
      request,
      RedisKeys.REVOKED_CERTIFICATE
    )
  }

  return {
    revokedCertificateNumber,
    pageTitle:
      "Enter the certificate number from the cancelled or 'revoked' certificate",
    maxLength: MAX_LENGTH
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.revokedCertificateNumber)) {
    errors.push({
      name: 'revokedCertificateNumber',
      text: 'Enter the certificate number from the revoked certificate'
    })
  }

  if (Validators.maxLength(payload.revokedCertificateNumber, MAX_LENGTH)) {
    errors.push({
      name: 'revokedCertificateNumber',
      text: `The certificate number should be ${formatNumberWithCommas(
        MAX_LENGTH
      )} characters long`
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.REVOKED_CERTIFICATE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.REVOKED_CERTIFICATE}`,
    handler: handlers.post
  }
]
