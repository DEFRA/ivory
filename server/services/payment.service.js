'use strict'

const fetch = require('node-fetch')

const config = require('../utils/config')
const { Paths } = require('../utils/constants')

const PAYMENT_ENDPOINT = 'v1/payments'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.paymentApiKey}`
}

module.exports = class PaymentService {
  static async makePayment (amountInPence, reference, description, email) {
    const url = `${config.paymentUrl}/${PAYMENT_ENDPOINT}`

    const body = {
      amount: amountInPence,
      reference,
      description,
      return_url: `${config.serviceHost}:${config.servicePort}${Paths.SERVICE_COMPLETE}`,
      email
    }

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })

    return response.json()
  }

  static async lookupPayment (paymentId) {
    const url = `${config.paymentUrl}/${PAYMENT_ENDPOINT}/${paymentId}`

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    return response.json()
  }
}
