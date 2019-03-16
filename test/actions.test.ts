import * as test from "tape";
import { createAction, createActionWithPayload, Reducer, IAction } from "../src/epickit";

test("should create actions", (t) => {
  t.plan(5);

  const type = Symbol("type");
  const payload = "payload";
  const reducer: Reducer<string> = (state) => state.concat("123");
  const reducerWithPayload: Reducer<string, string> = (state, p) => state.concat(p);

  const cases: Array<[IAction, IAction]> = [[
    // only type
    createAction<string>(type),
    {type, payload: undefined, reducer: undefined},
  ], [
    // type and payload
    createActionWithPayload<string, string>(type)(payload),
    {type, payload, reducer: undefined},
  ], [
    // type and reducer
    createAction<string>(type, reducer),
    {type, payload: undefined, reducer},
  ], [
    // type, payload and reducer
    createActionWithPayload<string, string>(type, reducerWithPayload)(payload),
    {type, payload, reducer: reducerWithPayload},
  ], [
    // payload and reducer
    createActionWithPayload<string, string>(reducerWithPayload)(payload),
    {type: undefined, payload, reducer: reducerWithPayload},
  ]];

  cases.forEach(([action, expectedAction]) => {
    t.deepEqual(action, expectedAction, "action should match expected action");
  });

});
