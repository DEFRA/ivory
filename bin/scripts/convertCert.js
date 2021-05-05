'use strict'

/**
 * This script will convert a PFX certificate into a Base64 string that can be used
 * as the environment variable ADDRESS_LOOKUP_PFX_CERT instead of the certificate path/file.
 * */
const fs = require('fs')

// Enter the path/name of your certificate
const buff = fs.readFileSync('./the-name-of-your-cert.pfx')
const base64data = buff.toString('base64')

console.log('Certificate converted to base 64 is:\n\n' + base64data)
