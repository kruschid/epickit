import { Observable, OperatorFunction } from "rxjs";
import { filter, map } from "rxjs/operators";
import { Reducer } from "./reducer";

export interface IAction<S = unknown, P extends any = undefined>{
  label: string;
  reducer: Reducer<S, P>;
  payload: P;
}

export type ActionCreator<S, P extends any = undefined> = (
  ...[payload]: P extends undefined ? [] : [P]
) => IAction<S, P>;

export const createAction = <S, P extends any = undefined>(
  ...[maybeReducerOrLabel, maybeReducer]: [] | [string] | [Reducer<S, P>] | [string, Reducer<S, P>]
) => {
  maybeReducer =
    typeof maybeReducerOrLabel !== "string"
      ? maybeReducerOrLabel
      : maybeReducer;
  const reducer = maybeReducer ? maybeReducer : ((s: S, _: P) => s);
  const label = typeof maybeReducerOrLabel === "string" ? maybeReducerOrLabel : "";

  return (
    ...[payload]: P extends undefined ? [] : [P]
  ): IAction<S, P> => ({
    label, reducer, payload,
  });
};

export const filterAction = <S, P extends any>(
  actionCreator: ActionCreator<S, P>
): OperatorFunction<IAction<S, any>, P> => (
  observable$: Observable<IAction<S, any>>,
): Observable<P> =>
  observable$.pipe(
    filter((a): a is IAction<S, P> =>
      a.reducer === actionCreator(...[] as any).reducer,
    ),
    map<IAction<S, P>, P>((a) => a.payload),
  );
