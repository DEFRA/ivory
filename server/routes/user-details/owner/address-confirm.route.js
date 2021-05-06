'use strict'

const { Paths } = require('../../../utils/constants')
const { get, post } = require('../../common/address-confirm.route')

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CONFIRM}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CONFIRM}`,
    handler: post
  }
]
