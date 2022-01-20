import { jest } from '@jest/globals'

jest.setTimeout(5000)

// Note: Fix for problem : Cannot find module '../../server/services/analytics.service.js' from 'jest.setup.js'
// Possibly basepath can be setup with Jest parameters to avoid code changes instead?
// Previously : jest.mock('../../server/services/analytics.service.js')
// New: jest.mock('./server/services/analytics.service.js')
