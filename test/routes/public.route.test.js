'use strict'

const routes = require('../../server/routes/public.route')
const os = require('os')

describe('Public Routes', () => {
  it('should define a route to serve the govuk JavaScript for the frontend /assets/all.js', () => {
    const route = routes.find(r => r.path === '/assets/all.js')
    expect(route).toBeDefined()
    expect(route.method).toBe('GET')
  })

  it('should define a route to provide the favicon on the root path for browsers that request this /favicon.ico', () => {
    const route = routes.find(r => r.path === '/favicon.ico')
    expect(route).toBeDefined()
    expect(route.method).toBe('GET')
  })

  it('should define a route for static assets /assets/{path*}', () => {
    const route = routes.find(r => r.path === '/assets/{path*}')
    expect(route).toBeDefined()
    expect(route.method).toBe('GET')
  })

  it('should serve application static assets', () => {
    const route = routes.find(r => r.path === '/assets/{path*}')
    expect(route.handler.directory.path).toContain('server/public/static')
    expect(route.handler.directory.path).toContain('server/public/build')
    expect(route.handler.directory.path).toContain('server/public/js')
  })

  it('should serve govuk static assets', () => {
    const route = routes.find(r => r.path === '/assets/{path*}')
    expect(route.handler.directory.path).toContain('node_modules/govuk-frontend/govuk/assets')
  })

  it('should serve the styling for the iSpinner', () => {
    const route = routes.find(r => r.path === '/assets/{path*}')
    expect(route.handler.directory.path).toContain('node_modules/ispinner.css')
  })

  it('should serve uploaded images the user has uploaded from the temp directory', () => {
    const route = routes.find(r => r.path === '/assets/{path*}')
    expect(route.handler.directory.path).toContain(os.tmpdir())
  })
})
