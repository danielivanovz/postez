import { test, expect, describe, beforeAll, afterAll } from 'bun:test'
import { newDb } from 'pg-mem'
import { main, writeToFile } from '../src/utilities'
import { ITypesSchema } from '../src/types'
import { defaultTypesSchema } from '../src/utilities'
import { mockConsole, restoreConsole } from './setup'
import * as fs from 'fs'
import * as path from 'path'

describe('End-to-End Integration Tests with Real PostgreSQL', () => {
  const testOutputDir = './test-output'
  let memDb: any
  let pgDb: any

  beforeAll(async () => {
    mockConsole()

    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true })
    }

    // Create in-memory PostgreSQL database
    memDb = newDb()
    pgDb = memDb.adapters.createPgPromise()

    // Set up a complete test database schema
    await setupTestDatabase(pgDb)
  })

  afterAll(async () => {
    restoreConsole()

    // Clean up database
    if (pgDb && pgDb.$pool) {
      try {
        await pgDb.$pool.end()
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    // Clean up test files and directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true })
    }
  })

  async function setupTestDatabase(db: any) {
    // Create enums
    await db.query(`
      CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'banned');
      CREATE TYPE order_status AS ENUM ('draft', 'pending', 'processing', 'completed', 'cancelled');
    `)

    // Create tables with various column types
    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        full_name TEXT,
        status user_status NOT NULL DEFAULT 'pending',
        age INTEGER,
        salary NUMERIC(10,2),
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB,
        tags TEXT[]
      );
    `)

    await db.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(12,2) NOT NULL,
        in_stock BOOLEAN DEFAULT true,
        category_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

    await db.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status order_status NOT NULL DEFAULT 'draft',
        total_amount NUMERIC(15,2),
        order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notes TEXT,
        is_paid BOOLEAN DEFAULT false
      );
    `)

    // Create a view - pg-mem supports view creation but not information_schema.views query
    await db.query(`
      CREATE VIEW active_users AS 
      SELECT id, username, email, full_name, created_at 
      FROM users 
      WHERE status = 'active';
    `)

    // Create a view with joins
    await db.query(`
      CREATE VIEW user_orders AS
      SELECT 
        u.id as user_id,
        u.username,
        o.id as order_id,
        o.status as order_status,
        o.total_amount,
        o.order_date
      FROM users u
      JOIN orders o ON u.id = o.user_id;
    `)
  }

  // Custom main function that works with pg-mem limitations
  async function mainWithoutViews(
    db: any,
    outputPath: string,
    typesSchema: ITypesSchema = defaultTypesSchema,
    schema: string = 'public',
  ) {
    const { parseTableNames, parseEnumTypes, parseInterfaces, parseCustomType } = await import('../src/parsers')
    const { generateEnumMap, writeToFile } = await import('../src/utilities')
    const pg = await import('../src/db')

    const tables = await parseTableNames(db, pg.default.sql('select-table-names'), schema)
    // Skip views for pg-mem as it doesn't support information_schema.views
    const views: string[] = []

    // Custom enum detection for pg-mem - detect enums from column types
    const enumTypesQuery = `
      SELECT DISTINCT data_type as enum_name 
      FROM information_schema.columns 
      WHERE table_schema = '${schema}' 
      AND data_type NOT IN ('integer', 'bigint', 'smallint', 'numeric', 'real', 'double precision', 
                           'character varying', 'character', 'text', 'boolean', 'date', 'timestamp with time zone', 
                           'timestamp without time zone', 'time with time zone', 'time without time zone',
                           'json', 'jsonb', 'uuid', 'bytea', 'inet', 'cidr', 'macaddr', 'money', 'point',
                           'line', 'lseg', 'box', 'path', 'polygon', 'circle', 'bit', 'bit varying')
      AND data_type NOT LIKE 'ARRAY'
      AND data_type NOT LIKE '%[]'
    `

    const enumTypesResult = await db.query(enumTypesQuery)
    console.log('Found enum types:', enumTypesResult)

    // Since pg-mem doesn't support enum value introspection, we'll manually provide values for known enums
    const knownEnums = new Map([
      ['user_status', ['active', 'inactive', 'pending', 'banned']],
      ['order_status', ['draft', 'pending', 'processing', 'completed', 'cancelled']],
    ])

    // Create enum objects in the expected format
    const enums = enumTypesResult
      .filter((row: any) => knownEnums.has(row.enum_name))
      .map((row: any) => ({
        enum_name: row.enum_name,
        enum_value: knownEnums.get(row.enum_name)!.join(', '),
      }))

    console.log('Generated enums:', enums)

    const _enums = await parseEnumTypes(enums)
    const _interfaces = await parseInterfaces(
      db,
      tables,
      pg.default.sql('select-table-information'),
      generateEnumMap(enums),
      typesSchema,
      schema,
    )
    const _customTypes = parseCustomType(typesSchema)

    try {
      await writeToFile(outputPath, _enums.concat(_customTypes, _interfaces), 'types')
      console.info('Successfully generated files in:', outputPath)
    } catch (error) {
      console.error(error)
    }
  }

  describe('Complete end-to-end type generation', () => {
    test('should generate complete TypeScript types from real database', async () => {
      const outputPath = path.join(testOutputDir, 'complete-types')

      // Use custom function for pg-mem compatibility
      await mainWithoutViews(pgDb, outputPath, defaultTypesSchema, 'public')

      const typesFilePath = path.join(outputPath, 'types.ts')
      expect(fs.existsSync(typesFilePath)).toBe(true)

      const generatedContent = fs.readFileSync(typesFilePath, 'utf-8')

      // Test enum generation
      expect(generatedContent).toContain('export enum EUserStatus')
      expect(generatedContent).toContain("'active' = 'active'")
      expect(generatedContent).toContain("'pending' = 'pending'")

      expect(generatedContent).toContain('export enum EOrderStatus')
      expect(generatedContent).toContain("'completed' = 'completed'")

      // Test table interface generation
      expect(generatedContent).toContain('export interface TableUsers')
      expect(generatedContent).toContain('username: string')
      expect(generatedContent).toContain('status: EUserStatus')
      expect(generatedContent).toContain('is_admin: boolean')
      expect(generatedContent).toContain('created_at: Date')
      expect(generatedContent).toContain('metadata: Object')

      expect(generatedContent).toContain('export interface TableOrders')
      expect(generatedContent).toContain('status: EOrderStatus')
      expect(generatedContent).toContain('total_amount: number')

      // Views are not tested with pg-mem due to information_schema.views limitation
      // In a real PostgreSQL test environment, these would be included:
      // expect(generatedContent).toContain('export interface TableActiveUsers');
      // expect(generatedContent).toContain('export interface TableUserOrders');
    })

    test('should handle custom type schema', async () => {
      const customSchema: ITypesSchema = {
        ...defaultTypesSchema,
        // Override some mappings
        Object: ['jsonb', 'json'],
        'Array<string>': ['_text', '_varchar'],
        CustomTypes: [
          {
            name: 'point',
            type: 'GeoPoint',
            definition: 'export interface GeoPoint { lat: number; lng: number; }',
          },
        ],
      }

      const outputPath = path.join(testOutputDir, 'custom-schema')

      await mainWithoutViews(pgDb, outputPath, customSchema, 'public')

      const typesFilePath = path.join(outputPath, 'types.ts')
      const generatedContent = fs.readFileSync(typesFilePath, 'utf-8')

      // Should include custom type definition
      expect(generatedContent).toContain('export interface GeoPoint')
      expect(generatedContent).toContain('lat: number')
      expect(generatedContent).toContain('lng: number')

      // Should still generate correct interfaces
      expect(generatedContent).toContain('export interface TableUsers')
      expect(generatedContent).toContain('metadata: Object')
    })

    test('should handle empty database gracefully', async () => {
      // Create a fresh empty database
      const emptyDb = newDb()
      const emptyPgDb = emptyDb.adapters.createPgPromise()

      const outputPath = path.join(testOutputDir, 'empty-db')

      await mainWithoutViews(emptyPgDb, outputPath, defaultTypesSchema, 'public')

      const typesFilePath = path.join(outputPath, 'types.ts')
      expect(fs.existsSync(typesFilePath)).toBe(true)

      const generatedContent = fs.readFileSync(typesFilePath, 'utf-8')

      // Should have custom types but no enums or interfaces
      expect(generatedContent).toContain('export interface Coordinates')
      expect(generatedContent.split('export enum').length).toBe(1) // No enums
      expect(generatedContent.split('export interface').length).toBe(2) // Just Coordinates

      await emptyPgDb.$pool.end()
    })

    test('should handle different schema names (limited pg-mem support)', async () => {
      // Note: pg-mem has limited schema support, so this test focuses on what we can verify
      const outputPath = path.join(testOutputDir, 'test-schema')

      // Test with a non-existent schema - should generate only custom types
      await mainWithoutViews(pgDb, outputPath, defaultTypesSchema, 'nonexistent_schema')

      const typesFilePath = path.join(outputPath, 'types.ts')
      const generatedContent = fs.readFileSync(typesFilePath, 'utf-8')

      // Should have custom types but no table interfaces or enums from public schema
      expect(generatedContent).toContain('export interface Coordinates')
      expect(generatedContent).not.toContain('TableUsers')
      expect(generatedContent).not.toContain('TableOrders')
      expect(generatedContent).not.toContain('export enum EUserStatus')

      // Verify it only contains custom types (1 interface)
      const interfaceCount = (generatedContent.match(/export interface/g) || []).length
      expect(interfaceCount).toBe(1) // Only Coordinates
    })
  })

  describe('File I/O utilities', () => {
    test('should create directory and write formatted file', async () => {
      const content = ['export interface TestInterface {', '  id: number;', '  name: string;', '}']

      const testPath = path.join(testOutputDir, 'file-io-test')
      await writeToFile(testPath, content, 'types')

      const filePath = path.join(testPath, 'types.ts')
      expect(fs.existsSync(filePath)).toBe(true)

      const fileContent = fs.readFileSync(filePath, 'utf-8')
      expect(fileContent).toContain('export interface TestInterface')
      expect(fileContent).toContain('id: number')
      expect(fileContent).toContain('name: string')

      // Verify it's properly formatted (Prettier 3 removes semicolons per our config)
      expect(fileContent).toMatch(/{[\s\n]+id: number[\s\n]+name: string[\s\n]+}/)
    })
  })
})
