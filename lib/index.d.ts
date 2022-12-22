import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { ITypesSchema } from './types';
export declare function postez(db: IDatabase<unknown, IClient>, path: string, typesSchema?: ITypesSchema, schema?: string): Promise<void>;
