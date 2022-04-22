export interface IDatabaseConfiguration {
  host: string;
  port: string;
  database: string;
  user: string;
  password?: string;
  privateKey?: string;
}

export interface IInterfaces {
  column_name: string;
  udt_name: Types;
  is_nullable: 'YES' | 'NO';
}

export interface IEnumSchema {
  enum_name: string;
  enum_value: string;
}

export type StringType =
  | 'bpchar'
  | 'char'
  | 'varchar'
  | 'text'
  | 'citext'
  | 'uuid'
  | 'bytea'
  | 'inet'
  | 'time'
  | 'timetz'
  | 'interval'
  | 'name';

export type NumberType = 'int2' | 'int4' | 'int8' | 'float4' | 'float8' | 'numeric' | 'money' | 'oid';
export type BooleanType = 'bool' | 'boolean';
export type ObjectType = 'json' | 'jsonb';
export type NumberArrayType = '_int2' | '_int4' | '_int8' | '_float4' | '_float8' | '_numeric' | '_money';
export type StringArrayType = '_varchar' | '_text' | '_citext' | '_uuid' | '_bytea';
export type BooleanArrayType = '_bool' | '_boolean';
export type ObjectArrayType = '_json' | '_jsonb';
export type DateArrayType = '_timestamptz';
export type DateType = 'date' | 'time' | 'timestamp' | 'timestamptz';
export type CustomType = ICustomType[];

export type Types =
  | StringType
  | NumberType
  | BooleanType
  | ObjectType
  | NumberArrayType
  | StringArrayType
  | BooleanArrayType
  | ObjectArrayType
  | DateArrayType
  | DateType;

export interface ICustomType {
  name: string;
  type: string;
  definition: string;
}

export interface ITypesSchema {
  string: StringType[];
  number: NumberType[];
  boolean: BooleanType[];
  Date: DateType[];
  'Array<number>': NumberArrayType[];
  'Array<boolean>': BooleanArrayType[];
  'Array<string>': StringArrayType[];
  Object: ObjectType[];
  'Array<Object>': ObjectArrayType[];
  'Array<Date>': DateArrayType[];
  CustomTypes: ICustomType[];
}

export type TPrimitive =
  | 'string'
  | 'number'
  | 'boolean'
  | 'Object'
  | 'Date'
  | 'Array<number>'
  | 'Array<boolean>'
  | 'Array<string>'
  | 'Array<Object>'
  | 'Array<Date>'
  | 'CustomTypes';

export type TSchema = Record<TPrimitive, Types[]>;
export type TParsedSchema = Record<Types, keyof TSchema>;
