import { ITypesSchema } from '../types'

export function parseCustomType(schema: ITypesSchema) {
  return schema.CustomTypes.map((x) => x.definition)
}
