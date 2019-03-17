import * as test from "tape";
import { createAction, createActionWithPayload, Reducer, IAction } from "../src/epickit";

test("should create actions", (t) => {
  t.plan(7);

  const TYPE = Symbol("type");
  const payload = "payload";
  const reducer: Reducer<string> = (state) => state.concat("123");
  const reducerWithPayload: Reducer<string, string> = (state, p) => state.concat(p);

  const cases: Array<[IAction, IAction]> = [[
    // only type
    createAction<string>(TYPE),
    {type: TYPE, payload: undefined, reducer: undefined},
  ], [
    // only type without explicit type
    createAction(TYPE),
    {type: TYPE, payload: undefined, reducer: undefined},
  ], [
    // only reducer
    createAction(reducer),
    {type: undefined, payload: undefined, reducer},
  ], [
    // type and reducer
    createAction(TYPE, reducer),
    {type: TYPE, payload: undefined, reducer},
  ], [
    // type and payload
    createActionWithPayload<string, string>(TYPE)(payload),
    {type: TYPE, payload, reducer: undefined},
  ], [
    // type, payload and reducer
    createActionWithPayload<string, string>(TYPE, reducerWithPayload)(payload),
    {type: TYPE, payload, reducer: reducerWithPayload},
  ], [
    // payload and reducer
    createActionWithPayload<string, string>(reducerWithPayload)(payload),
    {type: undefined, payload, reducer: reducerWithPayload},
  ]];

  cases.forEach(([action, expectedAction]) => {
    t.deepEqual(action, expectedAction, "action should match expected action");
  });

});
