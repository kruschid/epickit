import { take, toArray, tap, ignoreElements, mapTo } from "rxjs/operators";
import * as test from "tape";
import { of, asapScheduler, zip } from "rxjs";

import { createEpicKit, Epic, combineEpics, reduceState, IActionResult} from "../src/epickit";
import { createAction, filterAction } from "../src/action";

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
      {action: add(3), state: {counter: 4}},
      "should apply action on state",
    );
  });
});

test("combineEpics", (t) => {
  t.plan(3);

  const dependencies = {
    effect: () => t.pass("should call sideeffect")
  };

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

  const epicSpyC: Epic<IState, typeof dependencies> = (
    action$, _, {effect},
  ) =>
    zip(
      action$.pipe(filterAction(add)),
      action$.pipe(filterAction(inc)),
    ).pipe(
      tap(() => effect()),
      ignoreElements(),
    );

  combineEpics<IState, typeof dependencies>(epicSpyA, epicSpyB, epicSpyC)(
    of(add(5), inc()),
    of(initialState),
    dependencies,
  )
  .subscribe();
});

test("createEpicKit", (t) => {
  t.plan(4);

  // initial state
  createEpicKit(initialState).state$.subscribe((state) =>
    t.deepEqual(state, initialState, "should emit initial state on subscribe"),
  );

  // dependencies
  const dependencies = {
    effect: () => t.pass("should call sideeffect")
  };
  const epicSpy: Epic<IState, typeof dependencies> = (_, state$, {effect}) =>
    state$.pipe(
      tap(() => effect()),
      ignoreElements(),
    );

  createEpicKit(initialState, epicSpy, dependencies)
  .epic$
  .subscribe();

  // queueing
  const expectedActions: IActionResult<IState>[] = [
    {action: inc(), state: {counter: 2}},
    {action: inc(), state: {counter: 3}},
    {action: add(7), state: {counter: 10}},
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
        { action: inc(), state: {counter: 2}},
        { action: add(7), state: {counter: 9}},
        { action: inc(), state: {counter: 10}},
        { action: add(7), state: {counter: 17}},
      ],
      "actions should match expected action",
    ),
  );
});
