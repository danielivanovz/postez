import { ICustomType, ITypesSchema } from '../types';
import { sanitizeName } from '../utilities';

export function parseTypesSchema(schema: Partial<ITypesSchema>): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.keys(schema).forEach(typeScriptType => {
    const pgTypes = schema[typeScriptType as keyof ITypesSchema];
    
    if (typeScriptType === 'CustomTypes') {
      // Handle custom types
      (pgTypes as ICustomType[])?.forEach(customType => {
        result[customType.name] = customType.type;
      });
    } else {
      // Handle regular types
      (pgTypes as string[])?.forEach(pgType => {
        result[pgType] = typeScriptType;
      });
    }
  });
  
  return result;
}

export function enumType(enums: Map<string, string[]>, type: string) {
  if (enums.has(type)) return sanitizeName(type, 'E');
  if (enums.has(type.replace('_', ''))) return `Array<${sanitizeName(type.replace('_', ''), 'E')}>`;

  console.info(`Cannot find type ${type}`);

  return 'unknown';
}

export function typeParser(type: string, enums: Map<string, string[]>, schema: Record<string, string>) {
  if (schema[type]) {
    return schema[type];
  }
  // Fallback to enum type parsing for unknown types
  return enumType(enums, type);
}
