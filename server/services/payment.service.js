'use strict'

const fetch = require('node-fetch')

// const config = require('../utils/config')

const PAYMENT_ENDPOINT = 'v1/payments'

module.exports = class PaymentService {
  static async makePayment (amount, reference, description) {
    const url = `https://publicapi.payments.service.gov.uk/${PAYMENT_ENDPOINT}`

    // TODO add to config
    const apiKey =
      'api_test_g8su1ibc50012gejidmo88ktsedg8pkekpi4dfo0lhbb917frk5mopsgv0'

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    }

    const body = {
      amount: 25000,
      reference: 'REFERENCE',
      description: 'Tell us you want to sell or hire out ivory',
      return_url: 'http://localhost:3000/service-complete',
      email: 'bob@bobbins.com'
    }

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })

    return response.json()
  }

  static async lookupPayment (paymentId) {
    const url = `https://publicapi.payments.service.gov.uk/${PAYMENT_ENDPOINT}/${paymentId}`

    // TODO add to config
    const apiKey =
      'api_test_g8su1ibc50012gejidmo88ktsedg8pkekpi4dfo0lhbb917frk5mopsgv0'

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    return response.json()
  }
}
