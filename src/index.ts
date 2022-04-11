import { IDatabaseConfiguration } from "./types";
import pg from "./db";
import { run } from "./utilities";
// import { TableTypes } from "./output/types";
import * as dotenv from 'dotenv';

const config = dotenv.config() as unknown as { parsed: IDatabaseConfiguration };

const db = pg.db(config.parsed);

const outputPath = __dirname.replace("dist", "src/output");

// --> Run
run(db, outputPath).then(() => {
  console.log("done");
});

// --> Idea of creating an object from interface
// const instanciate = <T>(obj: T extends infer T ? T : never) => obj

// const xs = instanciate<IUsers>({
// 	'id': '',
// 	'name': '',
// 	'value': ''
// })

// const q = createTableAs("users", __dirname.replace("dist", "/sql/ddl.sql"));
// console.log(q);

// --> idea of using the pg-promise library for inserting and updating records
// async function insertInto<T extends object>(
//   obj: T extends infer T ? T : never,
//   table: TableTypes
// ) {
//   db.$config.pgp.helpers.insert(obj, Object.keys(obj), table);
// }

// async function updateInto<T extends object>(
//   obj: T extends infer T ? Partial<T> : never,
//   table: TableTypes
// ) {
//   db.$config.pgp.helpers.insert(obj, Object.keys(obj), table);
// }
