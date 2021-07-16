'use strict'

const fetch = require('node-fetch')

const config = require('../utils/config')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')
const authService = new ActiveDirectoryAuthService()

// TODO
// const SECTION_2_ENDPOINT = 'cre2c_ivorysection2cases'
const SECTION_10_ENDPOINT = 'cre2c_ivorysection10cases'

const headers = {
  'OData-Version': '4.0',
  'OData-MaxVersion': '4.0',
  'Content-Type': 'application/json'
}

module.exports = class ODataService {
  static async createRecord (body) {
    const token = await authService.getToken()

    headers.Authorization = `Bearer ${token}`

    const apiEndpoint = config.dataverseApiEndpoint

    // TODO section 2
    const url = `${apiEndpoint}/${SECTION_10_ENDPOINT}`

    _setContentLength(headers, body)

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })

    // TODO remove this
    console.log(response)
  }
}

const _setContentLength = (headers, body) => {
  headers['Content-Length'] = JSON.stringify(body).length
}
