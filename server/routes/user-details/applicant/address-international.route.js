'use strict'

const { Paths } = require('../../../utils/constants')
const { get, post } = require('../../common/address-international.route')

module.exports = [
  {
    method: 'GET',
    path: `${Paths.APPLICANT_ADDRESS_INTERNATIONAL}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_ADDRESS_INTERNATIONAL}`,
    handler: post
  }
]
