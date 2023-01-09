import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { IInterfaces, ITypesSchema } from '../types';
import { sanitizeName } from '../utilities';
import { parseTypesSchema, typeParser } from './datatypes';

export async function parseInterfaces(
  db: IDatabase<unknown, IClient>,
  tableNamesCollection: string[],
  selectInformationSchema: QueryFile,
  enums: Map<string, string[]>,
  typesSchema: ITypesSchema,
  schema: string,
) {
  const typeSchema = parseTypesSchema(typesSchema);

  return await Promise.all(
    tableNamesCollection.map(async (tableName) => {
      const informationSchema = (await db.manyOrNone(selectInformationSchema, {
        table_name: tableName,
        schema: schema,
      })) as IInterfaces[];

      const currInterface = informationSchema.reduce((acc, curr) => {
        const type = typeParser(curr.udt_name, enums, typeSchema);

        const name = curr.column_name;

        acc[name] = type + (curr.is_nullable === 'NO' ? '' : ' | null');
        return acc;
      }, {} as Record<string, string>);

      const interfaceName = sanitizeName(tableName, 'Table');

      return `export interface ${interfaceName} {
			${Object.keys(currInterface)
        .map((key) => `${key}: ${currInterface[key]}`)
        .join('\n')}
			}`;
    }),
  );
}
