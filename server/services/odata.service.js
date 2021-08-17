'use strict'

const fetch = require('node-fetch')

const config = require('../utils/config')
const { DataVerseFieldName, StatusCodes } = require('../utils/constants')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')

const SECTION_2_ENDPOINT = 'cre2c_ivorysection2cases'
const SECTION_10_ENDPOINT = 'cre2c_ivorysection10cases'

module.exports = class ODataService {
  static async createRecord (body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Prefer: 'return=representation'
    }

    const idColumnName = isSection2
      ? DataVerseFieldName.SECTION_2_CASE_ID
      : DataVerseFieldName.SECTION_10_CASE_ID

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
      console.log(await response.json())

      const fieldName = isSection2
        ? DataVerseFieldName.NAME
        : DataVerseFieldName.SUBMISSION_REFERENCE
      throw new Error(
        `Error creating record: ${response.status}, section ${
          isSection2 ? '2' : '10'
        } submission reference: ${body[fieldName]}`
      )
    }

    return response.json()
  }

  static async getRecord (id, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Prefer: 'return=representation'
    }

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${
      isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    }(${id})`

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    if (response.status !== StatusCodes.OK) {
      console.log(await response.json())

      throw new Error(
        `Error getting record: ${response.status}, section ${
          isSection2 ? '2' : '10'
        } case ID: ${id}`
      )
    }

    return response.json()
  }

  static async updateRecord (id, body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${
      isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    }(${id})`

    _setContentLength(headers, body)

    console.log(`Patching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers
    })

    if (response.status !== StatusCodes.NO_CONTENT) {
      throw new Error(
        `Error updating record: ${response.status}, section ${
          isSection2 ? '2' : '10'
        } case ID: ${id}`
      )
    }
  }

  static async updateRecordAttachments (id, supportingInformation) {
    const token = await ActiveDirectoryAuthService.getToken()

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    for (let i = 0; i < supportingInformation.files.length; i++) {
      const fieldName = `cre2c_supportingevidence${i + 1}`
      const url = `${apiEndpoint}/${SECTION_2_ENDPOINT}(${id})/${fieldName}`

      const headers = {
        'OData-Version': '4.0',
        'OData-MaxVersion': '4.0',
        Authorization: `Bearer ${token}`,
        Prefer: 'return=representation',
        'Content-Type': 'application/octet-stream',
        'x-ms-file-name': supportingInformation.files[i]
      }

      const body = Buffer.from(supportingInformation.fileData[i], 'base64')

      console.log(`Patching URL: [${url}]`)

      await fetch(url, {
        method: 'PATCH',
        headers,
        body
      })
    }
  }
}

const _setContentLength = (headers, body) => {
  headers['Content-Length'] = JSON.stringify(body).length
}
