'use strict'

import os from 'os';

export default [
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
          os.tmpdir(),
          'server/public/static',
          'server/public/build',
          'node_modules/govuk-frontend/govuk/assets'
        ]
      }
    }
  }
];
