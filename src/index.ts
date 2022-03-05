import { IDatabase } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import {
  generateEnums,
  generateInteraces,
  getEnums,
  parseEnumTypes,
  parseTableNames,
} from "./parsers";
import { IDatabaseConfiguration } from "./types";
import pg from "./db";
require("dotenv").config();

const config: IDatabaseConfiguration = {
  host: process.env.HOST as string,
  port: process.env.PORT as string,
  database: process.env.DATABASE as string,
  user: process.env.USER as string,
};

const rootPath = __dirname.replace("dist", "src/output");

(async () => {
  try {
    const db: IDatabase<unknown, IClient> = await pg.db(config);

    const tableNames = await parseTableNames(db, pg.sql("select-table-names"));
    const enums = await getEnums(db, pg.sql("select-enum-types"));

    const enumMap = enums.reduce(
      (acc: Map<string, string[]>, curr) =>
        acc.set(curr.enum_name, curr.enum_value.split(",")),
      new Map()
    );

    await generateEnums(rootPath, enums);
    await generateInteraces(
      db,
      rootPath,
      tableNames,
      pg.sql("select-information-schema"),
      enumMap
    );
  } catch (error) {
    console.error(error);
  }
})();
