import { Types } from '../types'
import { sanitizeName } from '../utilities'

export const _schema: Partial<TSchema> = {
	"string": [
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
	"number": ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric', 'money', 'oid'],
	"boolean": ['bool', 'boolean'],
	"Date": ['date', 'timestamp', 'timestamptz'],
	"Array<number>": ['_int2', '_int4', '_int8', '_float4', '_float8', '_numeric', '_money', '_timestamptz'],
	"Array<boolean>": ['_bool', '_boolean'],
	"Array<string>": ['_varchar', '_text', '_citext', '_uuid', '_bytea'],
	"Object": ['json', 'jsonb'],
	'Array<Object>': ['_json', '_jsonb'],
	// 'Array<Date>': ['_timestamptz']
}

export type TSchema = Record<'string' | 'number' | 'boolean' | 'Object' | 'Date' | 'Array<number>' | 'Array<boolean>' | 'Array<string>' | 'Array<Object>' | 'Array<Date>', Types[]>
export type TParsedSchema = Record<Types, keyof TSchema>

export function parseSchema(schema: Partial<TSchema>): Record<Types, keyof TSchema> {
  return Object.keys(schema).reduce((acc, curr) => {
    acc = schema[curr].reduce((_: never, _curr: keyof typeof _schema) => {
      acc[_curr] = curr
      return acc
    })
    return acc
  }, {} as Record<Types, keyof TSchema>)
}

const getCustomType = (type: string, enums: Map<string, string[]>) => {
	if(enums.has(type)) return sanitizeName(type, 'E')
	return 'unknown'
}

export function typeParser(type: Types, enums: Map<string, string[]>, schema: TParsedSchema) {
  return schema[type] 
		? schema[type]
		: getCustomType(type, enums)
}

// export function parseTypes(type: Types, enums: Map<string, string[]>) {
//   switch (type) {
//     case 'bpchar':
//     case 'char':
//     case 'varchar':
//     case 'text':
//     case 'citext':
//     case 'uuid':
//     case 'bytea':
//     case 'inet':
//     case 'time':
//     case 'timetz':
//     case 'interval':
//     case 'name':
//       return 'string'
//     case 'int2':
//     case 'int4':
//     case 'int8':
//     case 'float4':
//     case 'float8':
//     case 'numeric':
//     case 'money':
//     case 'oid':
//       return 'string'
//     case 'bool':
//       return 'boolean'
//     case 'json':
//     case 'jsonb':
//       return 'Object'
//     case 'date':
//     case 'timestamp':
//     case 'timestamptz':
//       return 'Date'
//     case '_int2':
//     case '_int4':
//     case '_int8':
//     case '_float4':
//     case '_float8':
//     case '_numeric':
//     case '_money':
//       return 'Array<number>'
//     case '_bool':
//       return 'Array<boolean>'
//     case '_varchar':
//     case '_text':
//     case '_citext':
//     case '_uuid':
//     case '_bytea':
//       return 'Array<string>'
//     case '_json':
//     case '_jsonb':
//       return 'Array<Object>'
//     case '_timestamptz':
//       return 'Array<Date>'
//     default:
//       if (enums.has(type)) {
//         return sanitizeName(type, 'E')
//       } else {
//         console.log(`Cannot find a type for ${type}`)
//         return 'unknown'
//       }
//   }
// }
