import { test, expect, describe } from 'bun:test'
import { postez } from '../src/index'

describe('postez main function export', () => {
  test('should export a function named postez', () => {
    expect(typeof postez).toBe('function')
    expect(postez.name).toBe('postez')
  })

  test('should be the main entry point function', () => {
    // The function should exist and be callable
    expect(postez).toBeDefined()
    expect(typeof postez).toBe('function')
  })
})
