'use strict'

const AdalNode = require('adal-node')

const config = require('../utils/config')

module.exports = class ActiveDirectoryAuthService {
  static async getToken () {
    return new Promise((resolve, reject) => {
      const authorityHostUrl = config.dataverseAuthorityHostUrl
      const tenant = config.dataverseTenant

      const authorityUrl = `${authorityHostUrl}/${tenant}`

      // Application Id of app registered under AAD
      const clientId = config.dataverseClientId

      // Secret generated for app. Read this environment constiable.
      const clientSecret = config.dataverseClientSecret

      // URI that identifies the resource for which the token is valid
      const resource = config.dataverseResource

      const AuthenticationContext = AdalNode.AuthenticationContext
      const context = new AuthenticationContext(authorityUrl)

      context.acquireTokenWithClientCredentials(
        resource,
        clientId,
        clientSecret,
        (err, tokenResponse) => {
          if (err) {
            console.error(err.message)
            reject(err)
          } else {
            const token = tokenResponse.accessToken
            if (token) {
              resolve(token)
            } else {
              const error = new Error(
                `Error obtaining Active Directory auth token: ${JSON.stringify(
                  tokenResponse
                )}`
              )
              console.error(err.message)
              reject(error)
            }
          }
        }
      )
    })
  }
}
