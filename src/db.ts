import { join } from 'path'
import { IDatabase, QueryFile } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'
import { IDatabaseConfiguration } from './types'
const pgp = require('pg-promise')({})

const pg = {
  pgp: pgp,
  db: (config: IDatabaseConfiguration | string): IDatabase<unknown, IClient> => pgp(config),
  sql: (args: string): QueryFile => new QueryFile(join(__dirname, 'sql', args + '.sql'), { minify: true }),
}

export default pg