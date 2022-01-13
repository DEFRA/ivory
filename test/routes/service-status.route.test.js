'use strict'

const TestHelper = require('../utils/test-helper')

describe('Enter Permit Number route', () => {
  let server
  const url = '/service-status'

  const elementIds = {
    pageTitle: 'pageTitle',
    serviceNameLabel: 'service-name-label',
    serviceName: 'service-name',
    versionLabel: 'version-label',
    version: 'version',
    clamVersionLabel: 'clam-version-label',
    clamVersion: 'clam-version',
    addressLookupLabel: 'address-lookup-label',
    addressLookup: 'address-lookup',
    serverStartedLabel: 'server-started-label',
    serverStarted: 'server-started',
    pageRenderedLabel: 'page-rendered-label',
    pageRendered: 'page-rendered'
  }

  let document

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
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Service status')
    })

    it('should display the service name', () => {
      let element = document.querySelector(`#${elementIds.serviceNameLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Service:')

      element = document.querySelector(`#${elementIds.serviceName}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('ivory')
    })

    it('should display the version number', () => {
      let element = document.querySelector(`#${elementIds.versionLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Version:')

      element = document.querySelector(`#${elementIds.version}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })

    it('should display the status of ClamAV', () => {
      let element = document.querySelector(`#${elementIds.clamVersionLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('ClamAV version:')

      element = document.querySelector(`#${elementIds.clamVersion}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })

    it('should display the status of the Address Lookup API', () => {
      let element = document.querySelector(`#${elementIds.addressLookupLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Address lookup enabled:')

      element = document.querySelector(`#${elementIds.addressLookup}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })

    it('should display the date/time that the server started', () => {
      let element = document.querySelector(`#${elementIds.serverStartedLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Server started:')

      element = document.querySelector(`#${elementIds.serverStarted}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })

    it('should display the date/time that the page was rendered', () => {
      let element = document.querySelector(`#${elementIds.pageRenderedLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Page rendered:')

      element = document.querySelector(`#${elementIds.pageRendered}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element).length > 0).toBeTruthy()
    })
  })
})
