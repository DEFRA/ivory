'use strict'

const fetch = require('node-fetch')

const config = require('../utils/config')
const { DataVerseFieldName, StatusCodes } = require('../utils/constants')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')

const SECTION_2_ENDPOINT = 'cre2c_ivorysection2cases'
const SECTION_10_ENDPOINT = 'cre2c_ivorysection10cases'

const ContentTypes = {
  APPLICATION_JSON: 'application/json',
  APPLICATION_OCTET_STREAM: 'application/octet-stream'
}

const oDataVersion = '4.0'
const PREFER_REPRESENTATION = 'return=representation'

module.exports = class ODataService {
  static async createRecord (body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': oDataVersion,
      'OData-MaxVersion': oDataVersion,
      'Content-Type': ContentTypes.APPLICATION_JSON,
      Authorization: `Bearer ${token}`,
      Prefer: PREFER_REPRESENTATION
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

    const responseDetail = await response.json()

    if (response.status !== StatusCodes.CREATED) {
      console.log(responseDetail)

      const fieldName = isSection2
        ? DataVerseFieldName.NAME
        : DataVerseFieldName.SUBMISSION_REFERENCE
      throw new Error(
        `Error creating Dataverse record: ${response.status}, section ${
          isSection2 ? '2' : '10'
        } submission reference: [${body[fieldName]}], payment reference: [${
          body[DataVerseFieldName.PAYMENT_REFERENCE]
        }]`
      )
    }

    return responseDetail
  }

  static async getRecord (id, isSection2 = true, key) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': oDataVersion,
      'OData-MaxVersion': oDataVersion,
      'Content-Type': ContentTypes.APPLICATION_JSON,
      Authorization: `Bearer ${token}`,
      Prefer: PREFER_REPRESENTATION
    }

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${
      isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    }(${id})`

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    const entity = await response.json()

    return entity[DataVerseFieldName.CERTIFICATE_KEY] === key ? entity : null
  }

  static async getImage (id, imageName) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': oDataVersion,
      'OData-MaxVersion': oDataVersion,
      'Content-Type': ContentTypes.APPLICATION_OCTET_STREAM,
      Authorization: `Bearer ${token}`,
      Prefer: PREFER_REPRESENTATION
    }

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${SECTION_2_ENDPOINT}(${id})/${imageName}/$value?size=full`

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    return response
  }

  static async updateRecord (id, body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      'OData-Version': oDataVersion,
      'OData-MaxVersion': oDataVersion,
      'Content-Type': ContentTypes.APPLICATION_JSON,
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
        'OData-Version': oDataVersion,
        'OData-MaxVersion': oDataVersion,
        Authorization: `Bearer ${token}`,
        Prefer: PREFER_REPRESENTATION,
        'Content-Type': ContentTypes.APPLICATION_OCTET_STREAM,
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
