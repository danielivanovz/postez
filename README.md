# postez
Utility package for dynamically generate interfaces from PostgreSQL

<h1 align="center">postez</h1>

<h5 align="center">Utility tool for dynamically generate interfaces and types from PostgreSQL using custom schema.</h5>

<br>

## Usage

Define a schema as 
```ts
schema = {
 'string': [ 'bpchar', 'char', 'varchar', 'text', 'citext', 'uuid' ],
 'number': ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric' ],
 'boolean': ['bool', 'boolean'],
 'Date': ['date', 'timestamp', 'timestamptz'],
 'Array<number>': ['_int2', '_int4', '_int8', '_float4', '_float8', '_numeric', '_money'],
 'Array<boolean>': ['_bool', '_boolean'],
 'Array<string>': ['_varchar', '_text', '_citext', '_uuid', '_bytea'],
 'Object': ['json', 'jsonb'],
 'Array<Object>': ['_json', '_jsonb'],
 'Array<Date>': ['_timestamptz'],
 'CustomTypes': [
  {
   name: 'point',
   type: 'Coordinates',
   definition: 'export interface Coordinates { x: number; y: number; }',
  },
 ],
}
```

then just pass it as an argument with a database connection and output path:

``` ts
await gen(db, __dirname.replace('dist', 'src/output'), schema)
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
