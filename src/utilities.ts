import { IDatabase } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'
import pg from './db'
import { generateEnums, generateInteraces, generateTableTypes, getEnums, parseTableNames } from './parsers'
import { IEnumSchema } from './types'

export function sanitizeName(name: string, prefix: string = '', splitters: string[] = ['_', '-']) {
	return name.split(new RegExp(splitters.join('|'))) 
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')
		.replace(/^/, `${prefix}`);		
}

export function generateEnumMap(enums: IEnumSchema[]) {
	return enums.reduce((acc: Map<string, string[]>, curr) => {
		acc.set(curr.enum_name, curr.enum_value.split(','))
		return acc
	}, new Map())
}

export async function run(db: IDatabase<unknown, IClient>, rootPath: string) {
	const tableSQL = pg.sql('select-table-names')
	const enumSQL = pg.sql('select-enum-names')
	const interfaceSQL = pg.sql('select-table-information')

	const tables = await parseTableNames(db, tableSQL)
	const enums = await getEnums(db, enumSQL)
	const enumsMap = generateEnumMap(enums)

	console.log(enums)

	await generateTableTypes(rootPath, tables)
	await generateEnums(rootPath, enums)
	await generateInteraces(db, rootPath, tables, interfaceSQL, enumsMap)
}

// export function createTableAs(table: TableTypes, pathDDL: string) {
//   const DDL = fs.readFileSync(pathDDL, "utf-8");
//   const occ = DDL.indexOf(`CREATE TABLE ` + table);
//   return DDL.substring(occ, DDL.indexOf(";", occ + 1)).trim();
// }

// --> Idea of creating an object from interface
// const instanciate = <T>(obj: T extends infer T ? T : never) => obj

// const xs = instanciate<IUsers>({
// 	'id': '',
// 	'name': '',
// 	'value': ''
// })

// const q = createTableAs("users", __dirname.replace("dist", "/sql/ddl.sql"));
// console.log(q);

// --> idea of using the pg-promise library for inserting and updating records
// async function insertInto<T extends object>(
//   obj: T extends infer T ? T : never,
//   table: TableTypes
// ) {
//   db.$config.pgp.helpers.insert(obj, Object.keys(obj), table);
// }

// async function updateInto<T extends object>(
//   obj: T extends infer T ? Partial<T> : never,
//   table: TableTypes
// ) {
//   db.$config.pgp.helpers.insert(obj, Object.keys(obj), table);
// }
