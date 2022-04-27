import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { main } from './utilities';

export function postez(db: IDatabase<unknown, IClient>, path: string) {
  return main(db, path);
}
