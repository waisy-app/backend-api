import {ValidationError} from 'class-validator'
import {ValidationException} from './validation.exception'

describe('ValidationException', () => {
  let validationException: ValidationException
  let error: ValidationError

  beforeEach(() => {
    error = new ValidationError()
    error.property = 'TestProperty'
    error.constraints = {TestConstraint: 'TestMessage'}
    validationException = new ValidationException(error)
  })

  it('should create an instance of ValidationException', () => {
    expect(validationException).toBeInstanceOf(ValidationException)
  })

  it('should set the property name to ValidationException', () => {
    expect(validationException.name).toEqual('ValidationException')
  })

  it('should correctly format error messages when a single error is passed', () => {
    const expectedMessage = 'TestProperty: TestMessage'
    expect(validationException.message).toEqual(expectedMessage)
  })

  it('should correctly format error messages when multiple errors are passed', () => {
    const secondError = new ValidationError()
    secondError.property = 'SecondTestProperty'
    secondError.constraints = {SecondTestConstraint: 'SecondTestMessage'}

    validationException = new ValidationException([error, secondError])
    const expectedMessage = '[TestProperty: TestMessage], [SecondTestProperty: SecondTestMessage]'
    expect(validationException.message).toEqual(expectedMessage)
  })
})
