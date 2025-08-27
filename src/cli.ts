#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import pg from './db'
import { postez } from './index'
import { ITypesSchema, IDatabaseConfiguration } from './types'
import { defaultTypesSchema } from './utilities'

interface CLIOptions {
  config?: string
  host?: string
  port?: string
  database?: string
  user?: string
  password?: string
  schema?: string
  output?: string
  watch?: boolean
  help?: boolean
  version?: boolean
  dryRun?: boolean
}

interface PostezConfig {
  database: IDatabaseConfiguration
  schema?: string
  output: string
  typesSchema?: ITypesSchema
  watch?: boolean
}

const HELP_TEXT = `
postez - PostgreSQL to TypeScript type generator

USAGE:
  postez [options]
  postez --config <config-file>

OPTIONS:
  --config <file>     Configuration file path (JSON only for global install)
  --host <host>       Database host (default: localhost)
  --port <port>       Database port (default: 5432)
  --database <db>     Database name
  --user <user>       Database user
  --password <pass>   Database password
  --schema <schema>   Database schema (default: public)
  --output <path>     Output directory (default: ./types)
  --watch             Watch for schema changes and regenerate
  --dry-run           Show what would be generated without writing files
  --version           Show version
  --help              Show this help

EXAMPLES:
  # Using command line options
  postez --host localhost --database mydb --user postgres --output ./types

  # Using config file
  postez --config postez.config.ts

  # Watch mode
  postez --config postez.config.ts --watch

CONFIG FILE EXAMPLE (postez.config.json):
  {
    "database": {
      "host": "localhost",
      "port": "5432",
      "database": "mydb",
      "user": "postgres",
      "password": "password"
    },
    "schema": "public",
    "output": "./types",
    "typesSchema": {
      "string": ["varchar", "text", "uuid"],
      "number": ["int4", "int8", "numeric"],
      "CustomTypes": [
        {
          "name": "point",
          "type": "GeoPoint",
          "definition": "export interface GeoPoint { lat: number; lng: number; }"
        }
      ]
    }
  }
`

function parseArguments(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--config':
        options.config = nextArg
        i++
        break
      case '--host':
        options.host = nextArg
        i++
        break
      case '--port':
        options.port = nextArg
        i++
        break
      case '--database':
        options.database = nextArg
        i++
        break
      case '--user':
        options.user = nextArg
        i++
        break
      case '--password':
        options.password = nextArg
        i++
        break
      case '--schema':
        options.schema = nextArg
        i++
        break
      case '--output':
        options.output = nextArg
        i++
        break
      case '--watch':
        options.watch = true
        break
      case '--help':
        options.help = true
        break
      case '--version':
        options.version = true
        break
      case '--dry-run':
        options.dryRun = true
        break
    }
  }

  return options
}

async function loadConfig(configPath: string): Promise<PostezConfig> {
  const fullPath = resolve(configPath)

  if (!existsSync(fullPath)) {
    throw new Error(`Config file not found: ${fullPath}`)
  }

  try {
    if (fullPath.endsWith('.ts')) {
      // Support both Bun and Node.js for TypeScript config files
      try {
        // Try Bun's native TypeScript support first
        const config = await import(fullPath)
        return config.default || config
      } catch (bunError) {
        // Fallback to ts-node for Node.js environments
        try {
          const tsNode = require('ts-node')
          tsNode.register()
          delete require.cache[require.resolve(fullPath)] // Clear cache
          const config = require(fullPath)
          return config.default || config
        } catch (tsNodeError) {
          throw new Error(`Failed to load TypeScript config. Install ts-node for Node.js: npm install -D ts-node`)
        }
      }
    } else if (fullPath.endsWith('.json')) {
      const content = readFileSync(fullPath, 'utf-8')
      return JSON.parse(content)
    } else {
      throw new Error('Config file must be .ts or .json')
    }
  } catch (error: any) {
    throw new Error(`Failed to load config file: ${error.message}`)
  }
}

function createConfigFromArgs(options: CLIOptions): PostezConfig {
  if (!options.database || !options.user) {
    throw new Error('--database and --user are required when not using a config file')
  }

  return {
    database: {
      host: options.host || 'localhost',
      port: options.port || '5432',
      database: options.database,
      user: options.user,
      password: options.password,
    },
    schema: options.schema || 'public',
    output: options.output || './types',
    typesSchema: defaultTypesSchema,
  }
}

function getVersion(): string {
  try {
    // For bundled CLI, read from package.json in the same directory as the executable
    const execDir = require('path').dirname(process.argv[1])
    const packagePath = join(execDir, '../package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
    return packageJson.version
  } catch {
    return 'unknown'
  }
}

async function generateTypes(config: PostezConfig, dryRun: boolean = false) {
  console.log(`🔍 Connecting to database: ${config.database.host}:${config.database.port}/${config.database.database}`)

  const db = pg.db(config.database)

  if (dryRun) {
    console.log(`📝 Dry run mode - would generate types to: ${config.output}`)
    console.log(`📊 Using schema: ${config.schema}`)
    return
  }

  try {
    await postez(db, config.output, config.typesSchema, config.schema)
    console.log(`✅ Types generated successfully in: ${config.output}`)
  } catch (error: any) {
    console.error(`❌ Error generating types: ${error.message}`)
    process.exit(1)
  } finally {
    await db.$pool.end()
  }
}

async function watchMode(config: PostezConfig) {
  console.log(`👀 Watch mode enabled - monitoring database schema changes...`)
  console.log(`⏹️  Press Ctrl+C to stop`)

  // Initial generation
  await generateTypes(config)

  // Set up polling (in a real implementation, you'd use database change notifications)
  const interval = setInterval(async () => {
    try {
      await generateTypes(config)
    } catch (error: any) {
      console.error(`❌ Error in watch mode: ${error.message}`)
    }
  }, 5000) // Check every 5 seconds

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval)
    console.log(`\n👋 Stopping watch mode...`)
    process.exit(0)
  })
}

async function main() {
  const options = parseArguments()

  if (options.help) {
    console.log(HELP_TEXT)
    process.exit(0)
  }

  if (options.version) {
    console.log(`postez v${getVersion()}`)
    process.exit(0)
  }

  try {
    let config: PostezConfig

    if (options.config) {
      config = await loadConfig(options.config)
      // Override config with CLI options if provided
      if (options.output) config.output = options.output
      if (options.schema) config.schema = options.schema
      if (options.watch !== undefined) config.watch = options.watch
    } else {
      config = createConfigFromArgs(options)
    }

    if (options.watch || config.watch) {
      await watchMode(config)
    } else {
      await generateTypes(config, options.dryRun)
    }
  } catch (error: any) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }
}

// Support both Bun and Node.js runtime detection
if ((import.meta as any).main || require.main === module) {
  main().catch((error: any) => {
    console.error(`❌ Unexpected error: ${error.message}`)
    process.exit(1)
  })
}
