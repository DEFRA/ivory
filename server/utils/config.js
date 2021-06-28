'use strict'

const joi = require('joi')

// Load application configuration using Dotenv
// (see https://www.npmjs.com/package/dotenv)
require('dotenv').config()

const envs = ['development', 'test', 'production']

// const getBoolean = value => {
//   return String(value).toLowerCase() === 'true'
// }

// Define config schema
const schema = joi.object().keys({
  env: joi
    .string()
    .valid(...envs)
    .default(envs[0]),
  serviceHost: joi.string(),
  servicePort: joi.number(),
  serviceName: joi.string(),
  logLevel: joi.string().default('warn'),
  requestTimeout: joi.number(),
  maximumFileSize: joi.number(),
  redisHost: joi.string(),
  redisPort: joi.number(),
  redisPassword: joi.string(),
  serviceApiEnabled: joi.bool().valid(true, false),
  serviceApiHost: joi.string(),
  serviceApiPort: joi.number(),
  addressLookupEnabled: joi.bool().valid(true, false),
  addressLookupUrl: joi.string(),
  addressLookupPassphrase: joi.string(),
  addressLookupPfxCert: joi.string(),
  cookieValidationPassword: joi.string(),
  paymentUrl: joi.string(),
  paymentApiKey: joi.string(),
  paymentAmountBandA: joi.number(),
  paymentAmountBandB: joi.number(),
  useBasicAuth: joi.bool(),
  basicAuthPassword: joi.string()
})

// Build config
const config = {
  env: process.env.NODE_ENV,
  serviceHost: process.env.SERVICE_HOST,
  servicePort: process.env.SERVICE_PORT || 3000,
  serviceName: process.env.SERVICE_NAME || 'No service name in .env',
  logLevel: process.env.LOG_LEVEL,
  requestTimeout: process.env.REQUEST_TIMEOUT || 120000,
  maximumFileSize: process.env.MAXIMUM_FILE_SIZE || 32,
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: process.env.REDIS_PORT || 6379,
  redisPassword: process.env.REDIS_PASSWORD,
  serviceApiEnabled: process.env.SERVICE_API_ENABLED,
  serviceApiHost: process.env.SERVICE_API_HOST || 'http://127.0.0.1',
  serviceApiPort: process.env.SERVICE_API_PORT || 3010,
  addressLookupEnabled: process.env.ADDRESS_LOOKUP_ENABLED || false,
  addressLookupUrl: process.env.ADDRESS_LOOKUP_URL || 'http://some-url',
  addressLookupPassphrase: process.env.ADDRESS_LOOKUP_PASSPHRASE,
  addressLookupPfxCert: process.env.ADDRESS_LOOKUP_PFX_CERT,
  cookieValidationPassword:
    process.env.COOKIE_VALIDATION_PASSWORD ||
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  paymentUrl: process.env.PAYMENT_URL || 'http://some-url',
  paymentApiKey: process.env.PAYMENT_API_KEY || 'some-api-key',
  paymentAmountBandA: process.env.PAYMENT_AMOUNT_BAND_A || 2000,
  paymentAmountBandB: process.env.PAYMENT_AMOUNT_BAND_B || 25000,

  // TODO reinstate this
  // useBasicAuth: getBoolean(process.env.USE_BASIC_AUTH || false),
  useBasicAuth: false,

  basicAuthPassword: process.env.BASIC_AUTH_PASSWORD
}

// Validate config
const { error, value } = schema.validate(config)

// Throw if config is invalid
if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

// Add some helper props
value.isDev = value.env === 'development'

module.exports = value
