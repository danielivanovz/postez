"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postez = void 0;
const utilities_1 = require("./utilities");
function postez(db, path, typesSchema, schema) {
    return (0, utilities_1.main)(db, path, typesSchema, schema);
}
exports.postez = postez;
