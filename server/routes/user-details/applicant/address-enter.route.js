'use strict'

const { Paths } = require('../../../utils/constants')
const { get, post } = require('../../common/address-enter.route')

module.exports = [
  {
    method: 'GET',
    path: `${Paths.APPLICANT_ADDRESS_ENTER}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.APPLICANT_ADDRESS_ENTER}`,
    handler: post
  }
]
