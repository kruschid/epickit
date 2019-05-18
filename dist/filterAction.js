"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
var isSymbolArray = function (type) {
    return Array.isArray(type);
};
exports.filterAction = function (type) { return function (observable$) {
    return observable$.pipe(operators_1.filter(function (action) {
        return isSymbolArray(type)
            ? type.indexOf(action.type) >= 0
            : action.type === type;
    }));
}; };
//# sourceMappingURL=filterAction.js.map