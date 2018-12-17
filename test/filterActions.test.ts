import * as test from "tape";
import { filterAction } from "../src/filterAction";
import { createAction, IAction } from "../src/epickit";
import { of, Observable } from "rxjs";
import { toArray } from "rxjs/operators";

const ACTION_A = Symbol("ACTION_A");
const actionA = createAction(ACTION_A);

const ACTION_B = Symbol("ACTION_B");
const actionB = createAction(ACTION_B);

test("#filterAction should filter actions by symbol", (t) => {
  t.plan(4);

  const cases: Array<[Observable<IAction>, symbol | symbol[], IAction[]]> = [
    [of(actionA, actionB), ACTION_B, [actionB]],
    [of(actionA, actionB), [ACTION_A], [actionA]],
    [of(actionA, actionB), [ACTION_A, ACTION_B], [actionA, actionB]],
    [of(actionA, actionB), Symbol("UNKNOWN"), []],
  ];

  cases.forEach(([stream, type, expectedResult], i) =>
    stream.pipe(
      filterAction(type),
      toArray(),
    )
    .subscribe((result) =>
      t.deepEqual(result, expectedResult, `result ${i} should match expected result`),
    ),
  );
});
