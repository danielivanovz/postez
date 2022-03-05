import { join } from "path";
import { QueryFile } from "pg-promise";
import { IDatabaseConfiguration } from "./types";
const pgp = require("pg-promise")({});

const pg = {
  db: (config: IDatabaseConfiguration) => pgp(config),
  sql: (args: string) => {
    return new QueryFile(join(__dirname, "sql", args + ".sql"), {
      minify: true,
    });
  },
};

export default pg;
