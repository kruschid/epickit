import { BehaviorSubject, merge, Observable, Subject, queueScheduler, empty } from "rxjs";
import { ignoreElements, map, share, tap, withLatestFrom, observeOn } from "rxjs/operators";
import { IAction } from "./action";
import { invokeReducer } from "./reducer";

export type Epic<S, D = any> = (
  action$: Observable<IAction<S, any>>,
  state$: Observable<S>,
  dependencies: D,
) => Observable<IAction<S, any>>;

export type DispatchFn<S> = <P>(action: IAction<S, P>) => void;

export interface IEpicKit<S> {
  state$: BehaviorSubject<S>;
  action$: Subject<IAction<S>>;
  epic$: Observable<[IAction<S>, S]>;
  dispatch: DispatchFn<S>;
}

export const reduceState = <S>(
  action$: Observable<IAction<S, any>>,
  state$: Observable<S>,
): Observable<[IAction<S, any>, S]> =>
  action$.pipe(
    observeOn(queueScheduler),
    withLatestFrom(state$),
    map(([action, state]) =>
      [action, invokeReducer(state, action.reducer, action.payload)]
    ),
  );

export const combineEpics = <S, D = any>(
  ...epics: Array<Epic<S>>
): Epic<S, D> => (
  action$,
  state$,
  dependencies,
): Observable<IAction<S>> =>
  merge(...epics.map((epic) =>
    epic(action$, state$, dependencies),
  ));

export const createEpicKit = <S, D>(
  initialState: S,
  epic: Epic<S> = () => empty(),
  dependencies?: D
): IEpicKit<S> => {
  const queue: Array<IAction<S, any>> = [];
  let subscribed: boolean = false;
  const state$ = new BehaviorSubject<S>(initialState);
  const action$ = new Subject<IAction<S, any>>();

  const dispatch: DispatchFn<S> = <P>(
    action: IAction<S, P>,
  ) =>
    subscribed ? action$.next(action) : queue.push(action);

  const dispatchQueue = () => {
    subscribed = true;
    queue.forEach((a) => action$.next(a));
  };

  const epic$ = merge(
    reduceState(action$, state$).pipe(
      tap(([, state]) => state$.next(state)),
    ),
    epic(action$, state$, dependencies).pipe(
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
