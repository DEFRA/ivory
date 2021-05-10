'use strict'

const { Paths } = require('../../../utils/constants')
const { get, post } = require('../../common/address-confirm.route')

module.exports = [
  {
    method: 'GET',
    path: `${Paths.APPLICANT_ADDRESS_CONFIRM}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_ADDRESS_CONFIRM}`,
    handler: post
  }
]
