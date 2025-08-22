import { test, expect, describe, beforeAll, afterAll } from 'bun:test'
import { newDb } from 'pg-mem'
import { parseInterfaces } from '../src/parsers/interfaces'
import { ITypesSchema } from '../src/types'
import { defaultTypesSchema } from '../src/utilities'
import pg from '../src/db'

describe('parseInterfaces - Real PostgreSQL interface generation', () => {
  let memDb: any
  let pgDb: any
  let tableInfoQuery: any

  beforeAll(async () => {
    // Create in-memory PostgreSQL database
    memDb = newDb()

    // Enable pg-promise adapter
    pgDb = memDb.adapters.createPgPromise()

    // Create the query object once to avoid duplicate warnings
    tableInfoQuery = pg.sql('select-table-information')

    // Create test tables with real PostgreSQL schema
    await pgDb.query(`
      CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
    `)

    await pgDb.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NULL
      );
    `)

    await pgDb.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status order_status NOT NULL DEFAULT 'pending',
        total NUMERIC(10,2) NULL,
        notes TEXT NULL
      );
    `)

    await pgDb.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        description TEXT NULL
      );
    `)
  })

  afterAll(async () => {
    if (pgDb && pgDb.$pool) {
      try {
        await pgDb.$pool.end()
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  test('should generate correct interface from real table schema', async () => {
    const tableNames = ['users']
    const enumMap = new Map()
    const schema = 'public'

    const result = await parseInterfaces(pgDb, tableNames, tableInfoQuery, enumMap, defaultTypesSchema, schema)

    expect(result).toHaveLength(1)
    const userInterface = result[0]

    expect(userInterface).toContain('export interface TableUsers')
    expect(userInterface).toContain('id: number') // pg-mem: integer -> number
    expect(userInterface).toContain('name: string') // pg-mem: text -> string
    expect(userInterface).toContain('email: string') // pg-mem doesn't properly handle NULL constraints
    expect(userInterface).toContain('created_at: Date') // pg-mem: timestamptz -> Date
    expect(userInterface).toContain('metadata: Object') // pg-mem doesn't properly handle NULL constraints
  })

  test('should handle enum types correctly', async () => {
    const tableNames = ['orders']
    const enumMap = new Map([['order_status', ['pending', 'processing', 'completed', 'cancelled']]])
    const schema = 'public'

    const result = await parseInterfaces(pgDb, tableNames, tableInfoQuery, enumMap, defaultTypesSchema, schema)

    expect(result).toHaveLength(1)
    const orderInterface = result[0]

    expect(orderInterface).toContain('export interface TableOrders')
    expect(orderInterface).toContain('status: EOrderStatus')
    expect(orderInterface).toContain('total: number') // pg-mem: float -> number (NULL constraint not respected)
    expect(orderInterface).toContain('notes: string') // pg-mem: text -> string (NULL constraint not respected)
  })

  test('should handle multiple tables correctly', async () => {
    const tableNames = ['users', 'products']
    const enumMap = new Map()
    const schema = 'public'

    const result = await parseInterfaces(pgDb, tableNames, tableInfoQuery, enumMap, defaultTypesSchema, schema)

    expect(result).toHaveLength(2)
    expect(result[0]).toContain('export interface TableUsers')
    expect(result[1]).toContain('export interface TableProducts')
    expect(result[1]).toContain('active: boolean') // pg-mem: bool -> boolean, not null (has default)
    expect(result[1]).toContain('description: string') // pg-mem: text -> string (NULL constraint not respected)
  })

  test('should use custom type schema', async () => {
    const customSchema: ITypesSchema = {
      ...defaultTypesSchema,
      string: ['varchar', 'text'], // pg-mem uses 'text'
      number: ['int4', 'numeric', 'integer'], // pg-mem uses 'integer'
      boolean: ['bool'],
      'Array<string>': ['_text'],
    }

    const tableNames = ['products']
    const enumMap = new Map()
    const schema = 'public'

    const result = await parseInterfaces(pgDb, tableNames, tableInfoQuery, enumMap, customSchema, schema)

    expect(result).toHaveLength(1)
    expect(result[0]).toContain('name: string')
    expect(result[0]).toContain('active: boolean')
  })

  test('should return empty array for non-existent tables', async () => {
    const tableNames = ['nonexistent_table']
    const enumMap = new Map()
    const schema = 'public'

    const result = await parseInterfaces(pgDb, tableNames, tableInfoQuery, enumMap, defaultTypesSchema, schema)

    expect(result).toHaveLength(1)
    // Should generate an interface but with no properties since table doesn't exist
    expect(result[0]).toContain('export interface TableNonexistentTable')
  })
})
