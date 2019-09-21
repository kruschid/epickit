"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeReducer = function (state, reducer, payload) {
    return isReducerFunction(reducer)
        ? reducer(state, payload)
        : Object.keys(reducer).reduce(function (acc, key) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[key] = exports.invokeReducer(state[key], reducer[key], payload), _a)));
        }, state);
};
var isReducerFunction = function (reducer) {
    return typeof reducer === "function";
};
//# sourceMappingURL=reducer.js.map