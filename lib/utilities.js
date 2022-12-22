"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.writeToFile = exports.generateEnumMap = exports.sanitizeName = exports.defaultSchema = void 0;
const fs = __importStar(require("fs"));
const prettier = __importStar(require("prettier"));
const os_1 = require("os");
const db_1 = __importDefault(require("./db"));
const parsers_1 = require("./parsers");
exports.defaultSchema = {
    string: [
        'bpchar',
        'char',
        'varchar',
        'text',
        'citext',
        'uuid',
        'bytea',
        'inet',
        'time',
        'timetz',
        'interval',
        'name',
    ],
    number: ['int2', 'int4', 'int8', 'float4', 'float8', 'numeric', 'money', 'oid'],
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
};
function sanitizeName(name, prefix = '', splitters = ['_', '-']) {
    return name
        .split(new RegExp(splitters.join('|')))
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
        .replace(/^/, `${prefix}`);
}
exports.sanitizeName = sanitizeName;
function generateEnumMap(enums) {
    return enums.reduce((acc, curr) => {
        acc.set(curr.enum_name, curr.enum_value.split(','));
        return acc;
    }, new Map());
}
exports.generateEnumMap = generateEnumMap;
function writeToFile(path, content, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(path))
            fs.mkdirSync(path);
        const _path = path + `/${name}.ts`;
        fs.writeFileSync(_path, prettier.format(content.join(os_1.EOL), Object.assign(Object.assign({}, (yield prettier.resolveConfig(path))), { filepath: _path })));
    });
}
exports.writeToFile = writeToFile;
/**
 * Creates a file containing all database entities and their respective interfaces
 * @param {IDatabase<unknown, IClient>} db
 * @param {string} outputPath
 * @param {ITypesSchema} typesSchema
 * @void will write a file to the outputPath
 */
function main(db, outputPath, typesSchema = exports.defaultSchema, schema = 'public') {
    return __awaiter(this, void 0, void 0, function* () {
        const tables = yield (0, parsers_1.parseTableNames)(db, db_1.default.sql('select-table-names'), schema);
        const views = yield (0, parsers_1.parseTableNames)(db, db_1.default.sql('select-view-names'), schema);
        const enums = yield (0, parsers_1.getEnums)(db, db_1.default.sql('select-enum-names'), schema);
        const _enums = yield (0, parsers_1.parseEnumTypes)(enums);
        const _interfaces = (yield (0, parsers_1.parseInterfaces)(db, tables, db_1.default.sql('select-table-information'), generateEnumMap(enums), typesSchema, schema)).concat(yield (0, parsers_1.parseInterfaces)(db, views, db_1.default.sql('select-table-information'), generateEnumMap(enums), typesSchema, schema));
        const _customTypes = (0, parsers_1.parseCustomType)(typesSchema);
        try {
            yield writeToFile(outputPath, _enums.concat(_customTypes, _interfaces), 'types');
            console.info('Succesfully generated files in:', outputPath);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.main = main;
