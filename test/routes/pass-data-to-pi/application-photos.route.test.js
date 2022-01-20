'use strict'
import { jest } from '@jest/globals';
import fs from 'fs';

jest.mock('./server/services/odata.service.js')
import ODataService from '../../../server/services/odata.service.js';
import TestHelper from '../../utils/test-helper.js';
import mockEntity from '../../mock-data/section-2-entity';

const KEY = '___THE_KEY___'

describe('/pass-data-to-pi/application-photos route', () => {
  let server
  const url = `/pass-data-to-pi/application-photos?id=123&key=${KEY}`

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

      it('should get an image file', async () => {
        await TestHelper.submitGetRequest(server, getOptions, 200, false)
      })
    })
  })
})

const _createMocks = async () => {
  TestHelper.createMocks()

  const testEntity = Object.assign({}, mockEntity)

  const imageFile = await fs.promises.readFile('./test/mock-data/panda.jpeg')

  ODataService.getRecord = jest.fn().mockResolvedValue(testEntity)
  ODataService.getImage = jest.fn().mockResolvedValue(imageFile)
}
