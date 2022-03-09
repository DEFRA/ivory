'use strict'

// (see https://www.npmjs.com/package/dotenv)
require('dotenv').config()

const joi = require('joi')
const envs = ['development', 'test', 'production']

const getBoolean = booleanString =>
  String(booleanString).toLowerCase() === 'true'

const defaultUrl = 'http://some-url'

// Define config schema
const schema = joi.object().keys({
  env: joi
    .string()
    .valid(...envs)
    .default(envs[0]),
  serviceHost: joi.string(),
  servicePort: joi.number().default(3000),
  serviceName: joi
    .string()
    .default('Declare elephant ivory you intend to sell or hire out'),
  logLevel: joi.string().default('warn'),
  requestTimeout: joi.number(),
  maximumFileSize: joi.number().default(10),
  redisHost: joi.string(),
  redisPort: joi.number(),
  redisPassword: joi.string(),
  azureStorageAccount: joi.string(),
  azureStorageAccountKey: joi.string(),
  azureStorageAccountUrl: joi.string(),
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
  cookieTimeout: joi.number().default(86400000),
  cookieValidationPassword: joi
    .string()
    .default('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  govNotifyKey: joi.string(),
  govNotifyTemplateSection10ApplicantConfirmation: joi.string(),
  govNotifyTemplateSection10OwnerConfirmation: joi.string(),
  govNotifyTemplateSection2ApplicantConfirmation: joi.string(),
  govNotifyTemplateSection2OwnerEmailThirdParty: joi.string(),
  govNotifyTemplateSection2OwnerEmailThirdPartyResale: joi.string(),
  govNotifyTemplateSection2ResaleApplicantConfirmation: joi.string(),
  paymentUrl: joi.string().default(defaultUrl),
  paymentApiKey: joi.string(),
  paymentAmountBandA: joi.number().default(2000),
  paymentAmountBandB: joi.number().default(25000),
  googleAnalyticsId: joi.string().default('UA-YYYYYY-YY'),
  appInsightsInstrumentationKey: joi.string(),
  clamscanBinaries: joi.string().default('/usr/bin/'),
  clamscanPreference: joi.string().default('clamdscan'),
  clamscanDebug: joi.bool(),
  disableAntimalware: joi.bool(),
  useBasicAuth: joi.bool().valid(true, false),
  defraUsername: joi.string(),
  defraPassword: joi.string(),
  performanceTestMode: joi.bool()
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
  azureStorageAccount: process.env.AZURE_STORAGE_ACCOUNT,
  azureStorageAccountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  azureStorageAccountUrl: process.env.AZURE_STORAGE_ACCOUNT_URL,
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
  govNotifyTemplateSection10ApplicantConfirmation:
    process.env.GOV_NOTIFY_TEMPLATE_SECTION_10_APPLICANT_CONFIRMATION,
  govNotifyTemplateSection10OwnerConfirmation:
    process.env.GOV_NOTIFY_TEMPLATE_SECTION_10_OWNER_CONFIRMATION,
  govNotifyTemplateSection2ApplicantConfirmation:
    process.env.GOV_NOTIFY_TEMPLATE_SECTION_2_APPLICANT_CONFIRMATION,
  govNotifyTemplateSection2OwnerEmailThirdParty:
    process.env.GOV_NOTIFY_TEMPLATE_SECTION_2_OWNER_EMAIL_THIRD_PARTY,
  govNotifyTemplateSection2OwnerEmailThirdPartyResale:
    process.env.GOV_NOTIFY_TEMPLATE_SECTION_2_OWNER_EMAIL_THIRD_PARTY_RESALE,
  govNotifyTemplateSection2ResaleApplicantConfirmation:
    process.env.GOV_NOTIFY_TEMPLATE_SECTION_2_RESALE_APPLICANT_CONFIRMATION,
  paymentUrl: process.env.PAYMENT_URL,
  paymentApiKey: process.env.PAYMENT_API_KEY,
  paymentAmountBandA: process.env.PAYMENT_AMOUNT_BAND_A,
  paymentAmountBandB: process.env.PAYMENT_AMOUNT_BAND_B,
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  appInsightsInstrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  clamscanBinaries: process.env.CLAMSCAN_BINARIES,
  clamscanPreference: process.env.CLAMSCAN_PREFERENCE,
  clamscanDebug: process.env.CLAMSCAN_DEBUG,
  disableAntimalware: process.env.DISABLE_ANTIMALWARE,
  useBasicAuth: getBoolean(process.env.USE_BASIC_AUTH || false),
  defraUsername: process.env.DEFRA_USERNAME,
  defraPassword: process.env.DEFRA_PASSWORD,
  performanceTestMode: process.env.PERFORMANCE_TEST_MODE
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
