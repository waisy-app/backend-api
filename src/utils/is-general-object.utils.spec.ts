import {isGeneralObject} from './is-general-object.utils'

describe('isGeneralObject', () => {
  it('should return true for an object', () => {
    const result = isGeneralObject({key: 'value'})
    expect(result).toBe(true)
  })

  it('should return false for a null value', () => {
    const result = isGeneralObject(null)
    expect(result).toBe(false)
  })

  it('should return true for an array', () => {
    const result = isGeneralObject(['value'])
    expect(result).toBe(true)
  })

  it('should return false for a string', () => {
    const result = isGeneralObject('value')
    expect(result).toBe(false)
  })

  it('should return false for a number', () => {
    const result = isGeneralObject(123)
    expect(result).toBe(false)
  })

  it('should return false for a boolean', () => {
    const result = isGeneralObject(true)
    expect(result).toBe(false)
  })

  it('should return false for undefined', () => {
    const result = isGeneralObject(undefined)
    expect(result).toBe(false)
  })
})
