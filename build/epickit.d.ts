import { BehaviorSubject, Observable, Subject } from "rxjs";
export declare type Reducer<S, P = any> = (state: S, payload: P) => S;
export declare type Epic<S = any, A extends IAction = IAction<S>, R extends IAction = IAction<S>> = (action$: Observable<A>, state$: Observable<S>) => Observable<R>;
export interface IAction<S = any, P = any> {
    type?: symbol;
    payload: P;
    reducer?: Reducer<S, P>;
}
export declare type DispatchFn<S> = (action: IAction<S>) => void;
export interface IEpicKit<S> {
    state$: BehaviorSubject<S>;
    action$: Subject<IAction<S>>;
    epic$: Observable<[S, IAction<S>]>;
    dispatch: DispatchFn<S>;
}
export declare const createAction: <S = any>(typeOrReducer: symbol | Reducer<S, any>, reducer?: Reducer<S, any> | undefined) => IAction<S, any>;
export declare const createActionWithPayload: <S, P>(typeOrReducer: symbol | Reducer<S, P>, reducer?: Reducer<S, P> | undefined) => (payload: P) => IAction<S, P>;
export declare const reduceState: <S, A extends IAction<S, any>>(state$: Observable<S>, action$: Observable<A>) => Observable<[S, A]>;
export declare const connectEpics: <S>(state$: Observable<S>, action$: Observable<IAction<S, any>>, epics: Epic<S, IAction<S, any>, IAction<S, any>>[]) => Observable<IAction<S, any>>;
export declare const createEpicKit: <S>(initialState: S, epics?: Epic<S, IAction<S, any>, IAction<S, any>>[]) => IEpicKit<S>;
