'use strict'

const os = require('os')

module.exports = [
  {
    method: 'GET',
    path: '/assets/all.js',
    handler: {
      file: 'node_modules/govuk-frontend/govuk/all.js'
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
        path: [
          // TODO paramaterise this
          // '/var/folders/hf/vwnf4tvs7vxczdwf_c5tp8v80000gn/T',
          os.tmpdir(),
          'server/public/static',
          'server/public/build',
          'node_modules/govuk-frontend/govuk/assets'
        ]
      }
    }
  }
]
