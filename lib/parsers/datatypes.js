"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeParser = exports.enumType = exports.parseSchema = void 0;
const utilities_1 = require("../utilities");
function parseSchema(schema) {
    return Object.keys(schema).reduce((acc, curr) => {
        acc = schema[curr].reduce((_, _curr) => {
            if (curr === 'CustomTypes' && typeof _curr === 'object') {
                acc[_curr.name] = _curr.type;
            }
            // @ts-ignore
            acc[_curr] = curr;
            return acc;
        }, {});
        return acc;
    }, {});
}
exports.parseSchema = parseSchema;
function enumType(enums, type) {
    if (enums.has(type))
        return (0, utilities_1.sanitizeName)(type, 'E');
    if (enums.has(type.replace('_', '')))
        return `Array<${(0, utilities_1.sanitizeName)(type, 'E')}>`;
    console.info(`Cannot find type ${type}`);
    return 'unknown';
}
exports.enumType = enumType;
function typeParser(type, enums, schema) {
    switch (schema[type]) {
        case undefined:
            return enumType(enums, type);
        default:
            return schema[type];
    }
}
exports.typeParser = typeParser;
