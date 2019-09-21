"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
exports.createAction = function () {
    var _a = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        _a[_i] = arguments[_i];
    }
    var maybeReducerOrLabel = _a[0], maybeReducer = _a[1];
    maybeReducer =
        typeof maybeReducerOrLabel !== "string"
            ? maybeReducerOrLabel
            : maybeReducer;
    var reducer = maybeReducer ? maybeReducer : (function (s, _) { return s; });
    var label = typeof maybeReducerOrLabel === "string" ? maybeReducerOrLabel : "";
    return function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var payload = _a[0];
        return ({
            label: label, reducer: reducer, payload: payload,
        });
    };
};
exports.filterAction = function (actionCreator) { return function (observable$) {
    return observable$.pipe(operators_1.filter(function (a) {
        return a.reducer === actionCreator.apply(void 0, []).reducer;
    }), operators_1.map(function (a) { return a.payload; }));
}; };
//# sourceMappingURL=action.js.map