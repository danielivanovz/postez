import { IDatabase, QueryFile } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'

export async function parseTableNames(db: IDatabase<unknown, IClient>, query: QueryFile): Promise<string[]> {
	return await db.map<string>(query, undefined, (row: { table_name: string }) => row.table_name)
}
