import { BehaviorSubject, merge, Observable, Subject, queueScheduler} from "rxjs";
import {ignoreElements, map, mergeAll, share, tap, withLatestFrom, observeOn} from "rxjs/operators";

export type Reducer<S, P = any> = (state: S, payload: P) => S;
export type Epic<S = any, A extends IAction = IAction<S>, R extends IAction = IAction<S>> = (
  action$: Observable<A>,
  state$: Observable<S>,
) => Observable<R>;

export interface IAction <S = any, P = any> {
  type?: symbol;
  payload: P;
  reducer?: Reducer<S, P>;
}

export type DispatchFn<S> = (action: IAction<S>) => void;

export interface IEpicKit<S> {
  state$: BehaviorSubject<S>;
  action$: Subject<IAction<S>>;
  epic$: Observable<[S, IAction<S>]>;
  dispatch: DispatchFn<S>;
}

export const createAction = <S = any>(
  typeOrReducer: symbol | Reducer<S>,
  reducer?: Reducer<S>,
): IAction<S> => ({
  type: typeof typeOrReducer === "symbol" ? typeOrReducer : undefined,
  reducer: typeof typeOrReducer === "function" ? typeOrReducer : reducer,
  payload: undefined,
});

export const createActionWithPayload = <S, P>(
  typeOrReducer: symbol | Reducer<S, P>,
  reducer?: Reducer<S, P>,
) => (
  payload: P,
): IAction<S, P> => ({
  type: typeof typeOrReducer === "symbol" ? typeOrReducer : undefined,
  reducer: typeof typeOrReducer === "function" ? typeOrReducer : reducer,
  payload,
});

export const reduceState = <S, A extends IAction<S>>(
  state$: Observable<S>,
  action$: Observable<A>,
): Observable<[S, A]> =>
  action$.pipe(
    observeOn(queueScheduler),
    withLatestFrom(state$),
    map(([action, state]): [S, A] =>
      action.reducer
        ? [action.reducer(state, action.payload), action]
        : [state, action],
    ),
  );

export const connectEpics = <S>(
  state$: Observable<S>,
  action$: Observable<IAction<S>>,
  epics: Array<Epic<S>>,
): Observable<IAction<S>> =>
  merge(
    epics.map((epic) =>
      epic(action$, state$),
    ))
  .pipe(mergeAll());

export const createEpicKit = <S>(initialState: S, epics: Array<Epic<S>> = []): IEpicKit<S> => {
  const queue: Array<IAction<S>> = [];
  let subscribed: boolean = false;
  const state$ = new BehaviorSubject<S>(initialState);
  const action$ = new Subject<IAction<S>>();

  const dispatch: DispatchFn<S> = (action) =>
    subscribed ? action$.next(action) : queue.push(action);

  const dispatchQueue = () => {
    subscribed = true;
    queue.forEach(dispatch);
  };

  const epic$ = merge(
    reduceState(state$, action$).pipe(
      tap(([state]) => state$.next(state)),
    ),
    connectEpics(state$, action$, epics).pipe(
      tap((action) => action$.next(action)),
      ignoreElements(),
    ),
    Observable.create(dispatchQueue),
  )
  .pipe(
    share(),
  );

  return {
    state$,
    action$,
    epic$,
    dispatch,
  };
};
