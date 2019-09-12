// import { createAction } from "../src/action"

// interface IState {
//   value: number;
//   countActions: number;
// }

// const initialState: IState = {
//   value: 0,
//   countActions: 0,
// }

// const a = createAction<IState, number>();

// dispatch(a, 5);

// const inc = createAction<IState>((s) => ({
//   value: s.value + 1,
//   countActions: s.countActions + 1,
// }));

// const add = createAction<IState, number>((s, p) => ({
//   value: s.value + p,
//   countActions: s.countActions + 1,
// }));

// dispatch(add, 5);
// dispatch(inc);

// const mult = createAction<IState, number>((s, p) => ({
//   value: s.value * p,
//   countActions: s.countActions,
// }));

// mult(4);