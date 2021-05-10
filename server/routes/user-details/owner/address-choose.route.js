'use strict'

const { Paths } = require('../../../utils/constants')
const { get, post } = require('../../common/address-choose.route')

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: post
  }
]
