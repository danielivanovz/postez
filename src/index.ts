import * as dotenv from 'dotenv'

import { IDatabaseConfiguration } from './types'
import pg from './db'
import { gen } from './utilities'
import { parseSchema, _schema } from './parsers'

dotenv.config()

const config: IDatabaseConfiguration = {
  host: 'localhost',
  port: process.env.PORT,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
}

const db = pg.db(config)

;(async () => {
  try {
    await gen(db, __dirname.replace('dist', 'src/output'))
  } catch (error) {
    console.log(error)
  }
})()
