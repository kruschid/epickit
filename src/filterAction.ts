import { filter } from "rxjs/operators";
import { IAction } from "./epickit";
import { Observable } from "rxjs";

const isSymbolArray = (type: symbol | symbol[]): type is symbol[] =>
  Array.isArray(type);

export const filterAction = <P, S = any>(
  type: symbol | symbol[],
) => (observable$: Observable<IAction<S, P>>) =>
  observable$.pipe(
    filter((action) =>
      isSymbolArray(type)
        ? type.indexOf(action.type!) >= 0
        : action.type === type,
    ),
  );
