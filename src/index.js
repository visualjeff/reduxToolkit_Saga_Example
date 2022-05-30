import { configureStore, createSlice } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, call, put, takeEvery, takeLatest } from "redux-saga/effects";

const initialState = { count: 0, posts: [] };
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
    },
    setPost: (state, action) => {
      console.log(`setPosts action: ${JSON.stringify(action)}`);
      state.posts.push(...state.posts, action.payload);
    }
  }
});

// Slice produces actions
export const { increment, decrement, setPost } = exampleSlice.actions;

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  // Slice produces reducers
  reducer: exampleSlice.reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware)
});

store.subscribe(() => {
  console.log(`store current state: ${JSON.stringify(store.getState())}`);
});

// Use of a Promise for async example
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchData = async (value) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${value}`
  );
  const data = await response.json();
  return data;
};

// Our worker Saga: use Generator to perform the async increment task
export function* incrementAsync() {
  yield delay(1000);
  yield put(increment(1)); // Put communicates with the store
}

// Our worker Saga: use Generator to perform the async increment task
export function* decrementAsync() {
  yield delay(2000);
  yield put(decrement(1)); // Put communicates with the store
}

export function* getPost({ payload }) {
  const resp = yield call(fetchData, payload.value);
  yield put(setPost(resp));
}

export function* saga1() {
  // takeEvery allows concurrency, while takeLatest does not allow concurrency
  return yield takeEvery("INCREMENT_ASYNC", incrementAsync);
}

export function* saga2() {
  // takeEvery allows concurrency, while takeLatest does not allow concurrency
  return yield takeEvery("DECREMENT_ASYNC", decrementAsync);
}

export function* saga3() {
  // takeEvery allows concurrency, while takeLatest does not allow concurrency
  //console.log(action);
  return yield takeLatest("GET_POST", getPost);
}

// Aggregates multiple Sagas to a single entry point for the sagaMiddleware to run.
export function* rootSaga() {
  // all is blocking.  Use fork if you want non-blocking
  yield all([saga1(), saga2(), saga3()]);
  // yield all([ fork(saga1), fork(saga2)]);
}

// Start up sagaMiddleware
sagaMiddleware.run(rootSaga);

// Start dispatching actions, playing with count then make a service call.
store.dispatch({ type: "INCREMENT_ASYNC" }); // 1 second delay
store.dispatch({ type: "INCREMENT_ASYNC" }); // 1 second delay
store.dispatch({ type: "DECREMENT_ASYNC" }); // 2 second delay

// Dispatch a service can with parameter
store.dispatch({ type: "GET_POST", payload: { value: 3 } });
