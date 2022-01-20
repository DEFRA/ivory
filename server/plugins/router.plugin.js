'use strict'

import * as constants from '../utils/constants.js'
const { Paths } = constants
import homeRoute from '../routes/home.route.js'
import publicRoute from '../routes/public.route.js'

import { awaitMapAllEntries, FORCE_SEQUENTIAL_MODULE_IMPORT } from '@stilt/util'
// `sequential` option is a workaround due to a bug when using Jest with native ES Modules
// See https://github.com/facebook/jest/issues/11434

const getPath = (path) => `../routes${path}.route.js`

// let processAll = await Promise.all(Object.values(Paths).map(async path => {
// Fix for Jest: Issue described on 
// https://github.com/facebook/jest/issues/11434
let processAll = awaitMapAllEntries(Object.values(Paths), async path => {
  let obj = await import(getPath(path))
  let webLocation = obj.default
  return webLocation
},FORCE_SEQUENTIAL_MODULE_IMPORT)


const allRoutes = await processAll
const routes = [].concat(
  homeRoute,
  publicRoute,
  ...allRoutes
)

export const plugin = {
  plugin: {
    name: 'router',
    register: server => {
      server.route(routes)
    }
  }
}

export default plugin