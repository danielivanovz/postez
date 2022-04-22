import { IDatabase, QueryFile } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { IDatabaseConfiguration } from './types';
declare const pg: {
    pgp: any;
    db: (config: IDatabaseConfiguration | string) => IDatabase<unknown, IClient>;
    sql: (args: string) => QueryFile;
};
export default pg;
