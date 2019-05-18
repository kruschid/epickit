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
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
exports.createAction = function (typeOrReducer, reducer) { return ({
    type: typeof typeOrReducer === "symbol" ? typeOrReducer : undefined,
    reducer: typeof typeOrReducer === "function" ? typeOrReducer : reducer,
    payload: undefined,
}); };
exports.createActionWithPayload = function (typeOrReducer, reducer) { return function (payload) { return ({
    type: typeof typeOrReducer === "symbol" ? typeOrReducer : undefined,
    reducer: typeof typeOrReducer === "function" ? typeOrReducer : reducer,
    payload: payload,
}); }; };
var isRootReducer = function (reducer) {
    return typeof reducer === "function";
};
exports.invokeReducer = function (state, payload, reducer) {
    return isRootReducer(reducer)
        ? reducer(state, payload)
        : Object.keys(reducer).reduce(function (acc, key) {
            var _a;
            return (__assign({}, acc, (_a = {}, _a[key] = exports.invokeReducer(state[key], payload, reducer[key]), _a)));
        }, state);
};
exports.reduceState = function (state$, action$) {
    return action$.pipe(operators_1.observeOn(rxjs_1.queueScheduler), operators_1.withLatestFrom(state$), operators_1.map(function (_a) {
        var action = _a[0], state = _a[1];
        return action.reducer
            ? [exports.invokeReducer(state, action.payload, action.reducer), action]
            : [state, action];
    }));
};
exports.connectEpics = function (state$, action$, epics) {
    return rxjs_1.merge(epics.map(function (epic) {
        return epic(action$, state$);
    }))
        .pipe(operators_1.mergeAll());
};
exports.createEpicKit = function (initialState, epics) {
    if (epics === void 0) { epics = []; }
    var queue = [];
    var subscribed = false;
    var state$ = new rxjs_1.BehaviorSubject(initialState);
    var action$ = new rxjs_1.Subject();
    var dispatch = function (action) {
        return subscribed ? action$.next(action) : queue.push(action);
    };
    var dispatchQueue = function () {
        subscribed = true;
        queue.forEach(dispatch);
    };
    var epic$ = rxjs_1.merge(exports.reduceState(state$, action$).pipe(operators_1.tap(function (_a) {
        var state = _a[0];
        return state$.next(state);
    })), exports.connectEpics(state$, action$, epics).pipe(operators_1.tap(function (action) { return action$.next(action); }), operators_1.ignoreElements()), rxjs_1.Observable.create(dispatchQueue))
        .pipe(operators_1.share());
    return {
        state$: state$,
        action$: action$,
        epic$: epic$,
        dispatch: dispatch,
    };
};
//# sourceMappingURL=epickit.js.map