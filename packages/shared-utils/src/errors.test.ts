import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalError,
} from './errors'

// ---------------------------------------------------------------------------
// SCENARIO-6: Error hierarchy instanceof
// ---------------------------------------------------------------------------
describe('AppError hierarchy', () => {
  it('AppError extends Error', () => {
    const err = new AppError('base', 'TEST_CODE')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
    expect(err.message).toBe('base')
    expect(err.code).toBe('TEST_CODE')
    expect(err.name).toBe('AppError')
    expect(typeof err.stack).toBe('string')
  })

  describe('ValidationError', () => {
    it('sets code and name correctly', () => {
      const err = new ValidationError('invalid input')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(ValidationError)
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.name).toBe('ValidationError')
      expect(err.message).toBe('invalid input')
    })
  })

  describe('NotFoundError', () => {
    it('sets code and name correctly', () => {
      const err = new NotFoundError('order not found')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(NotFoundError)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.name).toBe('NotFoundError')
      expect(err.message).toBe('order not found')
    })
  })

  describe('UnauthorizedError', () => {
    it('sets code and name correctly', () => {
      const err = new UnauthorizedError('missing token')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(UnauthorizedError)
      expect(err.code).toBe('UNAUTHORIZED')
      expect(err.name).toBe('UnauthorizedError')
    })
  })

  describe('ForbiddenError', () => {
    it('sets code and name correctly', () => {
      const err = new ForbiddenError('insufficient permissions')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(ForbiddenError)
      expect(err.code).toBe('FORBIDDEN')
      expect(err.name).toBe('ForbiddenError')
    })
  })

  describe('InternalError', () => {
    it('sets code and name correctly', () => {
      const err = new InternalError('unexpected error')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(InternalError)
      expect(err.code).toBe('INTERNAL_ERROR')
      expect(err.name).toBe('InternalError')
    })
  })

  it('each subclass has a unique code', () => {
    const codes = [
      new ValidationError('a').code,
      new NotFoundError('b').code,
      new UnauthorizedError('c').code,
      new ForbiddenError('d').code,
      new InternalError('e').code,
    ]
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('instanceof works across the entire chain', () => {
    const err = new ForbiddenError('nope')
    expect(err instanceof Error).toBe(true)
    expect(err instanceof AppError).toBe(true)
    expect(err instanceof ForbiddenError).toBe(true)
    // Sibling classes should NOT be instanceof each other
    expect(err instanceof ValidationError).toBe(false)
    expect(err instanceof NotFoundError).toBe(false)
  })
})
