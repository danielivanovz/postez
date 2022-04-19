import * as dotenv from 'dotenv'

import pg from './db'
import * as Types from './types'
import { main } from './utilities'

dotenv.config()

const config: Postez.IDatabaseConfiguration = {
  host: 'localhost',
  port: process.env.PORT,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
}

export declare namespace Postez {
  export const postgrez: typeof main
  export const pgp: typeof pg
  export type IDatabaseConfiguration = Types.IDatabaseConfiguration
  export type ISchema = Types.TSchema
}
