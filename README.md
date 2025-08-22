<h1 align="center">postez</h1>
<h6 align="center">Generate TypeScript interfaces and enums from PostgreSQL database schemas with custom type mappings.</h5>
<br>

## Installation

```bash
npm install postez
# or globally for CLI usage
npm install -g postez
```

## CLI Usage

The fastest way to get started is using the CLI:

```bash
# Generate types using command line options
postez --host localhost --database mydb --user postgres --output ./types

# Or using a config file
postez --config postez.config.json

# Watch mode for development
postez --config postez.config.json --watch
```

### Config File Examples

**Note**: When using the globally installed CLI (`npm install -g postez`), only JSON config files are supported. TypeScript config files work only when running locally with Bun.

#### Basic Configuration (`postez.config.json`):

```json
{
  "database": {
    "host": "localhost",
    "port": "5432",
    "database": "mydb",
    "user": "postgres",
    "password": "password"
  },
  "schema": "public",
  "output": "./generated-types"
}
```

#### Advanced Configuration with Custom Types (`postez.config.json`):

Use custom type schemas when you need to:
- Map specific PostgreSQL types to custom TypeScript types
- Handle PostGIS geometry types
- Override default type mappings
- Add custom interface definitions

```json
{
  "database": {
    "host": "localhost",
    "port": "5432", 
    "database": "mydb",
    "user": "postgres",
    "password": "password"
  },
  "schema": "public",
  "output": "./generated-types",
  "typesSchema": {
    "string": ["varchar", "text", "uuid", "citext"],
    "number": ["int4", "int8", "numeric", "bigint"],
    "boolean": ["boolean"],
    "Date": ["timestamp", "timestamptz", "date"],
    "Array<string>": ["_varchar", "_text", "_uuid"],
    "Array<number>": ["_int4", "_int8", "_numeric"],
    "Object": ["json", "jsonb"],
    "CustomTypes": [
      {
        "name": "point",
        "type": "GeoPoint",
        "definition": "export interface GeoPoint { lat: number; lng: number; }"
      },
      {
        "name": "geometry", 
        "type": "GeoShape",
        "definition": "export interface GeoShape { type: string; coordinates: number[][]; }"
      }
    ]
  }
}
```

## Library Usage

Define a types schema as

```ts
typesSchema = {
  string: ['bpchar', 'char', 'varchar', 'text', 'citext', 'uuid'],
  number: ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric'],
  boolean: ['bool', 'boolean'],
  Date: ['date', 'timestamp', 'timestamptz'],
  'Array<number>': ['_int2', '_int4', '_int8', '_float4', '_float8', '_numeric', '_money'],
  'Array<boolean>': ['_bool', '_boolean'],
  'Array<string>': ['_varchar', '_text', '_citext', '_uuid', '_bytea'],
  Object: ['json', 'jsonb'],
  'Array<Object>': ['_json', '_jsonb'],
  'Array<Date>': ['_timestamptz'],
  CustomTypes: [
    {
      name: 'point',
      type: 'Coordinates',
      definition: 'export interface Coordinates { x: number; y: number; }',
    },
  ],
}
```

then just pass it as an argument with a database connection and output path.

```ts
postez(db, path, typesSchema)
  .then(() => console.log('Done.'))
  .catch((e) => console.error(e))
```

You can also specify the name of table schema you want to generate types.ts.

```ts
postez(db, path, typesSchema, 'schema_name')
  .then(() => console.log('Done.'))
  .catch((e) => console.error(e))
```

Otherwise you can use a default types schema (table schema name is 'public' by default if not specified) and `pg-promise` as simple as:

```ts
import pg from 'postez/db'
import { postez } from 'postez'

const configuration = {
  user: 'username',
  password: 'password',
  host: 'host',
  port: 'port',
  database: 'database',
}

const db = pg.db(configuration)
const path = process.cwd().replace('./dist', './output')

postez(db, path)
  .then(() => console.log('Done.'))
  .catch((e) => console.error(e))
```

on successfull run it will prompt out the following:

```
Succesfully generated files in: <path>/output/types.ts
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
