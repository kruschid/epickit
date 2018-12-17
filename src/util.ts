import { tap } from "rxjs/operators";

// tslint:disable:no-console
export const logStream = <T>(prefix: string) => tap<T>(
  console.log.bind(console, prefix, "NEXT:"),
  console.error.bind(console, prefix, "ERROR:"),
  console.warn.bind(console, prefix, "COMPLETE"),
);
