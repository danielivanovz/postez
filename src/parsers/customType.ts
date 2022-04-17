import { ISchema } from '../types'

export function parseCustomType(schema: ISchema) {
	return schema.CustomTypes.map((x) => x.definition)
}
