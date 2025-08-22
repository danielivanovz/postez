// Test setup file for Bun
// This file is preloaded before running tests

import { beforeAll, afterAll } from 'bun:test'

// Global test setup
beforeAll(() => {
  console.log('Setting up tests...')
})

// Global test teardown
afterAll(() => {
  console.log('Cleaning up tests...')
})

// Mock console methods for cleaner test output
const originalConsoleInfo = console.info
const originalConsoleError = console.error

// Store original methods for restoration
export const restoreConsole = () => {
  console.info = originalConsoleInfo
  console.error = originalConsoleError
}

// Mock console methods for tests
export const mockConsole = () => {
  console.info = () => {}
  console.error = () => {}
}
