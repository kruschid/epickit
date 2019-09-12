export type Reducer<S = unknown, P = undefined> =
  | ReducerFunction<S, P>
  | ReducerObject<S, P>;

export type ReducerFunction<S = unknown, P = undefined> =
  | ((state: S, payload: P) => S);

export type ReducerObject<S = unknown, P = undefined> = {
  [K in keyof S]?: S[K] extends object
    ? ReducerObject<S[K], P> | ReducerFunction<S[K], P>
    : ReducerFunction<S[K], P>
}

export const invokeReducer = <S extends Record<string, any>, P>(
  state: S,
  reducer: Reducer<S, P>, 
  payload: P,
): S =>
  isReducerFunction(reducer)
  ? reducer(state, payload)
  : Object.keys(reducer).reduce<S>((acc, key) => ({
    ...acc,
    [key]: invokeReducer(
      state[key],
      reducer[key] as Reducer<S[keyof S], P>,
      payload,
    ),
  }), state);

const isReducerFunction = <S, P>(
  reducer: Reducer<S, P>,
): reducer is ReducerFunction<S, P> =>
  typeof reducer === "function";
