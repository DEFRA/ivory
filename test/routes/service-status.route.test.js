'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

describe('Enter Permit Number route', () => {
  let server
  const url = '/service-status'

  const elementIDs = {
    pageHeading: 'page-heading',
    serviceNameLabel: 'service-name-label',
    serviceName: 'service-name',
    versionLabel: 'version-label',
    version: 'version',
    serverStartedLabel: 'server-started-label',
    serverStarted: 'server-started',
    pageRenderedLabel: 'page-rendered-label',
    pageRendered: 'page-rendered'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(() => {
    server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should not have the Back link', () => {
      TestHelper.checkBackLink(document, false)
    })

    it('should display the correct page heading', () => {
      const element = document.querySelector(`#${elementIDs.pageHeading}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Service status')
    })

    it('should display the service name', () => {
      let element = document.querySelector(`#${elementIDs.serviceNameLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Service:')

      element = document.querySelector(`#${elementIDs.serviceName}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('ivory')
    })

    it('should display the version number', () => {
      let element = document.querySelector(`#${elementIDs.versionLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Version:')

      element = document.querySelector(`#${elementIDs.version}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })

    it('should display the date/time that the server started', () => {
      let element = document.querySelector(`#${elementIDs.serverStartedLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Server started:')

      element = document.querySelector(`#${elementIDs.serverStarted}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })

    it('should display the date/time that the page was rendered', () => {
      let element = document.querySelector(`#${elementIDs.pageRenderedLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Page rendered:')

      element = document.querySelector(`#${elementIDs.pageRendered}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })
  })
})
