import { ICustomType, ISchema, TParsedSchema, Types } from '../types'
import { sanitizeName } from '../utilities'

export function parseSchema(schema: Partial<ISchema>): Record<Types, keyof ISchema> {
  return Object.keys(schema).reduce((acc, curr) => {
    acc = schema[curr].reduce((_: never, _curr: string | ICustomType) => {
      if (curr === 'CustomTypes' && typeof _curr === 'object') {
        acc[_curr.name] = _curr.type
      }
      // @ts-ignore
      acc[_curr] = curr
      return acc
    }, {})
    return acc
  }, {} as Record<Types, keyof ISchema>)
}

export function enumType(enums: Map<string, string[]>, type: string) {
  if (enums.has(type)) return sanitizeName(type, 'E')
  if (enums.has(type.replace('_', ''))) return `Array<${sanitizeName(type, 'E')}>`

  console.info(`Cannot find type ${type}`)

  return 'unknown'
}

export function typeParser(type: Types, enums: Map<string, string[]>, schema: TParsedSchema) {
  switch (schema[type]) {
    case undefined:
      return enumType(enums, type)
    default:
      return schema[type]
  }
}
