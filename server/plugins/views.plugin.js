'use strict'

import path from 'path'
import nunjucks from 'nunjucks'
import config from '../utils/config.js'
import pkg from '../../package.json'
const analyticsAccount = config.analyticsAccount

import hapiVision from '@hapi/vision/lib/index.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const { plugin } = hapiVision;

export const options = {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return context => template.render(context)
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure(
            [
              path.join(options.relativeTo || process.cwd(), options.path),
              'node_modules/govuk-frontend/'
            ],
            {
              autoescape: true,
              watch: false
            }
          )

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !config.isDev,
    context: {
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: config.serviceName,
      pageTitle: `${config.serviceName} - GOV.UK`,
      analyticsAccount: analyticsAccount
    }
  }

export default { plugin, options }
