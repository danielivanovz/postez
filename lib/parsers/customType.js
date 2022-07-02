"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCustomType = void 0;
function parseCustomType(schema) {
    return schema.CustomTypes.map((x) => x.definition);
}
exports.parseCustomType = parseCustomType;
