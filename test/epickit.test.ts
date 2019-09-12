import { take, toArray, tap, ignoreElements, mapTo } from "rxjs/operators";
import * as test from "tape";
import { of, asapScheduler } from "rxjs";

import { createEpicKit, Epic, combineEpics, reduceState} from "../src/epickit";
import { createAction, filterAction, IAction } from "../src/action";

interface IState {
  counter: number;
}
const initialState: IState = {
  counter: 1,
};

// object reducer example
const inc = createAction<IState>("increment", {
  counter: (oldCounter) => oldCounter + 1,
});

// functional reducer example
const add = createAction<IState, number>("add", (s, p) => ({
  counter: s.counter + p,
}));

test("reduceState", (t) => {
  t.plan(1);

  reduceState(
    of(add(3)),
    of(initialState),
  )
  .subscribe((result) => {
    t.deepEqual(
      result,
      [add(3), {counter: 4}],
      "should apply action on state",
    );
  });
});

test("combineEpics", (t) => {
  t.plan(2);

  const epicSpyA: Epic<IState> = (action$) =>
    action$.pipe(
      filterAction(inc),
      tap((p) => t.equal(p, undefined, "should not emit payload")),
      ignoreElements(),
    );
  
  const epicSpyB: Epic<IState> = (action$) =>
    action$.pipe(
      filterAction(add),
      tap((p) => t.deepEqual(p, 5, "should emit payload")),
      ignoreElements(),
    );

  combineEpics<IState>(epicSpyA, epicSpyB)(
    of(add(5), inc()),
    of(initialState)
  )
  .subscribe();
});

test("createEpicKit", (t) => {
  t.plan(3);

  // initial state
  createEpicKit(initialState).state$.subscribe((state) =>
    t.deepEqual(state, initialState, "should emit initial state on subscribe"),
  );

  // queueing
  const expectedActions: Array<[IAction<IState, any>, IState]> = [
    [inc(), {counter: 2}],
    [inc(), {counter: 3}],
    [add(7), {counter: 10}],
  ];
  const {epic$, dispatch} = createEpicKit(initialState);
  dispatch(inc());
  dispatch(inc());
  epic$.pipe(
    take(expectedActions.length),
    toArray(),
  )
  .subscribe((actions) =>
    t.deepEqual(actions, expectedActions, "should dispatch queued actions"),
  );
  dispatch(add(7)); // dispatches one after subscribing

  // action dispatched by epics
  const epicA: Epic<IState> = () => of(inc(), inc(), asapScheduler);
  const epicB: Epic<IState> = (action$) =>
    action$.pipe(
      filterAction(inc),
      mapTo(add(7)),
    );
  createEpicKit(initialState, combineEpics(epicA, epicB))
  .epic$
  .pipe(
    take(4),
    toArray(),
  )
  .subscribe((actions) =>
    t.deepEqual(
      actions,
      [
        [inc(), {counter: 2}],
        [add(7), {counter: 9}],
        [inc(), {counter: 10}],
        [add(7), {counter: 17}],
      ],
      "actions should match expected action",
    ),
  );
});
