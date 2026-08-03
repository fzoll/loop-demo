import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError, NotFoundError, ValidationError } from "./errors.js";
import { errorHandler } from "./middleware/errorHandler.js";

function mockRes() {
  return {
    statusCode: null,
    headers: null,
    body: null,
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
  };
}

describe("AppError", () => {
  it("sets message and statusCode", () => {
    const err = new AppError("Something broke", 418);
    assert.equal(err.message, "Something broke");
    assert.equal(err.statusCode, 418);
    assert.ok(err instanceof Error);
  });
});

describe("NotFoundError", () => {
  it("defaults to 404 with default message", () => {
    const err = new NotFoundError();
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, "Not found");
    assert.ok(err instanceof AppError);
  });

  it("accepts a custom message", () => {
    const err = new NotFoundError("Task not found");
    assert.equal(err.message, "Task not found");
    assert.equal(err.statusCode, 404);
  });
});

describe("ValidationError", () => {
  it("defaults to 400 with default message", () => {
    const err = new ValidationError();
    assert.equal(err.statusCode, 400);
    assert.equal(err.message, "Validation failed");
    assert.ok(err instanceof AppError);
  });

  it("accepts a custom message", () => {
    const err = new ValidationError("Title is required");
    assert.equal(err.message, "Title is required");
    assert.equal(err.statusCode, 400);
  });
});

describe("errorHandler", () => {
  it("returns the error's statusCode and message for AppError instances", () => {
    const res = mockRes();
    errorHandler(new NotFoundError("Task not found"), res);
    assert.equal(res.statusCode, 404);
    assert.deepEqual(JSON.parse(res.body), { error: "Task not found", statusCode: 404 });
  });

  it("returns 500 for unknown errors", () => {
    const res = mockRes();
    errorHandler(new Error("boom"), res);
    assert.equal(res.statusCode, 500);
    assert.deepEqual(JSON.parse(res.body), { error: "Internal Server Error", statusCode: 500 });
  });

  it("logs the error to console", () => {
    const res = mockRes();
    const original = console.error;
    let logged = null;
    console.error = (err) => (logged = err);
    try {
      const err = new ValidationError("bad input");
      errorHandler(err, res);
      assert.equal(logged, err);
    } finally {
      console.error = original;
    }
  });
});
