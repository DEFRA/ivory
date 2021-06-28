'use strict'

const joi = require('joi')

// Load application configuration using Dotenv
// (see https://www.npmjs.com/package/dotenv)
require('dotenv').config()

const envs = ['development', 'test', 'production']

const getBoolean = value => {
  return String(value).toLowerCase() === 'true'
}

// Define config schema
const schema = joi.object().keys({
  env: joi
    .string()
    .valid(...envs)
    .default(envs[0]),
  serviceHost: joi.string(),
  servicePort: joi.number().default(3000),
  serviceName: joi.string().default('No service name in .env'),
  logLevel: joi.string().default('warn'),
  requestTimeout: joi.number().default(120000),
  maximumFileSize: joi.number().default(32),
  redisHost: joi.string().default('127.0.0.1'),
  redisPort: joi.number().default(6379),
  redisPassword: joi.string(),
  serviceApiEnabled: joi
    .bool()
    .valid(true, false)
    .default(false),
  serviceApiHost: joi.string().default('http://127.0.0.1'),
  serviceApiPort: joi.number().default(3010),
  addressLookupEnabled: joi
    .bool()
    .valid(true, false)
    .default(false),
  addressLookupUrl: joi.string().default('http://some-url'),
  addressLookupPassphrase: joi.string(),
  addressLookupPfxCert: joi.string(),
  cookieValidationPassword: joi
    .string()
    .default('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  paymentUrl: joi.string(),
  paymentApiKey: joi.string(),
  paymentAmountBandA: joi.number().default(2000),
  paymentAmountBandB: joi.number().default(25000),
  useBasicAuth: joi.bool().default(false),
  basicAuthPassword: joi.string()
})

// Build config
const config = {
  env: process.env.NODE_ENV,
  serviceHost: process.env.SERVICE_HOST,
  servicePort: process.env.SERVICE_PORT,
  serviceName: process.env.SERVICE_NAME,
  logLevel: process.env.LOG_LEVEL,
  requestTimeout: process.env.REQUEST_TIMEOUT,
  maximumFileSize: process.env.MAXIMUM_FILE_SIZE,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  serviceApiEnabled: process.env.SERVICE_API_ENABLED,
  serviceApiHost: process.env.SERVICE_API_HOST,
  serviceApiPort: process.env.SERVICE_API_PORT,
  addressLookupEnabled: process.env.ADDRESS_LOOKUP_ENABLED,
  addressLookupUrl: process.env.ADDRESS_LOOKUP_URL,
  addressLookupPassphrase: process.env.ADDRESS_LOOKUP_PASSPHRASE,
  addressLookupPfxCert: process.env.ADDRESS_LOOKUP_PFX_CERT,
  cookieValidationPassword: process.env.COOKIE_VALIDATION_PASSWORD,
  paymentUrl: process.env.PAYMENT_URL || 'http://some-url',
  paymentApiKey: process.env.PAYMENT_API_KEY || '',
  paymentAmountBandA: process.env.PAYMENT_AMOUNT_BAND_A,
  paymentAmountBandB: process.env.PAYMENT_AMOUNT_BAND_B,
  useBasicAuth: getBoolean(process.env.USE_BASIC_AUTH),
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
