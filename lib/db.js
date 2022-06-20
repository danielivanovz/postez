"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const pg_promise_1 = require("pg-promise");
const pgp = require('pg-promise')({});
const pg = {
    pgp: pgp,
    db: (config) => pgp(config),
    sql: (args) => new pg_promise_1.QueryFile((0, path_1.join)(__dirname, 'sql', args + '.sql'), { minify: true }),
};
exports.default = pg;
