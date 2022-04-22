import pg from './db';
import * as Types from './types';
import { main } from './utilities';
export declare namespace Postez {
    const postgrez: typeof main;
    const pgp: typeof pg;
    type IDatabaseConfiguration = Types.IDatabaseConfiguration;
    type ISchema = Types.TSchema;
}
