import * as dotenv from 'dotenv'

import { IDatabaseConfiguration, ISchema } from './types'
import pg from './db'
import { gen } from './utilities'

dotenv.config()

const config: IDatabaseConfiguration = {
  host: 'localhost',
  port: process.env.PORT,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
}

const db = pg.db(config)

export const schema: ISchema = {
  string: [
    'bpchar',
    'char',
    'varchar',
    'text',
    'citext',
    'uuid',
    'bytea',
    'inet',
    'time',
    'timetz',
    'interval',
    'name',
  ],
  number: ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric', 'money', 'oid'],
  boolean: ['bool', 'boolean'],
  Date: ['date', 'timestamp', 'timestamptz'],
  'Array<number>': ['_int2', '_int4', '_int8', '_float4', '_float8', '_numeric', '_money'],
  'Array<boolean>': ['_bool', '_boolean'],
  'Array<string>': ['_varchar', '_text', '_citext', '_uuid', '_bytea'],
  Object: ['json', 'jsonb'],
  'Array<Object>': ['_json', '_jsonb'],
  'Array<Date>': ['_timestamptz'],
  CustomTypes: [
    {
      name: 'point',
      type: 'Coordinates',
      definition: 'export interface Coordinates { x: number; y: number; }',
    },
  ],
}
;(async () => {
  try {
    await gen(db, __dirname.replace('dist', 'src/output'), schema)
  } catch (error) {
    console.error(error)
  }
})()
