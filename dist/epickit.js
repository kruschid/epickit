"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var reducer_1 = require("./reducer");
exports.reduceState = function (action$, state$) {
    return action$.pipe(operators_1.observeOn(rxjs_1.queueScheduler), operators_1.withLatestFrom(state$), operators_1.map(function (_a) {
        var action = _a[0], state = _a[1];
        return ({
            action: action,
            state: reducer_1.invokeReducer(state, action.reducer, action.payload),
        });
    }));
};
exports.combineEpics = function () {
    var epics = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        epics[_i] = arguments[_i];
    }
    return function (action$, state$, dependencies) {
        return rxjs_1.merge.apply(void 0, epics.map(function (epic) {
            return epic(action$, state$, dependencies);
        }));
    };
};
exports.createEpicKit = function (initialState, epic, dependencies) {
    if (epic === void 0) { epic = function () { return rxjs_1.empty(); }; }
    if (dependencies === void 0) { dependencies = {}; }
    var queue = [];
    var subscribed = false;
    var state$ = new rxjs_1.BehaviorSubject(initialState);
    var action$ = new rxjs_1.Subject();
    var dispatch = function (action) {
        return subscribed ? action$.next(action) : queue.push(action);
    };
    var dispatchQueue = function () {
        subscribed = true;
        queue.forEach(function (a) { return action$.next(a); });
    };
    var epic$ = rxjs_1.merge(exports.reduceState(action$, state$).pipe(operators_1.tap(function (_a) {
        var state = _a.state;
        return state$.next(state);
    })), epic(action$, state$, dependencies).pipe(operators_1.tap(function (action) { return action$.next(action); }), operators_1.ignoreElements()), rxjs_1.Observable.create(dispatchQueue))
        .pipe(operators_1.share());
    return {
        state$: state$,
        action$: action$,
        epic$: epic$,
        dispatch: dispatch,
    };
};
//# sourceMappingURL=epickit.js.map