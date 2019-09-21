export declare type Reducer<S = unknown, P = undefined> = ReducerFunction<S, P> | ReducerObject<S, P>;
export declare type ReducerFunction<S = unknown, P = undefined> = ((state: S, payload: P) => S);
export declare type ReducerObject<S = unknown, P = undefined> = {
    [K in keyof S]?: S[K] extends object ? ReducerObject<S[K], P> | ReducerFunction<S[K], P> : ReducerFunction<S[K], P>;
};
export declare const invokeReducer: <S extends Record<string, any>, P>(state: S, reducer: Reducer<S, P>, payload: P) => S;
