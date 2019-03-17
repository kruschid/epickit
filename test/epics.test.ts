import { toArray, take, mergeMap, mapTo, takeUntil, distinctUntilChanged } from "rxjs/operators";
import * as test from "tape";
import { of, empty, interval, timer, merge} from "rxjs";

import { createAction, createActionWithPayload, createEpicKit, IAction, Epic} from "../src/epickit";
import { filterAction } from "../src/filterAction";

interface IState {
  counter: number;
}
const initialState: IState = {
  counter: 1,
};

// nested example
const INCREMENT = Symbol("INCREMENT");
const increment: IAction<IState> = createAction<IState>(INCREMENT, {
  counter: (oldCounter) => oldCounter + 1,
});

// root reducer example
const ADD_TO_COUNTER = Symbol("ADD_TO_COUNTER");
const addToCounter = createActionWithPayload<IState, number>(ADD_TO_COUNTER, (s, p) => ({
  counter: s.counter + p,
}));

const START_COUNTING = Symbol("START_COUNTING");
const startCounting = createAction(START_COUNTING);

const STOP_COUNTING = Symbol("STOP_COUNTING");
const stopCounting = createAction(STOP_COUNTING);

const counterControllerEpic: Epic<IState> = (_, state$) =>
  merge(
    timer(0).pipe(mapTo(startCounting)),
    state$.pipe(
      distinctUntilChanged(),
      mergeMap(({counter}) =>
        counter >= 3
         ? of(stopCounting)
         : empty(),
      ),
    ),
  );

const countEpic: Epic<IState> = (action$) =>
  action$.pipe(
    filterAction(START_COUNTING),
    mergeMap(() =>
      interval(100).pipe(
        mapTo(increment),
        takeUntil(action$.pipe(filterAction(STOP_COUNTING))),
      ),
    ),
  );

test("should emit initial state on subscribe", (t) =>  {
  t.plan(1);

  createEpicKit(initialState).state$.subscribe((state) =>
    t.deepEqual(state, initialState, "state should match initial state"),
  );
});

test("should dispatch queued actions", (t) => {
  t.plan(1);

  const {epic$, dispatch} = createEpicKit(initialState);

  dispatch(increment);
  dispatch(increment);
  dispatch(addToCounter(7));

  const expectedActions: Array<[IState, IAction<IState>]> = [
    [{counter: 2}, increment],
    [{counter: 3}, increment],
    [{counter: 10}, addToCounter(7)],
  ];

  epic$.pipe(
    take(expectedActions.length),
    toArray(),
  )
  .subscribe((actions) =>
    t.deepEqual(actions, expectedActions, "actions should match expected actions"),
  );
});

test("should subscribe to multiple epics", (t) => {
  t.plan(1);

  const expectedActions: Array<[IState, IAction<IState>]> = [
    [{counter: 1}, startCounting],
    [{counter: 2}, increment],
    [{counter: 3}, increment],
    [{counter: 3}, stopCounting],
  ];

  createEpicKit(initialState, [countEpic, counterControllerEpic])
  .epic$
  .pipe(
    takeUntil(timer(1000)),
    toArray(),
  )
  .subscribe((actions) =>
    t.deepEqual(actions, expectedActions, "actions should match expected action"),
  );
});

test("should dispatch queued actions to epics", (t) => {
  t.plan(1);

  const expectedActions: Array<[IState, IAction<IState>]> = [
    [{counter: 2}, increment],
    [{counter: 2}, startCounting],
    [{counter: 3}, increment],
    [{counter: 3}, stopCounting],
  ];

  const {epic$, dispatch} = createEpicKit(initialState, [counterControllerEpic, countEpic]);

  dispatch(increment);

  epic$.pipe(
    takeUntil(timer(1000)),
    toArray(),
  )
  .subscribe((actions) =>
    t.deepEqual(actions, expectedActions, "actions should match expected actions"),
  );
});
