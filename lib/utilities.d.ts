import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { IEnumSchema, ITypesSchema } from './types';
export declare const defaultSchema: ITypesSchema;
export declare function sanitizeName(name: string, prefix?: string, splitters?: string[]): string;
export declare function generateEnumMap(enums: IEnumSchema[]): Map<any, any>;
export declare function writeToFile(path: string, content: string[], name: string): Promise<void>;
/**
 * Creates a file containing all database entities and their respective interfaces
 * @param {IDatabase<unknown, IClient>} db
 * @param {string} outputPath
 * @param {ITypesSchema} typesSchema
 * @void will write a file to the outputPath
 */
export declare function main(db: IDatabase<unknown, IClient>, outputPath: string, typesSchema?: ITypesSchema, schema?: string): Promise<void>;
