import * as test from "tape";
import { createAction, filterAction, } from "../src/action";
import { Reducer } from "../src/reducer";
import { of } from "rxjs";

test("createAction", (t) => {
  t.plan(3);

  const reducer: Reducer<string, string> = (s) => s.concat("abc");
  const actionA = createAction<string, string>("actionA", reducer);
  t.deepEqual(
    actionA("123"),
    {label: "actionA", reducer, payload: "123"},
    "should create action with reducer and payload",
  );

  const emptyActionA = createAction("emptyActionWithoutReducer");
  t.deepEqual(
    emptyActionA(),
    emptyActionA(),
    "two identical empty actions should be equal",
  );

  const emptyActionB = createAction();
  t.notDeepEqual(
    emptyActionA(),
    emptyActionB(),
    "two distinct empty actions should not be equal",
  );
});

test("filterAction", (t) => {
  t.plan(3);

  const actionA = createAction<string>();
  const actionB = createAction<string>((s) => s.concat("abc"));
  const actionC = createAction<string, string>();

  of(
    actionA(), actionB(), actionC("x"),
  ).pipe(
    filterAction(actionA),
  )
  .subscribe((p) =>
    t.equal(p, undefined, "should filter action without reducer and payload"),
  );

  of(
    actionA(), actionB(), actionC("x"),
  ).pipe(
    filterAction(actionB),
  )
  .subscribe((p) =>
    t.equal(p, undefined, "should filter action without payload"),
  );

  of(
    actionA(), actionB(), actionC("x"),
  ).pipe(
    filterAction(actionC),
  )
  .subscribe((p) =>
    t.equal(p, "x", "should filter action with payload"),
  );
});
