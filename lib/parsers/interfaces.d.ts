import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { ITypesSchema } from '../types';
export declare function parseInterfaces(db: IDatabase<unknown, IClient>, tableNamesCollection: string[], selectInformationSchema: QueryFile, enums: Map<string, string[]>, _schema: ITypesSchema): Promise<string[]>;
