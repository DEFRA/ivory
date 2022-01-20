'use strict'
import { jest } from '@jest/globals';
import fs from 'fs';

jest.mock('./server/services/odata.service.js')
import ODataService from '../../../server/services/odata.service.js';
import TestHelper from '../../utils/test-helper.js';
import mockEntity from '../../mock-data/section-2-entity';

const KEY = '___THE_KEY___'
const FILENAME = 'my-file.pdf'

describe('/pass-data-to-pi/application-documents route', () => {
  let server
  const url = `/pass-data-to-pi/application-documents?record_id=123&dataverseFieldName=cre2c_supportingevidence1&filename=${FILENAME}&key=${KEY}`

  const getOptions = {
    method: 'GET',
    url
  }

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    describe('Common content', () => {
      beforeEach(async () => {
        await _createMocks()
      })

      it('should get a PDF document', async () => {
        await TestHelper.submitGetRequest(server, getOptions, 200, false)
      })
    })
  })
})

const _createMocks = async () => {
  TestHelper.createMocks()

  const testEntity = Object.assign({}, mockEntity)

  const documentFile = await fs.promises.readFile(
    './test/mock-data/sample-document.pdf'
  )

  ODataService.getRecord = jest.fn().mockResolvedValue(testEntity)
  ODataService.getDocument = jest.fn().mockResolvedValue(documentFile)
}
