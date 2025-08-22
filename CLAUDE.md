# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Postez is a TypeScript utility tool that dynamically generates TypeScript interfaces and types from PostgreSQL database schemas. It introspects PostgreSQL databases and creates TypeScript type definitions based on table structures, enums, and custom type mappings.

## Core Architecture

- **Entry Point**: `src/index.ts` - Exports the main `postez` function
- **Core Logic**: `src/utilities.ts` - Contains the `main` function that orchestrates the type generation process
- **Database Layer**: `src/db.ts` - Handles PostgreSQL connections using pg-promise
- **Parsers**: `src/parsers/` directory contains specialized parsers:
  - `tables.ts` - Parses table information and generates interfaces
  - `enums.ts` - Handles PostgreSQL enum types
  - `interfaces.ts` - Creates TypeScript interfaces from table schemas
  - `datatypes.ts` - Maps PostgreSQL types to TypeScript types
  - `customType.ts` - Handles custom type definitions
- **SQL Queries**: `sql/` directory contains SQL files for database introspection
- **Type Definitions**: `src/types.ts` - Core TypeScript interfaces and types

The tool works by:
1. Connecting to a PostgreSQL database
2. Querying table/view structures and enum definitions
3. Mapping PostgreSQL data types to TypeScript types using configurable schemas
4. Generating TypeScript interface files with proper formatting

## Development Commands

```bash
# Build the project (includes compile and copy SQL files)
npm run build

# Development build with watch mode
npm run compile:dev

# Compile TypeScript and run linting/formatting
npm run compile

# Lint code using TSLint
npm run lint

# Format code using Prettier
npm run format

# Version management and publishing
npm run patch    # Build, version patch, and publish
npm run minor    # Build, version minor, and publish  
npm run major    # Build, version major, and publish
```

## Build Process

The build process involves:
1. Formatting with Prettier (`src/**/*.{ts,js,json}`)
2. Linting with TSLint
3. TypeScript compilation to `lib/` directory
4. Copying SQL files from `sql/` to `lib/sql/`

## Type Schema Configuration

The tool uses a `ITypesSchema` configuration that maps PostgreSQL data types to TypeScript types. A default schema is provided in `src/utilities.ts` but can be customized. Custom types can be defined with their own TypeScript definitions.

## Database Integration

Uses `pg-promise` for PostgreSQL connectivity. The database module (`src/db.ts`) provides utilities for:
- Creating database connections
- Loading SQL query files from the `sql/` directory
- Query file management with minification