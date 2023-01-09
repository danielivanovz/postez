import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { ITypesSchema } from './types';
import { main } from './utilities';

export function postez(db: IDatabase<unknown, IClient>, path: string, typesSchema?: ITypesSchema, schema?: string) {
  return main(db, path, typesSchema, schema);
}
