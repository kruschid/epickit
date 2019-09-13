# epickit

epickit is a state manager that utilises observable streams (rxjs) in order to facilitate state changes in context of async operations in your reactive application. It is meant to be used in your frontend, backend or any other type of applications (e.g. mobile apps, IoT-apps, edge agents, etc.).

[![CircleCI](https://circleci.com/gh/kruschid/epickit/tree/master.svg?style=svg)](https://circleci.com/gh/kruschid/epickit/tree/master)
[![codecov](https://codecov.io/gh/kruschid/react-epickit/branch/master/graph/badge.svg)](https://codecov.io/gh/kruschid/react-epickit)

## Introduction

_epickit_ requires a basic understanding of observable streams, ([RxJS v6](http://reactivex.io/rxjs/) to be more specific). This implementation and the API is very similar to [redux-observable](https://redux-observable.js.org) but without any dependency to redux 🎉.

## API

#### `createAction<State, Payload>(...args: CrateActionArgs) => (p?: Payload) => Action<State, Payload>`

An action creator facilitates definition and filtering of actions. An action is an interface with the following definition:

``` ts
interface IAction<State, Payload>{
  label: string;
  reducer: (s: State, p: payload) => s;
  payload: Payload;
}
```

Function overloading is utilisied in order to enable different signatures unter the same function name `createAction`. Basically we have three options to call `createAction`:

* `createAction([label: string])` with optional label for e.g. debugging and without any payload
* `createAction<State>([[label: string], reducer: Reducer<State>])` with reducer (read more about reducers in the next sections) 
* `createAction<State, Payload>([[label: string], reducer: Reducer<State, Payload>])` with optional reducer but required payload

`createAction` is a generic function that can be called without any types defined. This is sufficient in situation where you want to create an action that neither mutates the state nor carries any payload. If you want to mutate the state then you have to provide a reducer to `createAction`. If you provide a reducer then it's also required that you define the interface of the state object on which the reducer is going to be called e.g.

``` ts
// here our state is of type number
const inc = createAction<number>((counter) => counter + 1);

dispatch(inc());
// dispatch({label: "", reducer: (s) => s + 1, payload: undefined})
```

If you want to create an action with payload then you need to provide the second type parameter to `createAction`:

``` ts
const add = createAction<number, number>((counter, n) => counter + n);

dispatch(add(5));
// dispatch({label: "", reducer: (s, n) => s + n, payload: 5})
```

If you want to create an action that doesn't mutate the state but contains some payload then you can leave the reducer undefined:

``` ts
const sendNumber = createAction<any, number>();

dispatch(sendNumber(99));
// dispatch({label: "", reducer: (s) => s, payload: 99})
```

As you can see from the examples `createAction` doesn't directly return the expected action object when calling it. Instead it takes a intermediate step by returning another function that might take the payload as an argument depending on the type parameters you have provided to `createAction<State, Payload>`.

#### `Reducer<State, Payload>`

If comparing to the previous examples the following reducer use case is based on more realistic scenario with a state that is stored in a nested object:

``` ts
interface IState {
  users: IUser[],
  counter: {
    errors: string[];
    value: number;
  }
}

const inc = createAction<IState>((s) => ({
  ...s,
  counter: {
    ...s.counter,
    value: s.counter + 1,
  }
}));
```

Updating a nested property can be quite inconvenient when working with such nested object structures because you have to explicitly copy all the other properties from the old to your new state. So as an alternative to the flat reducers presented so far this library also supports nested reducers:

``` ts
const inc = createAction<IState>({
  counter: {
    value: (c) => c + 1,
  },
});

const addUser = createAction<IState, IUser>({
  users: (users, u) => [...users, u],
  counter: {
    value: (c) => c + 1,
  },
});
```

#### `combineEpics<State>(...epic: Array<Epic<State>>): Epic<State>`

Similar to redux-observable epickit also provides a utility that allows you to combine multiple epics into a single one.

``` ts
import {fetchDevices, fetchLogs} from "./epics";

export const epics = combineEpics(
  fetchDevices,
  fetchLogs,
);
```

#### `filterAction(a: ActionCreator<S, P>): OperatorFunction<IAction<S, any>, P>`

`filterAction` is an operator function that can be composed within a RxJS pipe in order to filter an observable stream of actions by an action creator. 

``` ts
const add = createAction<number, number>();
const inc = createAction<number>((c) => c + 1);

const addToCounterEpic: Epic<number> = (action$) =>
  action$.pipe(
    filterAction(add),
    mergeMap((n) =>
      from(Array(n).fill(undefined)),
    ),
    mapTo(inc()),
  );
```

What `addToCounterEpic` in the example above does is emitting the `inc()` action `n` times for every action of type `add(n)` that is received. For this the `filterAction` operator not only filters the `action$` stream by the corresponding action type. It also infers the payload type of the action and makes it available in the the subsequent `mergeMap((n: number) => ...)` operator where `n` corresponds.

Contrary to redux-observable epickit doesn't provide you filtering actions by providing multiple actions types. But you can achieve the same with the following pattern:

``` ts
const someEpic: Epic<S> = (action$) =>
  merge(
    action$.pipe(filterAction(add)),
    action$.pipe(filterAction(inc))
  );
```

Under the hood `filterAction` compares the reducers of two actions:

``` ts
const a = { label: "", reducer: ((s) => s + 1), payload: undefined };
const a = { label: "", reducer: ((s, p) => s + p), payload: undefined };
```

So reusing the same reducer breaks reliability of `filterAction`:

``` ts
const reducer = (s) => 1;
const actionA = createAction(reducer);
const actionB = createAction(reducer); // using same redicer twice is not recommended
```

#### `createEpicKit(...): {epic$, dispatch, state$, actions$}`
@todo

#### `dispatch(action: Action<State, Payload>): void`
@todo


## Full Example

The following fictive example contains of two actions `inc` that increments a counter and `add` which adds a number to the counter. Furthermore it defines an epic that reacts to these both actions in porder to perform a _debounced_ post request to an endpoint `/counter`. After a request has been finished the epic dispatches the action `log` for logging.   

``` ts

// definition of the application state
interface IState {
  counter: number;
  logs: string[];
}
const initialState: IState = {
  counter: 0,
  logs:[],
}

// actions with state reducer
const inc = createAction<IState>((s) => ({
  ...s,
  counter: s.counter + 1,
}));
// actions with reducer and payload
const add = createAction<IState, number>((s, n) => ({
  ...s,
  counter: s. counter + n,
}));
const log = createAction<IState, string>((s, m) => ({
  ...s,
  logs: [m, ...s.logs],
}));

// epic that makes an debounced request to endpoint "/counter"
// whenever "inc" or "add" action is being dispatched
// emits log action after each request 
const postCounterEpic: Epic<IState> = (action$, state$) =>
  merge(
    action$.pipe(filterAction(inc)),
    action$.pipe(filterAction(add)),
  )
  .pipe(
    debounceTime(2000),
    withLatestFrom(state$),
    mergeMap(([, state]) =>
      axios.post("/counter", state.counter),
    ),
    mapTo(log("counter uploaded")),
  );

const {dispatch, epic$} = createEpicKit(initialState, postCounterEpic);

// these actions will be queued
dispatch(inc());
dispatch(add(3));

// this starts the epic (queued actions will be flushed immediately)
const subscription = epic$.subscribe();

dispatch(add(-4));
dispatch(inc());

// this stops the epic after 5s
setTimeout(
  () => subscription.unsubscribe(),
  5000,
);
```
