'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import ODataService from '../services/odata.service.js';
import { AlreadyCertifiedOptions, Paths, RedisKeys, Views, Analytics } from '../utils/constants.js';
import { formatNumberWithCommas } from '../utils/general.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

const CERTIFICATE_NUMBER_MAX_LENGTH = 10

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.ALREADY_CERTIFIED, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = await _validateForm(payload, context)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.ALREADY_CERTIFIED, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    } else {
      if (payload.alreadyCertified !== AlreadyCertifiedOptions.YES) {
        delete payload.certificateNumber
      }

      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.MAIN_QUESTIONS,
        action: `${Analytics.Action.SELECTED} ${payload.alreadyCertified}${
          payload.alreadyCertified === AlreadyCertifiedOptions.YES
            ? ' - ' + payload.certificateNumber
            : ''
        }`,
        label: context.pageTitle
      })

      await Promise.all([
        RedisService.set(
          request,
          RedisKeys.ALREADY_CERTIFIED,
          JSON.stringify(payload)
        ),
        RedisService.set(
          request,
          RedisKeys.ALREADY_CERTIFIED_EXISTING_RECORD,
          JSON.stringify(context.existingRecord)
        ),

        RedisService.delete(request, RedisKeys.REVOKED_CERTIFICATE),
        RedisService.delete(request, RedisKeys.APPLIED_BEFORE),
        RedisService.delete(request, RedisKeys.PREVIOUS_APPLICATION_NUMBER)
      ])

      switch (payload.alreadyCertified) {
        case AlreadyCertifiedOptions.YES:
          return h.redirect(Paths.CAN_CONTINUE)

        case AlreadyCertifiedOptions.NO:
          return h.redirect(Paths.APPLIED_BEFORE)

        case AlreadyCertifiedOptions.USED_TO:
          return h.redirect(Paths.REVOKED_CERTIFICATE)

        default:
          throw new Error(
            `Invalid value for Already Certified: ${payload.alreadyCertified}`
          )
      }
    }
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.ALREADY_CERTIFIED)
  }

  const alreadyCertified = payload ? payload.alreadyCertified : null

  const options = _getOptions(alreadyCertified)
  const yesOption = options.shift()

  const existingRecord =
    payload && payload.certificateNumber
      ? await _getRecordForCertificateNumber(payload.certificateNumber)
      : null

  return {
    existingRecord,
    yesOption,
    pageTitle: 'Does the item already have an exemption certificate?',
    items: options,
    certificateNumber:
      payload && payload.alreadyCertified === AlreadyCertifiedOptions.YES
        ? payload.certificateNumber
        : null
  }
}

const _getOptions = alreadyCertified => {
  const options = Object.values(AlreadyCertifiedOptions).map(option => {
    return {
      label: option,
      checked: alreadyCertified && alreadyCertified === option
    }
  })

  const items = options.map(option => {
    return {
      text: option.label,
      value: option.label,
      checked: option.checked
    }
  })

  items[2].hint = {
    text: "The certificate has been cancelled or 'revoked'"
  }

  return items
}

const _validateForm = async (payload, context) => {
  const errors = []

  if (Validators.empty(payload.alreadyCertified)) {
    errors.push({
      name: 'alreadyCertified',
      text: 'Tell us if the item already has an exemption certificate'
    })
  }

  if (payload.alreadyCertified === AlreadyCertifiedOptions.YES) {
    if (Validators.empty(payload.certificateNumber)) {
      errors.push({
        name: 'certificateNumber',
        text: 'Enter the certificate number'
      })
    }

    if (
      Validators.maxLength(
        payload.certificateNumber,
        CERTIFICATE_NUMBER_MAX_LENGTH
      )
    ) {
      errors.push({
        name: 'certificateNumber',
        text: `Enter no more than ${formatNumberWithCommas(
          CERTIFICATE_NUMBER_MAX_LENGTH
        )} characters`
      })
    }

    if (errors.length === 0 && !context.existingRecord) {
      errors.push({
        name: 'certificateNumber',
        text: 'This certificate number is not recognised'
      })
    }
  }

  return errors
}

/**
 * Looks up the certificate number in the back office, returns true if the certificate exists, otherwise false
 * @param {*} certificateNumber
 */
const _getRecordForCertificateNumber = async certificateNumber => {
  const matchingRecords = await ODataService.getRecordsWithCertificateNumber(
    certificateNumber
  )

  const hasSingleMatch = matchingRecords && matchingRecords.length === 1

  return hasSingleMatch ? matchingRecords[0] : null
}

export default [
  {
    method: 'GET',
    path: `${Paths.ALREADY_CERTIFIED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.ALREADY_CERTIFIED}`,
    handler: handlers.post
  }
];
