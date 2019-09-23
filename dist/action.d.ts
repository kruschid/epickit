import { OperatorFunction } from "rxjs";
import { Reducer } from "./reducer";
export interface IAction<S = unknown, P = unknown> {
    label: string;
    reducer: Reducer<S, P>;
    payload: P;
}
export interface IActionCreator<S, P = undefined> {
    (...[payload]: P extends undefined ? [] : [P]): IAction<S, P>;
    reducer: Reducer<S, P>;
    label: string;
}
export declare const createAction: <S, P = undefined>(...[maybeReducerOrLabel, maybeReducer]: [] | [string] | [Reducer<S, P>] | [string, Reducer<S, P>]) => IActionCreator<S, P>;
export declare const filterAction: <S, P>(actionCreator: IActionCreator<S, P>) => OperatorFunction<IAction<S, any>, P>;
