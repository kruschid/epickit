import { IAction } from "./epickit";
import { Observable } from "rxjs";
export declare const filterAction: <P, S = any>(type: symbol | symbol[]) => (observable$: Observable<IAction<S, P>>) => Observable<IAction<S, P>>;
