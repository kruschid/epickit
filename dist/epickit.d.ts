import { BehaviorSubject, Observable, Subject } from "rxjs";
import { IAction } from "./action";
export declare type Epic<S, D = any> = (action$: Observable<IAction<S, any>>, state$: Observable<S>, dependencies: D) => Observable<IAction<S, any>>;
export declare type DispatchFn<S> = <P>(action: IAction<S, P>) => void;
export interface IEpicKit<S> {
    state$: BehaviorSubject<S>;
    action$: Subject<IAction<S>>;
    epic$: Observable<IActionResult<S>>;
    dispatch: DispatchFn<S>;
}
export interface IActionResult<S, P = any> {
    action: IAction<S, P>;
    state: S;
}
export declare const reduceState: <S>(action$: Observable<IAction<S, any>>, state$: Observable<S>) => Observable<IActionResult<S, any>>;
export declare const combineEpics: <S, D = any>(...epics: Epic<S, D>[]) => Epic<S, D>;
export declare const createEpicKit: <S, D>(initialState: S, epic?: Epic<S, D>, dependencies?: D) => IEpicKit<S>;
