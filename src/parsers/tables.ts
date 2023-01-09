import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';

export async function parseTableNames(
  db: IDatabase<unknown, IClient>,
  query: QueryFile,
  schema: string,
): Promise<string[]> {
  return await db.map<string>(query, { schema: schema }, (row: { table_name: string }) => row.table_name);
}
