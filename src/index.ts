import * as dotenv from 'dotenv'

import pg from './db'

import { IDatabaseConfiguration, ITypesSchema } from './types'
import { postez } from './utilities'

dotenv.config()

const config: IDatabaseConfiguration = {
  host: 'localhost',
  port: process.env.PORT,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
}

;(async () => {
  try {
    await postez(pg.db(config), __dirname.replace('dist', 'src/output'))
  } catch (error) {
    console.error(error)
  }
})()
