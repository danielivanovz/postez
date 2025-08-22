import { join, dirname } from 'path'
import { IDatabase, QueryFile } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'
import { IDatabaseConfiguration } from './types'
const pgp = require('pg-promise')({})

const pg = {
  pgp,
  db: (config: IDatabaseConfiguration | string): IDatabase<unknown, IClient> => pgp(config),
  sql: (args: string): QueryFile => {
    // Get the directory where this script is running from
    const currentDir = dirname(require.resolve('./db'))
    return new QueryFile(join(currentDir, '..', 'sql', args + '.sql'), { minify: true })
  },
}

export default pg
