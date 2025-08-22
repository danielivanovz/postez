import { test, expect, describe, beforeAll, afterAll } from 'bun:test';
import { parseTypesSchema, enumType, typeParser } from '../src/parsers/datatypes';
import { parseEnumTypes } from '../src/parsers/enums';
import { sanitizeName } from '../src/utilities';
import { IEnumSchema, ITypesSchema, ICustomType } from '../src/types';
import { defaultTypesSchema } from '../src/utilities';
import { mockConsole, restoreConsole } from './setup';

describe('Real PostgreSQL to TypeScript type conversion', () => {
  describe('parseTypesSchema - converts schema config to lookup map', () => {
    test('should create correct PostgreSQL -> TypeScript mapping', () => {
      const schema: Partial<ITypesSchema> = {
        string: ['varchar', 'text', 'uuid'],
        number: ['int4', 'int8', 'numeric'],
        boolean: ['bool', 'boolean'],
        Date: ['timestamp', 'timestamptz']
      };

      const result = parseTypesSchema(schema);

      // Test string types
      expect(result.varchar).toBe('string');
      expect(result.text).toBe('string');
      expect(result.uuid).toBe('string');
      
      // Test number types  
      expect(result.int4).toBe('number');
      expect(result.int8).toBe('number');
      expect(result.numeric).toBe('number');
      
      // Test boolean types
      expect(result.bool).toBe('boolean');
      expect(result.boolean).toBe('boolean');
      
      // Test Date types
      expect(result.timestamp).toBe('Date');
      expect(result.timestamptz).toBe('Date');
    });

    test('should handle custom types like PostGIS point', () => {
      const customType: ICustomType = {
        name: 'point',
        type: 'Coordinates',
        definition: 'export interface Coordinates { x: number; y: number; }'
      };

      const schema: Partial<ITypesSchema> = {
        string: ['varchar'],
        CustomTypes: [customType]
      };

      const result = parseTypesSchema(schema);
      expect(result.point).toBe('Coordinates');
      expect(result.varchar).toBe('string');
    });

    test('should work with the default schema used in production', () => {
      const result = parseTypesSchema(defaultTypesSchema);
      
      // Test some key mappings from the default schema
      expect(result.varchar).toBe('string');
      expect(result.int4).toBe('number');
      expect(result.jsonb).toBe('Object');
      expect(result._text).toBe('Array<string>');
      expect(result.point).toBe('Coordinates'); // From default custom types
    });
  });

  describe('enumType - handles PostgreSQL enum types', () => {
    beforeAll(() => mockConsole());
    afterAll(() => restoreConsole());

    test('should convert enum to TypeScript enum type', () => {
      const enumMap = new Map([
        ['user_status', ['active', 'inactive', 'pending']]
      ]);

      const result = enumType(enumMap, 'user_status');
      expect(result).toBe('EUserStatus');
    });

    test('should handle array enum types with underscore prefix', () => {
      const enumMap = new Map([
        ['priority', ['high', 'medium', 'low']]
      ]);

      const result = enumType(enumMap, '_priority');
      expect(result).toBe('Array<EPriority>');
    });

    test('should properly handle array enum names with complex names', () => {
      const enumMap = new Map([
        ['user_role_type', ['admin', 'user']]
      ]);

      const result = enumType(enumMap, '_user_role_type');
      expect(result).toBe('Array<EUserRoleType>');
    });

    test('should return unknown for non-existent enums', () => {
      const enumMap = new Map();
      const result = enumType(enumMap, 'nonexistent_enum');
      expect(result).toBe('unknown');
    });
  });

  describe('typeParser - the main type resolution function', () => {
    test('should resolve PostgreSQL types to TypeScript types', () => {
      const schema = {
        varchar: 'string',
        int4: 'number',
        bool: 'boolean',
        jsonb: 'Object'
      };
      const enumMap = new Map();

      expect(typeParser('varchar', enumMap, schema)).toBe('string');
      expect(typeParser('int4', enumMap, schema)).toBe('number');
      expect(typeParser('bool', enumMap, schema)).toBe('boolean');
      expect(typeParser('jsonb', enumMap, schema)).toBe('Object');
    });

    test('should fallback to enum resolution for unknown types', () => {
      const schema = { varchar: 'string' };
      const enumMap = new Map([
        ['order_status', ['pending', 'completed', 'cancelled']]
      ]);

      const result = typeParser('order_status', enumMap, schema);
      expect(result).toBe('EOrderStatus');
    });

    test('should return unknown for completely unknown types', () => {
      const schema = {};
      const enumMap = new Map();

      const result = typeParser('some_unknown_type', enumMap, schema);
      expect(result).toBe('unknown');
    });
  });
});

describe('PostgreSQL enum generation', () => {
  describe('parseEnumTypes - generates TypeScript enums from PostgreSQL enums', () => {
    test('should generate valid TypeScript enum from PostgreSQL enum', async () => {
      const enums: IEnumSchema[] = [
        { enum_name: 'user_status', enum_value: 'active,inactive,pending' }
      ];

      const result = await parseEnumTypes(enums);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('export enum EUserStatus');
      expect(result[0]).toContain('"active" = \'active\'');
      expect(result[0]).toContain('"inactive" = \'inactive\'');
      expect(result[0]).toContain('"pending" = \'pending\'');
    });

    test('should handle enum values with spaces - keys safe, values original', async () => {
      const enums: IEnumSchema[] = [
        { enum_name: 'priority_level', enum_value: 'high priority, medium priority, low priority' }
      ];

      const result = await parseEnumTypes(enums);

      expect(result[0]).toContain('export enum EPriorityLevel');
      expect(result[0]).toContain('"high_priority" = \'high priority\'');
      expect(result[0]).toContain('"medium_priority" = \'medium priority\'');
      expect(result[0]).toContain('"low_priority" = \'low priority\'');
    });

    test('should handle multiple enums in a single call', async () => {
      const enums: IEnumSchema[] = [
        { enum_name: 'status', enum_value: 'active,inactive' },
        { enum_name: 'role', enum_value: 'admin,user,guest' }
      ];

      const result = await parseEnumTypes(enums);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('export enum EStatus');
      expect(result[1]).toContain('export enum ERole');
    });

    test('should return empty array for no enums', async () => {
      const result = await parseEnumTypes([]);
      expect(result).toHaveLength(0);
    });

    test('should handle special characters in enum values', async () => {
      const enums: IEnumSchema[] = [
        { enum_name: 'special_chars', enum_value: 'with-dash, with_underscore, with.dot' }
      ];

      const result = await parseEnumTypes(enums);

      expect(result[0]).toContain('export enum ESpecialChars');
      expect(result[0]).toContain('"with-dash" = \'with-dash\'');
      expect(result[0]).toContain('"with_underscore" = \'with_underscore\'');
      expect(result[0]).toContain('"with.dot" = \'with.dot\'');
    });
  });
});

describe('Edge cases and error handling', () => {
  describe('sanitizeName edge cases', () => {
    test('should handle empty string', () => {
      expect(sanitizeName('', 'Prefix')).toBe('Prefix');
    });

    test('should handle strings that are only separators', () => {
      expect(sanitizeName('___', 'Table')).toBe('Table');
      expect(sanitizeName('---', 'Interface')).toBe('Interface');
    });

    test('should handle numbers in names', () => {
      expect(sanitizeName('user_v2_table', 'Table')).toBe('TableUserV2Table');
    });

    test('should handle single character names', () => {
      expect(sanitizeName('a', 'E')).toBe('EA');
    });
  });

  describe('parseTypesSchema edge cases', () => {
    test('should handle empty schema', () => {
      const result = parseTypesSchema({});
      expect(Object.keys(result)).toHaveLength(0);
    });

    test('should handle schema with empty arrays', () => {
      const schema = {
        string: [],
        number: ['int4']
      };
      const result = parseTypesSchema(schema);
      expect(result.int4).toBe('number');
      expect(Object.keys(result)).toHaveLength(1);
    });

    test('should handle mixed custom and regular types', () => {
      const schema = {
        string: ['varchar'],
        CustomTypes: [
          { name: 'point', type: 'Point', definition: 'interface Point {}' },
          { name: 'line', type: 'Line', definition: 'interface Line {}' }
        ]
      };
      const result = parseTypesSchema(schema);
      
      expect(result.varchar).toBe('string');
      expect(result.point).toBe('Point');
      expect(result.line).toBe('Line');
    });
  });
});

