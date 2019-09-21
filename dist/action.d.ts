import { OperatorFunction } from "rxjs";
import { Reducer } from "./reducer";
export interface IAction<S = unknown, P extends any = undefined> {
    label: string;
    reducer: Reducer<S, P>;
    payload: P;
}
export declare type ActionCreator<S, P extends any = undefined> = (...[payload]: P extends undefined ? [] : [P]) => IAction<S, P>;
export declare const createAction: <S, P extends any = undefined>(...[maybeReducerOrLabel, maybeReducer]: [] | [string] | [Reducer<S, P>] | [string, Reducer<S, P>]) => (...[payload]: P extends undefined ? [] : [P]) => IAction<S, P>;
export declare const filterAction: <S, P extends any>(actionCreator: ActionCreator<S, P>) => OperatorFunction<IAction<S, any>, P>;
