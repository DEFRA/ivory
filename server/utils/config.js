'use strict'

// (see https://www.npmjs.com/package/dotenv)
require('dotenv').config()

const joi = require('joi')
const envs = ['development', 'test', 'production']

const getBoolean = value => String(value).toLowerCase() === 'true'

const defaultUrl = 'http://some-url'

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
  maximumFileSize: joi.number().default(30),
  redisHost: joi.string(),
  redisPort: joi.number(),
  redisPassword: joi.string(),
  dataverseAuthorityHostUrl: joi.string().default(defaultUrl),
  dataverseTenant: joi.string(),
  dataverseClientId: joi.string(),
  dataverseClientSecret: joi.string(),
  dataverseResource: joi.string().default(defaultUrl),
  dataverseApiEndpoint: joi.string(),
  redisUseTls: joi.bool(),
  addressLookupEnabled: joi
    .bool()
    .valid(true, false)
    .default(false),
  addressLookupUrl: joi.string().default(defaultUrl),
  addressLookupPassphrase: joi.string(),
  addressLookupPfxCert: joi.string(),
  cookieTimeout: joi.number(),
  cookieValidationPassword: joi
    .string()
    .default('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  govNotifyKey: joi.string(),
  govNotifyTemplateIdConfirmSection2: joi.string(),
  govNotifyTemplateIdConfirmSection10: joi.string(),
  paymentUrl: joi.string().default(defaultUrl),
  paymentApiKey: joi.string(),
  paymentAmountBandA: joi.number().default(2000),
  paymentAmountBandB: joi.number().default(25000),
  useBasicAuth: joi.bool().valid(true, false)
})

// Build config
const config = {
  env: process.env.NODE_ENV,
  serviceHost: process.env.SERVICE_HOST,
  servicePort: process.env.SERVICE_PORT,
  serviceName: process.env.SERVICE_NAME,
  logLevel: process.env.LOG_LEVEL,
  requestTimeout: process.env.REQUEST_TIMEOUT,
  maximumFileSize: process.env.PHOTO_UPLOAD_PHOTO_MAX_MB,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  dataverseAuthorityHostUrl: process.env.DATAVERSE_AUTHORITY_HOST_URL,
  dataverseTenant: process.env.DATAVERSE_TENANT,
  dataverseClientId: process.env.DATAVERSE_CLIENT_ID,
  dataverseClientSecret: process.env.DATAVERSE_CLIENT_SECRET,
  dataverseResource: process.env.DATAVERSE_RESOURCE,
  dataverseApiEndpoint: process.env.DATAVERSE_API_ENDPOINT,
  redisUseTls: process.env.REDIS_USE_TLS,
  addressLookupEnabled: process.env.ADDRESS_LOOKUP_ENABLED,
  addressLookupUrl: process.env.ADDRESS_LOOKUP_URL,
  addressLookupPassphrase: process.env.ADDRESS_LOOKUP_PASSPHRASE,
  addressLookupPfxCert: process.env.ADDRESS_LOOKUP_PFX_CERT,
  cookieTimeout: process.env.COOKIE_TIMEOUT,
  cookieValidationPassword: process.env.COOKIE_VALIDATION_PASSWORD,
  govNotifyKey: process.env.GOV_NOTIFY_KEY,
  govNotifyTemplateIdConfirmSection2:
    process.env.GOV_NOTIFY_TEMPLATE_ID_CONFIRM_SECTION_2,
  govNotifyTemplateIdConfirmSection10:
    process.env.GOV_NOTIFY_TEMPLATE_ID_CONFIRM_SECTION_10,
  paymentUrl: process.env.PAYMENT_URL,
  paymentApiKey: process.env.PAYMENT_API_KEY,
  paymentAmountBandA: process.env.PAYMENT_AMOUNT_BAND_A,
  paymentAmountBandB: process.env.PAYMENT_AMOUNT_BAND_B,
  useBasicAuth: getBoolean(process.env.USE_BASIC_AUTH || false)
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
