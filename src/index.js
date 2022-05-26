import { configureStore, createSlice } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, put, takeEvery } from "redux-saga/effects";

const initialState = { count: 0 };
const environmentSlice = createSlice({
  name: "environments",
  initialState,
  reducers: {
    increment: (state, action) => {
      console.log(`increment action: ${JSON.stringify(action)}`);
      state.count = state.count + action.payload;
    },
    decrement: (state, action) => {
      console.log(`decrement action: ${JSON.stringify(action)}`);
      state.count = state.count - action.payload;
    }
  }
});

export const { increment, decrement } = environmentSlice.actions;

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: environmentSlice.reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware)
});

store.subscribe(() => {
  console.log(`store current state: ${JSON.stringify(store.getState())}`);
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
// Our worker Saga: will perform the async increment task
function* incrementAsync() {
  yield delay(1000);
  yield put(increment(1));
}

// Our worker Saga: will perform the async increment task
function* decrementAsync() {
  yield delay(1000);
  yield put(decrement(1));
}

function* saga1() {
  return yield takeEvery("INCREMENT_ASYNC", incrementAsync);
}

function* saga2() {
  return yield takeEvery("DECREMENT_ASYNC", decrementAsync);
}

function* rootSaga() {
  yield all([saga1(), saga2()]);
}

sagaMiddleware.run(rootSaga);

store.dispatch({ type: "INCREMENT_ASYNC" });
store.dispatch({ type: "INCREMENT_ASYNC" });
store.dispatch({ type: "DECREMENT_ASYNC" });
