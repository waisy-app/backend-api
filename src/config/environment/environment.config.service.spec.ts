import {EnvironmentConfigService} from './environment.config.service'

describe(EnvironmentConfigService.name, () => {
  beforeEach(() => {
    process.env['NODE_ENV'] = 'test'
    process.env['APP_NAME'] = 'TestApp'
  })

  afterEach(() => {
    delete process.env['NODE_ENV']
    delete process.env['APP_NAME']
  })

  it('should correctly detect development environment', () => {
    process.env['NODE_ENV'] = 'development'
    expect(EnvironmentConfigService.isDevelopment).toBe(true)
    expect(EnvironmentConfigService.isTest).toBe(false)
  })

  it('should correctly detect production environment', () => {
    process.env['NODE_ENV'] = 'production'
    expect(EnvironmentConfigService.isDevelopment).toBe(false)
    expect(EnvironmentConfigService.isTest).toBe(false)
  })

  it('should correctly detect test environment', () => {
    process.env['NODE_ENV'] = 'test'
    expect(EnvironmentConfigService.isDevelopment).toBe(false)
    expect(EnvironmentConfigService.isTest).toBe(true)
  })

  it('should return correct app name', () => {
    expect(EnvironmentConfigService.appName).toBe('TestApp')
  })

  it('should return default app name if not set in environment', () => {
    delete process.env['APP_NAME']
    expect(EnvironmentConfigService.appName).toBe('NEST')
  })
})
