import { ITypesSchema, TParsedSchema, Types } from '../types';
export declare function parseTypesSchema(schema: Partial<ITypesSchema>): Record<Types, keyof ITypesSchema>;
export declare function enumType(enums: Map<string, string[]>, type: string): string;
export declare function typeParser(type: Types, enums: Map<string, string[]>, schema: TParsedSchema): string;
