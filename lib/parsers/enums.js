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
exports.getEnums = exports.parseEnumTypes = void 0;
const utilities_1 = require("../utilities");
function parseEnumTypes(enums) {
    return __awaiter(this, void 0, void 0, function* () {
        return enums.map((e) => {
            const enumName = (0, utilities_1.sanitizeName)(e.enum_name, 'E');
            const enumValues = e.enum_value.split(',').map((x) => x.trim().replace(/ /g, '_'));
            return `export enum ${enumName} {
		${enumValues.map((value) => `"${value}" = '${value.trim()}'`).join(',\n')}
		}`;
        });
    });
}
exports.parseEnumTypes = parseEnumTypes;
function getEnums(db, query) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield db.manyOrNone(query));
    });
}
exports.getEnums = getEnums;
