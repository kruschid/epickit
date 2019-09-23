import { BehaviorSubject, Observable, Subject } from "rxjs";
import { IAction } from "./action";
export declare type Epic<S, D = any> = (action$: Observable<IAction<S, any>>, state$: Observable<S>, dependencies: D) => Observable<IAction<S, any>>;
export declare type DispatchFn<S> = <P>(action: IAction<S, P>) => void;
export interface IEpicKit<S> {
    state$: BehaviorSubject<S>;
    action$: Subject<IAction<S>>;
    epic$: Observable<[IAction<S>, S]>;
    dispatch: DispatchFn<S>;
}
export declare const reduceState: <S>(action$: Observable<IAction<S, any>>, state$: Observable<S>) => Observable<[IAction<S, any>, S]>;
export declare const combineEpics: <S, D = any>(...epics: Epic<S, D>[]) => Epic<S, D>;
export declare const createEpicKit: <S, D>(initialState: S, epic?: Epic<S, any>, dependencies?: D | undefined) => IEpicKit<S>;
