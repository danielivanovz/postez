import * as dotenv from 'dotenv'

import { IDatabaseConfiguration } from './types'
import pg from './db'
import { run } from './utilities'

dotenv.config()

const outputPath = __dirname.replace('dist', 'src/output')

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

		await run(db, outputPath)

	} catch (error) {
		console.log(error)
	}
})()
