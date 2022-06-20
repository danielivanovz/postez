"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInterfaces = void 0;
const utilities_1 = require("../utilities");
const datatypes_1 = require("./datatypes");
function parseInterfaces(db, tableNamesCollection, selectInformationSchema, enums, _schema) {
    return __awaiter(this, void 0, void 0, function* () {
        const typeSchema = (0, datatypes_1.parseSchema)(_schema);
        return yield Promise.all(tableNamesCollection.map((tableName) => __awaiter(this, void 0, void 0, function* () {
            const schema = (yield db.manyOrNone(selectInformationSchema, {
                table_name: tableName,
            }));
            const currInterface = schema.reduce((acc, curr) => {
                const type = (0, datatypes_1.typeParser)(curr.udt_name, enums, typeSchema);
                const name = curr.column_name;
                acc[name] = type + (curr.is_nullable === 'NO' ? '' : ' | null');
                return acc;
            }, {});
            const interfaceName = (0, utilities_1.sanitizeName)(tableName, 'Table');
            return `export interface ${interfaceName} {
			${Object.keys(currInterface)
                .map((key) => `${key}: ${currInterface[key]}`)
                .join('\n')}
			}`;
        })));
    });
}
exports.parseInterfaces = parseInterfaces;
