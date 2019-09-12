import * as test from "tape";
import { Reducer, invokeReducer } from "../src/reducer";

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

test("invokeReducer", (t) => {
  t.plan(3);

  const addDateA: Reducer<IState, Date> = (s, d) => ({
    ...s,
    dates: {
      list: s.dates.list.concat(d),
    },
  });

  t.deepEqual(
    invokeReducer(initialState, addDateA, new Date(0)),
    {dates: {list: [new Date(0)]}, updates: []},
    "should invoke root reducer",
  );

  const addDateB: Reducer<IState, Date> = {
    dates: (s, p) => ({
      list: s.list.concat(p),
    }),
  };

  t.deepEqual(
    invokeReducer(initialState, addDateB, new Date(123)),
    {dates: {list: [new Date(123)]}, updates: []},
    "should invoke nested reducer",
  );

  const addDateC: Reducer<IState, Date> = {
    dates: {
      list: (s, p) => s.concat(p),
    },
    updates: (s) => s.concat(new Date(777)),
  };

  t.deepEqual(
    invokeReducer(initialState, addDateC, new Date(33)),
    {dates: {list: [new Date(33)]}, updates: [new Date(777)]},
    "invokeReducer should invoke multiple nested reducers",
  );
});
