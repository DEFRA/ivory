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
    const url = `${apiEndpoint}/${SECTION_2_ENDPOINT}?$filter=cre2c_certificatenumber eq '${_replaceUnsafeCharacters(
      certificateNumber
    )}'`
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

  static async getRecord (id, key, downloadReason, isSection2 = true) {
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

    return response.buffer()
  }

  static async getDocument (id, dataverseFieldName) {
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

    return response.buffer()
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

  static async updatePhotos (isSection2, entity, photoRecords) {
    const token = await ActiveDirectoryAuthService.getToken()

    const id = isSection2
      ? entity[DataVerseFieldName.SECTION_2_CASE_ID]
      : entity[DataVerseFieldName.SECTION_10_CASE_ID]

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`
    const patchCommands = []
    for (let i = 0; i < photoRecords.files.length; i++) {
      const fieldName = `cre2c_photo${i + 1}`
      const url = `${apiEndpoint}/${isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT}(${id})/${fieldName}`

      const headers = {
        'OData-Version': ODATA_VERSION_NUMBER,
        'OData-MaxVersion': ODATA_VERSION_NUMBER,
        [AUTHORIZATION]: `Bearer ${token}`,
        [PREFER]: PREFER_REPRESENTATION,
        [CONTENT_TYPE]: ContentTypes.APPLICATION_OCTET_STREAM
      }

      const body = Buffer.from(photoRecords.fileData[i], 'base64')

      patchCommands.push(fetch(url, {
        method: 'PATCH',
        headers,
        body
      }))
    }
    await Promise.all(patchCommands)
  }

  static async updateRecordAttachments (id, supportingInformation) {
    const token = await ActiveDirectoryAuthService.getToken()

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`
    const patchCommands = []
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

      patchCommands.push(fetch(url, {
        method: 'PATCH',
        headers,
        body
      }))
    }
    await Promise.all(patchCommands)
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

const _replaceUnsafeCharacters = certificateNumber => {
  return certificateNumber
    ? certificateNumber
        .replaceAll('%', '%25')
        .replaceAll('+', '%2B')
        .replaceAll('&', '%26')
        .replaceAll('#', '%23')
        .replaceAll('|', '%7C')
        .replaceAll('<', '%3C')
        .replaceAll('>', '%3E')
        .replaceAll('^', '%5E')
        .replaceAll('\\', '%5C')
        .replaceAll('{', '%7B')
        .replaceAll('}', '%7D')
        .replaceAll('[', '%5B')
        .replaceAll(']', '%5D')
        .replaceAll("'", "''")
    : ''
}
