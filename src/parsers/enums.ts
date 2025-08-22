import { IDatabase, QueryFile } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'
import { IEnumSchema } from '../types'
import { sanitizeName } from '../utilities'

export async function parseEnumTypes(enums: IEnumSchema[]) {
  return enums.map((e) => {
    const enumName = sanitizeName(e.enum_name, 'E')
    const originalValues = e.enum_value.split(',').map((x) => x.trim())

    return `export enum ${enumName} {
		${originalValues
      .map((value) => {
        const safeKey = value.replace(/ /g, '_')
        return `"${safeKey}" = '${value}'`
      })
      .join(',\n')}
		}`
  })
}

export async function getEnums(db: IDatabase<unknown, IClient>, query: QueryFile, schema: string) {
  return (await db.manyOrNone(query, { schema })) as IEnumSchema[]
}
