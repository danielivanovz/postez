import { join } from "path";
import { IDatabase, QueryFile } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { IDatabaseConfiguration } from "./types";
const pgp = require("pg-promise")({});

const pg = {
  db: (config: IDatabaseConfiguration): IDatabase<unknown, IClient> =>
    pgp(config),
  sql: (args: string): QueryFile => {
    return new QueryFile(join(__dirname, "sql", args + ".sql"), {
      minify: true,
    });
  },
};

export default pg;
