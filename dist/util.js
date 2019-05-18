"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
// tslint:disable:no-console
exports.logStream = function (prefix) { return operators_1.tap(console.log.bind(console, prefix, "NEXT:"), console.error.bind(console, prefix, "ERROR:"), console.warn.bind(console, prefix, "COMPLETE")); };
//# sourceMappingURL=util.js.map