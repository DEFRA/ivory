'use strict'

const fetch = require('node-fetch')

const config = require('../utils/config')
const {
  DataVerseFieldName,
  DownloadReason,
  StatusCodes
} = require('../utils/constants')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')

const SECTION_2_ENDPOINT = 'cre2c_ivorysection2cases'
const SECTION_10_ENDPOINT = 'cre2c_ivorysection10cases'

const ContentTypes = {
  APPLICATION_JSON: 'application/json',
  APPLICATION_OCTET_STREAM: 'application/octet-stream'
}

const ODATA_VERSION = 'OData-Version'
const ODATA_MAX_VERSION = 'OData-MaxVersion'
const CONTENT_TYPE = 'Content-Type'
const AUTHORIZATION = 'Authorization'
const PREFER = 'Prefer'

const ODATA_VERSION_NUMBER = '4.0'
const PREFER_REPRESENTATION = 'return=representation'

module.exports = class ODataService {
  /**
   * Validates a certificate number.
   * @param {*} certificateNumber
   * @returns Section 2 records which have the certificate number
   */
  static async getRecordsWithCertificateNumber (certificateNumber) {
    const token = await ActiveDirectoryAuthService.getToken()
    const headers = {
      [ODATA_VERSION]: ODATA_VERSION_NUMBER,
      [ODATA_MAX_VERSION]: ODATA_VERSION_NUMBER,
      [CONTENT_TYPE]: ContentTypes.APPLICATION_OCTET_STREAM,
      [AUTHORIZATION]: `Bearer ${token}`,
      [PREFER]: PREFER_REPRESENTATION
    }

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`
    const url = `${apiEndpoint}/${SECTION_2_ENDPOINT}?$filter=cre2c_certificatenumber eq '${certificateNumber}'`

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    const matchingRecords = await response.json()

    if (response.status !== StatusCodes.OK) {
      throw new Error(
        `Error checking for certificate number: ${certificateNumber}`
      )
    }

    return matchingRecords && matchingRecords.value
      ? matchingRecords.value
      : null
  }

  static async createRecord (body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      [ODATA_VERSION]: ODATA_VERSION_NUMBER,
      [ODATA_MAX_VERSION]: ODATA_VERSION_NUMBER,
      [CONTENT_TYPE]: ContentTypes.APPLICATION_JSON,
      [AUTHORIZATION]: `Bearer ${token}`,
      [PREFER]: PREFER_REPRESENTATION
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
      console.error(responseDetail)

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

  static async getRecord (id, isSection2 = true, key, downloadReason) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      [ODATA_VERSION]: ODATA_VERSION_NUMBER,
      [ODATA_MAX_VERSION]: ODATA_VERSION_NUMBER,
      [CONTENT_TYPE]: ContentTypes.APPLICATION_JSON,
      [AUTHORIZATION]: `Bearer ${token}`,
      [PREFER]: PREFER_REPRESENTATION
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

    return entity[DataVerseFieldName.CERTIFICATE_KEY] === key &&
      !_linkIsExpired(entity, downloadReason)
      ? entity
      : null
  }

  static async getImage (id, imageName) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      [ODATA_VERSION]: ODATA_VERSION_NUMBER,
      [ODATA_MAX_VERSION]: ODATA_VERSION_NUMBER,
      [CONTENT_TYPE]: ContentTypes.APPLICATION_OCTET_STREAM,
      [AUTHORIZATION]: `Bearer ${token}`,
      [PREFER]: PREFER_REPRESENTATION
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

  static async getDocument (id, dataverseFieldName, key) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      [ODATA_VERSION]: ODATA_VERSION_NUMBER,
      [ODATA_MAX_VERSION]: ODATA_VERSION_NUMBER,
      [CONTENT_TYPE]: ContentTypes.APPLICATION_OCTET_STREAM,
      [AUTHORIZATION]: `Bearer ${token}`
    }

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${SECTION_2_ENDPOINT}(${id})/${dataverseFieldName}/$value`

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    return response
  }

  static async updateRecord (id, body, isSection2 = true) {
    const token = await ActiveDirectoryAuthService.getToken()

    const headers = {
      [ODATA_VERSION]: ODATA_VERSION_NUMBER,
      [ODATA_MAX_VERSION]: ODATA_VERSION_NUMBER,
      [CONTENT_TYPE]: ContentTypes.APPLICATION_JSON,
      [AUTHORIZATION]: `Bearer ${token}`
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
        'OData-Version': ODATA_VERSION_NUMBER,
        'OData-MaxVersion': ODATA_VERSION_NUMBER,
        [AUTHORIZATION]: `Bearer ${token}`,
        [PREFER]: PREFER_REPRESENTATION,
        [CONTENT_TYPE]: ContentTypes.APPLICATION_OCTET_STREAM,
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

const _linkIsExpired = (entity, downloadReason) => {
  const linkExpiryDate =
    entity[
      downloadReason === DownloadReason.SEND_DATA_TO_PI
        ? DataVerseFieldName.PI_LINK_EXPIRY
        : DataVerseFieldName.CERTIFICATE_LINK_EXPIRY
    ]

  const now = new Date().setHours(0, 0, 0, 0)
  const expiry = new Date(Date.parse(linkExpiryDate)).setHours(0, 0, 0, 0)

  return linkExpiryDate === null || now > expiry
}

const _setContentLength = (headers, body) => {
  headers['Content-Length'] = JSON.stringify(body).length
}
