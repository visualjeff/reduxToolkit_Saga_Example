import { configureStore, createSlice } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, fork, put, takeEvery } from "redux-saga/effects";

const initialState = { count: 0 };
const exampleSlice = createSlice({
  name: "example",
  initialState,
  reducers: {
    // RTK uses Immer to make sure the reducers don't mutate.  Source looks like its mutating but its not.
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

const { increment, decrement } = exampleSlice.actions; // Slice produces actions

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: exampleSlice.reducer, // Slice produces reducers
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware)
});

store.subscribe(() => {
  console.log(`store current state: ${JSON.stringify(store.getState())}`);
});

// Use of a Promise for async example
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Our worker Saga: use Generator to perform the async increment task
function* incrementAsync() {
  yield delay(1000);
  yield put(increment(1)); // Put communicates with the store
}

// Our worker Saga: use Generator to perform the async increment task
function* decrementAsync() {
  yield delay(2000);
  yield put(decrement(1)); // Put communicates with the store
}

function* saga1() {
  // takeEvery allows concurrency, while takeLatest does not allow concurrency
  return yield takeEvery("INCREMENT_ASYNC", incrementAsync);
}

function* saga2() {
  // takeEvery allows concurrency, while takeLatest does not allow concurrency
  return yield takeEvery("DECREMENT_ASYNC", decrementAsync);
}

// Aggregates multiple Sagas to a single entry point for the sagaMiddleware to run.
function* rootSaga() {
  // all is blocking.  Use fork if you want non-blocking
  yield all([saga1(), saga2()]);
  // yield all([ fork(saga1), fork(saga2)]);
}

// Start up sagaMiddleware
sagaMiddleware.run(rootSaga);

store.dispatch({ type: "INCREMENT_ASYNC" });
store.dispatch({ type: "INCREMENT_ASYNC" });
store.dispatch({ type: "DECREMENT_ASYNC" });
