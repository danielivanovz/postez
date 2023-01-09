import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
export declare function parseTableNames(db: IDatabase<unknown, IClient>, query: QueryFile, schema: string): Promise<string[]>;
