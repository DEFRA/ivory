'use strict'

const fetch = require('node-fetch')

const config = require('../utils/config')
const { StatusCodes } = require('../utils/constants')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')
const authService = new ActiveDirectoryAuthService()

const SECTION_2_ENDPOINT = 'cre2c_ivorysection2cases'
const SECTION_10_ENDPOINT = 'cre2c_ivorysection10cases'

const headers = {
  'OData-Version': '4.0',
  'OData-MaxVersion': '4.0',
  'Content-Type': 'application/json'
}

module.exports = class ODataService {
  static async createRecord (body, isSection2) {
    const token = await authService.getToken()

    headers.Authorization = `Bearer ${token}`
    headers.Prefer = 'return=representation'

    const idColumnName = isSection2
      ? 'cre2c_ivorysection2caseid'
      : 'cre2c_ivorysection10caseid'

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${
      isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    }?$select=${idColumnName}`

    _setContentLength(headers, body)

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })

    if (response.status !== StatusCodes.CREATED) {
      const fieldName = isSection2 ? 'cre2c_name' : 'cre2c_submissionreference'
      throw new Error(
        'Error creating record, submission reference: ' + body[fieldName]
      )
    }

    return response.json()
  }

  static async updateRecord (id, body, isSection2) {
    const token = await authService.getToken()

    headers.Authorization = `Bearer ${token}`
    delete headers.Prefer

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${
      isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    }(${id})`

    _setContentLength(headers, body)

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers
    })

    if (response.status !== StatusCodes.NO_CONTENT) {
      throw new Error('Error updating record: ' + id)
    }
  }
}

const _setContentLength = (headers, body) => {
  headers['Content-Length'] = JSON.stringify(body).length
}
