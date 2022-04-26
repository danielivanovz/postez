import pg from './db';
import * as Types from './types';
import { main } from './utilities';

// export declare namespace Postez {
//   export const postgrez: typeof main;
//   export const pgp: typeof pg;
//   export const db: typeof pg['db'];
//   export type IDatabaseConfiguration = Types.IDatabaseConfiguration;
//   export type ISchema = Types.TSchema;
// }

export function postez(db, path) {
  return main(db, path);
}
