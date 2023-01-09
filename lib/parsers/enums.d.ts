import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { IEnumSchema } from '../types';
export declare function parseEnumTypes(enums: IEnumSchema[]): Promise<string[]>;
export declare function getEnums(db: IDatabase<unknown, IClient>, query: QueryFile, schema: string): Promise<IEnumSchema[]>;
