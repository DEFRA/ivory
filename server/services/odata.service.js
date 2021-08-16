'use strict'

const fetch = require('node-fetch')
const { Readable } = require('stream')

const config = require('../utils/config')
const { DataVerseFieldName, StatusCodes } = require('../utils/constants')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')

const SECTION_2_ENDPOINT = 'cre2c_ivorysection2cases'
const SECTION_10_ENDPOINT = 'cre2c_ivorysection10cases'

const headers = {
  'OData-Version': '4.0',
  'OData-MaxVersion': '4.0',
  'Content-Type': 'application/json'
}

module.exports = class ODataService {
  static async createRecord (body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

    headers.Authorization = `Bearer ${token}`
    headers.Prefer = 'return=representation'

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

    const headers2 = {
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      'Content-Type': 'application/octet-stream'
    }

    headers2.Authorization = `Bearer ${token}`
    headers2.Prefer = 'return=representation'

    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    // const url = `${apiEndpoint}/${
    //   isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    // }(${id})`

    // http://localhost:3000/get-record/2/8c09c224-d3fa-eb11-94ef-000d3ad67dc2

    // const url = `${apiEndpoint}/${
    //   isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    // }(${id})/cre2c_supportingevidence1/$value`

    id = '5271d041-7cfe-eb11-94ef-000d3ad67dc2'

    const url = `${apiEndpoint}/${
      isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    }(${id})/cre2c_supportingevidence1`

    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'GET',
      headers: headers2
      // headers
    })

    const buffer = await response.buffer()
    console.log(buffer.length)
    console.log(buffer.toString('utf-8'))

    this._updateAttachment(token, buffer)

    // // const url2 = `${apiEndpoint}/${
    // //   isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    // // }(${id})/cre2c_supportingevidence1/$value`

    // // const url2 = `${apiEndpoint}/${
    // //   isSection2 ? SECTION_2_ENDPOINT : SECTION_10_ENDPOINT
    // // }(${id})/cre2c_supportingevidence1`

    // const url3 =
    //   'https://ivory-trade-dev.crm11.dynamics.com/api/data/v9.1/cre2c_ivorysection2cases(5271d041-7cfe-eb11-94ef-000d3ad67dc2)/cre2c_supportingevidence1'

    // // const url3 =
    // // 'https://ivory-trade-dev.crm11.dynamics.com/api/data/v9.1/cre2c_ivorysection2cases(94fb74d8-69fe-eb11-94ef-000d3ad67de4)/cre2c_supportingevidence1?x-ms-file-name=foo2.pdf'
    // console.log(`PATCH URL: [${url3}]`)

    // // headers2['Content-Type'] = 'application/json'
    // headers2['Content-Type'] = 'application/octet-stream'
    // headers2['x-ms-file-name'] = 'sample.pdf'

    // const body = {
    //   value: buffer.toString('utf-8')
    // }

    // {"error":{"code":"0x80040217",
    // "message":"No file attachment found for attribute: cre2c_supportingevidence1 EntityId: 5271d041-7cfe-eb11-94ef-000d3ad67dc2."}}

    // console.log(headers2)

    // const data = buffer.toString('utf-8')
    // const response2 = await fetch(url3, {
    //   method: 'PATCH',
    //   headers: headers2,
    //   body: data
    //   // body: {
    //   //   '@odata.context':
    //   //     'https://ivory-trade-dev.crm11.dynamics.com/api/data/v9.1/$metadata#cre2c_ivorysection2cases(5271d041-7cfe-eb11-94ef-000d3ad67dc2)/cre2c_supportingevidence1',
    //   //   // defra_primarycontactid@odata.bind: 'contacts(10b88e9b-abaa-e711-8114-5065f38a3b21)'
    //   //   value: buffer.toString('utf-8')
    //   // }
    //   // body: JSON.stringify(body)
    //   // body: Readable.from(buffer.toString())
    //   // body: []
    //   // body: JSON.stringify({ value: null })
    //   // headers
    // })

    // _setContentLength(headers2, data)

    // console.log(response2)

    // console.log(await response2.json())

    // if (response.status !== StatusCodes.OK) {
    //   console.log(await response.json())

    //   throw new Error(
    //     `Error getting record: ${response.status}, section ${
    //       isSection2 ? '2' : '10'
    //     } case ID: ${id}`
    //   )
    // }

    // return response.json()
  }

  static async _updateAttachment (token, buffer) {
    console.log('UPDATING:')

    const f = JSON.parse(buffer.toString('utf-8'))
    console.log(f.value)

    // // POSTMAN works:
    // // https://{{env_url}}/api/data/v9.1/cre2c_ivorysection2cases(94fb74d8-69fe-eb11-94ef-000d3ad67de4)/cre2c_supportingevidence1?x-ms-file-name=foo.pdf

    // patch
    // https://{{env_url}}/api/data/v9.1/
    // cre2c_ivorysection2cases(5271d041-7cfe-eb11-94ef-000d3ad67dc2)/cre2c_supportingevidence1

    const id = '5271d041-7cfe-eb11-94ef-000d3ad67dc2'
    const apiEndpoint = `${config.dataverseResource}/${config.dataverseApiEndpoint}`

    const url = `${apiEndpoint}/${SECTION_2_ENDPOINT}(${id})/cre2c_supportingevidence1`

    const headers = {
      Authorization: `Bearer ${token}`,
      Prefer: 'return=representation',
      'Content-Type': 'application/octet-stream',
      'x-ms-file-name': 'upload-file.pdf',

      Connection: 'keep-alive'
    }

    // const body = buffer.toString('utf-8')
    const body = Buffer.from(f.value, 'utf8')

    _setContentLength(headers, body)

    console.log(`Patching URL: [${url}]`)

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body
    })

    console.log(response)
  }

  static async updateRecord (id, body, isSection2) {
    const token = await ActiveDirectoryAuthService.getToken()

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
      throw new Error(
        `Error updating record: ${response.status}, section ${
          isSection2 ? '2' : '10'
        } case ID: ${id}`
      )
    }
  }
}

const _setContentLength = (headers, body) => {
  headers['Content-Length'] = JSON.stringify(body).length
}
