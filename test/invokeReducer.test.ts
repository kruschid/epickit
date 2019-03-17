import * as test from "tape";
import { invokeReducer, Reducer } from "../src/epickit";

interface IState {
  dates: {
    list: Date[];
  };
  updates: Date[];
}
const initialState: IState = {
  dates: {
    list: [],
  },
  updates: [],
};

test("#invokeReducer applies flat & nested reducers", (t) => {
  t.plan(3);

  const addDateA: Reducer<IState, Date> = (s, d) => ({
    ...s,
    dates: {
      list: s.dates.list.concat(d),
    },
  });

  t.deepEqual(
    invokeReducer(initialState, new Date(0), addDateA),
    {dates: {list: [new Date(0)]}, updates: []},
    "invokeReducer should invoke root reducer",
  );

  const addDateB: Reducer<IState, Date> = {
    dates: (s, p) => ({
      list: s.list.concat(p),
    }),
  };

  t.deepEqual(
    invokeReducer(initialState, new Date(123), addDateB),
    {dates: {list: [new Date(123)]}, updates: []},
    "invokeReducer should invoke nested reducer",
  );

  const addDateC: Reducer<IState, Date> = {
    dates: {
      list: (s, p) => s.concat(p),
    },
    updates: (s) => s.concat(new Date(777)),
  };

  t.deepEqual(
    invokeReducer(initialState, new Date(33), addDateC),
    {dates: {list: [new Date(33)]}, updates: [new Date(777)]},
    "invokeReducer should invoke multiple nested reducers",
  );
});
