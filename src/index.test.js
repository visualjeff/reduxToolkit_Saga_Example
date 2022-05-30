import { takeEvery } from "redux-saga/effects";
import { saga1, saga2, incrementAsync, decrementAsync } from ".";

const saga1Gen = saga1();
const saga2Gen = saga2();
const incrementAsyncGen = incrementAsync();
const decrementAsyncGen = decrementAsync();

test("increment saga test", () => {
  // saga should return correct action
  expect(saga1Gen.next().value).toEqual(
    takeEvery("INCREMENT_ASYNC", incrementAsync)
  );
});

test("increment saga test done", () => {
  // saga is done
  expect(saga1Gen.next().done).toBeTruthy();
});

test("decrement saga test", () => {
  // saga should return correct action
  expect(saga2Gen.next().value).toEqual(
    takeEvery("DECREMENT_ASYNC", decrementAsync)
  );
});

test("decrement saga test done", () => {
  // sata is done
  expect(saga2Gen.next().done).toBeTruthy();
});

test("test incrementAsync, payload should increment", () => {
  // delay
  incrementAsyncGen.next();
  // make sure we're sending the correct action to the store
  expect(incrementAsyncGen.next().value).toStrictEqual({
    "@@redux-saga/IO": true,
    combinator: false,
    payload: {
      action: { payload: 1, type: "example/increment" },
      channel: undefined
    },
    type: "PUT"
  });
});

test("test decrementAsync, payload should decrement", () => {
  // delay
  decrementAsyncGen.next();
  // make sure we're sending the correct action to the store
  expect(decrementAsyncGen.next().value).toStrictEqual({
    "@@redux-saga/IO": true,
    combinator: false,
    payload: {
      action: { payload: 1, type: "example/decrement" },
      channel: undefined
    },
    type: "PUT"
  });
});
