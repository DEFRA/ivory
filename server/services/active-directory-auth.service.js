'use strict'

const msal = require('@azure/msal-node')

const config = require('../utils/config')

module.exports = class ActiveDirectoryAuthService {
  static async getToken () {
    // Retaining for backwards compatibility of code, the getToken function gets a token for the Dataverse
    return this.getTokenForDataverse()
  }

  static async getTokenForDataverse () {
    return this._getTokenForResource(config.dataverseResource)
  }

  static async getTokenForAddressLookup () {
    return this._getTokenForResource(config.addressLookupResource)
  }

  static async _getTokenForResource (resource) {
    const msalConfig = {
      auth: {
        clientId: config.dataverseClientId,
        authority: `${config.dataverseAuthorityHostUrl}/${config.dataverseTenant}`,
        clientSecret: config.dataverseClientSecret
      }
    }

    const cca = new msal.ConfidentialClientApplication(msalConfig)

    const clientCredentialRequest = {
      scopes: [resource + '/.default']
    }

    try {
      const tokenResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest)
      const token = tokenResponse.accessToken
      if (!token) {
        throw new Error(`Error obtaining Active Directory auth token: ${JSON.stringify(tokenResponse)}`)
      }
      return token
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }
}
