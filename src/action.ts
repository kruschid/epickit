import { Observable, OperatorFunction } from "rxjs";
import { filter, map } from "rxjs/operators";
import { Reducer } from "./reducer";

export interface IAction<S = unknown, P = unknown>{
  label: string;
  reducer: Reducer<S, P>;
  payload: P;
}

export interface IActionCreator<S, P = undefined> {
  (...[payload]: P extends undefined ? [] : [P]): IAction<S, P>;
  reducer: Reducer<S, P>;
  label: string;
}

export const createAction = <S, P = undefined>(
  ...[maybeReducerOrLabel, maybeReducer]: [] | [string] | [Reducer<S, P>] | [string, Reducer<S, P>]
): IActionCreator<S, P> => {
  maybeReducer =
    typeof maybeReducerOrLabel !== "string"
      ? maybeReducerOrLabel
      : maybeReducer;
  const reducer = maybeReducer ? maybeReducer : ((s: S, _: P) => s);
  const label = typeof maybeReducerOrLabel === "string" ? maybeReducerOrLabel : "";

  return Object.assign<
    (...[payload]: P extends undefined ? [] : [P]) => IAction<S, P>,
    { reducer: Reducer<S, P>; label: string; }
  >(
    (...[p]) => ({label, reducer, payload: p as P}),
    {reducer, label}
  );
};

export const filterAction = <S, P>(
  actionCreator: IActionCreator<S, P>
): OperatorFunction<IAction<S, any>, P> => (
  observable$,
): Observable<P> =>
  observable$.pipe(
    filter((a): a is IAction<S, P> =>
      a.reducer === actionCreator.reducer,
    ),
    map<IAction<S, P>, P>((a) => a.payload),
  );
