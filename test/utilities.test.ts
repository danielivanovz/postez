import { test, expect, describe, beforeAll, afterAll } from 'bun:test'
import { sanitizeName, generateEnumMap, defaultTypesSchema } from '../src/utilities'
import { IEnumSchema } from '../src/types'
import { mockConsole, restoreConsole } from './setup'

describe('utilities', () => {
  describe('sanitizeName', () => {
    test('should convert snake_case to PascalCase with prefix', () => {
      const result = sanitizeName('user_profile', 'Table')
      expect(result).toBe('TableUserProfile')
    })

    test('should convert kebab-case to PascalCase with prefix', () => {
      const result = sanitizeName('user-profile', 'Table')
      expect(result).toBe('TableUserProfile')
    })

    test('should handle mixed separators', () => {
      const result = sanitizeName('user_profile-data', 'Table')
      expect(result).toBe('TableUserProfileData')
    })

    test('should work without prefix', () => {
      const result = sanitizeName('user_profile')
      expect(result).toBe('UserProfile')
    })

    test('should handle single word', () => {
      const result = sanitizeName('user', 'Table')
      expect(result).toBe('TableUser')
    })

    test('should handle custom splitters', () => {
      const result = sanitizeName('user.profile', 'Table', ['\\.'])
      expect(result).toBe('TableUserProfile')
    })
  })

  describe('generateEnumMap', () => {
    test('should create map from enum schema array', () => {
      const enums: IEnumSchema[] = [
        { enum_name: 'status', enum_value: 'active,inactive,pending' },
        { enum_name: 'role', enum_value: 'admin,user,guest' },
      ]

      const result = generateEnumMap(enums)

      expect(result.get('status')).toEqual(['active', 'inactive', 'pending'])
      expect(result.get('role')).toEqual(['admin', 'user', 'guest'])
      expect(result.size).toBe(2)
    })

    test('should handle empty array', () => {
      const result = generateEnumMap([])
      expect(result.size).toBe(0)
    })

    test('should handle single enum value', () => {
      const enums: IEnumSchema[] = [{ enum_name: 'status', enum_value: 'active' }]

      const result = generateEnumMap(enums)
      expect(result.get('status')).toEqual(['active'])
    })
  })

  describe('defaultTypesSchema', () => {
    test('should include common PostgreSQL types', () => {
      expect(defaultTypesSchema.string).toContain('varchar')
      expect(defaultTypesSchema.string).toContain('text')
      expect(defaultTypesSchema.string).toContain('uuid')

      expect(defaultTypesSchema.number).toContain('int4')
      expect(defaultTypesSchema.number).toContain('float8')
      expect(defaultTypesSchema.number).toContain('numeric')

      expect(defaultTypesSchema.boolean).toContain('bool')
      expect(defaultTypesSchema.boolean).toContain('boolean')

      expect(defaultTypesSchema.Date).toContain('timestamp')
      expect(defaultTypesSchema.Date).toContain('timestamptz')
      expect(defaultTypesSchema.Date).toContain('date')
    })

    test('should include array types', () => {
      expect(defaultTypesSchema['Array<string>']).toContain('_text')
      expect(defaultTypesSchema['Array<number>']).toContain('_int4')
      expect(defaultTypesSchema['Array<boolean>']).toContain('_bool')
    })

    test('should include custom types', () => {
      expect(defaultTypesSchema.CustomTypes).toHaveLength(1)
      expect(defaultTypesSchema.CustomTypes[0].name).toBe('point')
      expect(defaultTypesSchema.CustomTypes[0].type).toBe('Coordinates')
    })
  })
})
