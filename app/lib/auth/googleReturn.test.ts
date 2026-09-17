import { expect, test } from "vitest";
import {
  GOOGLE_LOGIN_ERROR_MESSAGE,
  GOOGLE_OWNERSHIP_PROOF_MESSAGE,
  readGoogleReturnOutcome,
  removeGoogleReturnQuery,
} from "./googleReturn";

test("recognizes a successful linked-subject login", () => {
  expect(readGoogleReturnOutcome("?auth=google&status=success")).toEqual({ kind: "success" });
});

test("recognizes ownership proof without requiring the missing auth marker", () => {
  expect(readGoogleReturnOutcome("?status=resolution_required&resolution=opaque-value")).toEqual({
    kind: "resolution_required",
    message: GOOGLE_OWNERSHIP_PROOF_MESSAGE,
  });
});

test("returns an enumeration-safe message for Google errors", () => {
  expect(readGoogleReturnOutcome("?auth=google&status=error&code=PRIVATE_DETAIL")).toEqual({
    kind: "error",
    message: GOOGLE_LOGIN_ERROR_MESSAGE,
  });
});

test("ignores unrelated query parameters", () => {
  expect(readGoogleReturnOutcome("?status=error&code=unrelated")).toEqual({ kind: "none" });
});

test("removes callback and opaque resolution data while preserving unrelated parameters", () => {
  expect(
    removeGoogleReturnQuery(
      "?keep=1&auth=google&status=resolution_required&code=sensitive&resolution=opaque-value"
    )
  ).toBe("?keep=1");
});
