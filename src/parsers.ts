import { IDatabase, QueryFile } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { IEnumSchema, ISchema, Types } from "./types";
import { sanitizeName } from "./utilities";
import * as fs from "fs";
import * as prettier from "prettier";

export function parseTypes(type: Types, enums: Map<string, string[]>) {
  switch (type) {
    case "bpchar":
    case "char":
    case "varchar":
    case "text":
    case "citext":
    case "uuid":
    case "bytea":
    case "inet":
    case "time":
    case "timetz":
    case "interval":
    case "name":
      return "string";
    case "int2":
    case "int4":
    case "int8":
    case "float4":
    case "float8":
    case "numeric":
    case "money":
    case "oid":
      return "number";
    case "bool":
      return "boolean";
    case "json":
    case "jsonb":
      return "Object";
    case "date":
    case "timestamp":
    case "timestamptz":
      return "Date";
    case "_int2":
    case "_int4":
    case "_int8":
    case "_float4":
    case "_float8":
    case "_numeric":
    case "_money":
      return "Array<number>";
    case "_bool":
      return "Array<boolean>";
    case "_varchar":
    case "_text":
    case "_citext":
    case "_uuid":
    case "_bytea":
      return "Array<string>";
    case "_json":
    case "_jsonb":
      return "Array<Object>";
    case "_timestamptz":
      return "Array<Date>";
    default:
      if (enums.has(type)) {
        return sanitizeName(type, "E");
      } else {
        console.log(`Cannot find a type for ${type}`);
        return "unknown";
      }
  }
}

export async function parseTableNames(
  db: IDatabase<unknown, IClient>,
  query: QueryFile
): Promise<string[]> {
  return await db.map<string>(
    query,
    undefined,
    (row: { table_name: string }) => row.table_name
  );
}

export async function generateTableTypes(rootPath: string, tables: string[]) {
  const schemaPath = rootPath + "/types.ts";
  const prettierConfig = prettier.resolveConfig(rootPath);

  const tablesTypes = `export type TableTypes = ${tables
    .map((x) => `'${x}'`)
    .join(" | ")}`;

  try {
    if (!fs.existsSync(rootPath)) fs.mkdirSync(rootPath);

    fs.writeFileSync(
      schemaPath,
      prettier.format(tablesTypes, { ...prettierConfig, filepath: schemaPath })
    );

    console.log(`Types generated successfully`);
  } catch (error) {
    console.error(error);
  }
}

export async function parseSchema(
  db: IDatabase<unknown, IClient>,
  tableNamesCollection: string[],
  selectInformationSchema: QueryFile,
  enums: Map<string, string[]>
) {
  return await Promise.all(
    tableNamesCollection.map(async (tableName) => {
      const schema = (await db.manyOrNone(selectInformationSchema, {
        table_name: tableName,
      })) as ISchema[];

      const currInterface = schema.reduce((acc, curr) => {
        const type = parseTypes(curr.udt_name, enums);
        const name = curr.column_name;

        acc[name] = type + (curr.is_nullable === "NO" ? "" : " | null");
        return acc;
      }, {} as Record<string, string>);

      const interfaceName = sanitizeName(tableName, "I");

      return `export interface ${interfaceName} {
			${Object.keys(currInterface)
        .map((key) => `${key}: ${currInterface[key]}`)
        .join("\n")}
		}`;
    })
  );
}

export async function getEnums(
  db: IDatabase<unknown, IClient>,
  query: QueryFile
) {
  return (await db.manyOrNone(query)) as IEnumSchema[];
}

export async function parseEnumTypes(enums: IEnumSchema[]) {
  return enums.map((e) => {
    const enumName = sanitizeName(e.enum_name, "E");
    const enumValues = e.enum_value.split(",");

    return `export enum ${enumName} {
		${enumValues.map((value) => `${value} = '${value.trim()}'`).join(",\n")}
		}`;
  });
}

export async function generateInteraces(
  db: IDatabase<unknown, IClient>,
  rootPath: string,
  tableNames: string[],
  query: QueryFile,
  enums: Map<string, string[]>
): Promise<void> {
  const schemaPath = rootPath + "/schema.ts";
  const prettierConfig = prettier.resolveConfig(rootPath);

  try {
    const interfaces = await parseSchema(db, tableNames, query, enums);
    const fileContent = interfaces.join("\n\n");

    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath);
    }

    fs.writeFileSync(
      schemaPath,
      prettier.format(fileContent, { ...prettierConfig, filepath: schemaPath })
    );
    console.log(`Interfaces generated successfully`);
  } catch (error) {
    console.error(error);
  }
}

export async function generateEnums(
  rootPath: string,
  enums: IEnumSchema[]
): Promise<void> {
  const schemaPath = rootPath + "/enums.ts";
  const prettierConfig = prettier.resolveConfig(rootPath);

  try {
    const parsedEnums = await parseEnumTypes(enums);
    const fileContent = parsedEnums.join("\n\n");

    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath);
    }

    fs.writeFileSync(
      schemaPath,
      prettier.format(fileContent, { ...prettierConfig, filepath: schemaPath })
    );
    console.log("Enums generated successfully");
  } catch (error) {
    console.error(error);
  }
}
