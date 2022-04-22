import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { IInterfaces, ITypesSchema } from '../types';
import { sanitizeName } from '../utilities';
import { parseSchema, typeParser } from './datatypes';

export async function parseInterfaces(
  db: IDatabase<unknown, IClient>,
  tableNamesCollection: string[],
  selectInformationSchema: QueryFile,
  enums: Map<string, string[]>,
  _schema: ITypesSchema,
) {
  const typeSchema = parseSchema(_schema);

  return await Promise.all(
    tableNamesCollection.map(async (tableName) => {
      const schema = (await db.manyOrNone(selectInformationSchema, {
        table_name: tableName,
      })) as IInterfaces[];

      const currInterface = schema.reduce((acc, curr) => {
        const type = typeParser(curr.udt_name, enums, typeSchema);

        const name = curr.column_name;

        acc[name] = type + (curr.is_nullable === 'NO' ? '' : ' | null');
        return acc;
      }, {} as Record<string, string>);

      const interfaceName = sanitizeName(tableName, 'I');

      return `export interface ${interfaceName} {
			${Object.keys(currInterface)
        .map((key) => `${key}: ${currInterface[key]}`)
        .join('\n')}
			}`;
    }),
  );
}
