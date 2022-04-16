export interface IDatabaseConfiguration {
  host: string
  port: string
  database: string
  user: string
  password?: string
  privateKey?: string
}

export interface ISchema {
  column_name: string
  udt_name: Types
  is_nullable: 'YES' | 'NO'
}

export interface IEnumSchema {
  enum_name: string
  enum_value: string
}

type StringType =
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
  | 'name'

type NumberType = 'int2' | 'int4' | 'int8' | 'float4' | 'float8' | 'numeric' | 'money' | 'oid'
type BooleanType = 'bool' | 'boolean'
type ObjectType = 'json' | 'jsonb'
type NumberArrayType = '_int2' | '_int4' | '_int8' | '_float4' | '_float8' | '_numeric' | '_money'
type StringArrayType = '_varchar' | '_text' | '_citext' | '_uuid' | '_bytea'
type BooleanArrayType = '_bool' | '_boolean'
type ObjectArrayType = '_json' | '_jsonb'
type DateArrayType = '_timestamptz'
type DateType = 'date' | 'time' | 'timestamp' | 'timestamptz'

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
  | DateType
