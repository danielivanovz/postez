import { IDatabase } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import pg from "./db";
// import { TableTypes } from "./output/types";
import {
  generateEnums,
  generateInteraces,
  generateTableTypes,
  getEnums,
  parseTableNames,
} from "./parsers";
import { IEnumSchema } from "./types";
import * as fs from "fs";

export function sanitizeName(name: string, prefix: string = "") {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
    .replace(/^/, `${prefix}`);
}

export function generateEnumMap(enums: IEnumSchema[]) {
  return enums.reduce((acc: Map<string, string[]>, curr) => {
    acc.set(curr.enum_name, curr.enum_value.split(","));
    return acc;
  }, new Map());
}

export async function run(db: IDatabase<unknown, IClient>, rootPath: string) {
  const tableSQL = pg.sql("select-table-names");
  const enumSQL = pg.sql("select-enum-names");
  const interfaceSQL = pg.sql("select-table-information");

  const tables = await parseTableNames(db, tableSQL);
  const enums = await getEnums(db, enumSQL);
  const enumsMap = generateEnumMap(enums);

  await generateTableTypes(rootPath, tables);
  await generateEnums(rootPath, enums);
  await generateInteraces(db, rootPath, tables, interfaceSQL, enumsMap);
}

// export function createTableAs(table: TableTypes, pathDDL: string) {
//   const DDL = fs.readFileSync(pathDDL, "utf-8");
//   const occ = DDL.indexOf(`CREATE TABLE ` + table);
//   return DDL.substring(occ, DDL.indexOf(";", occ + 1)).trim();
// }
