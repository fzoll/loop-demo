import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getAllTasks, getTask, createTask, toggleTask, deleteTask, clearAll } from "./store.js";

describe("Task Store", () => {
  beforeEach(() => clearAll());

  describe("createTask", () => {
    it("creates a task with defaults", () => {
      const task = createTask("Buy milk");
      assert.equal(task.title, "Buy milk");
      assert.equal(task.priority, "medium");
      assert.equal(task.done, false);
      assert.ok(task.id);
    });

    it("creates a task with custom priority", () => {
      const task = createTask("Deploy hotfix", "high");
      assert.equal(task.priority, "high");
    });

    it("rejects empty title", () => {
      assert.throws(() => createTask(""), /Title is required/);
    });

    it("rejects invalid priority", () => {
      assert.throws(() => createTask("Test", "urgent"), /Priority must be/);
    });

    it("trims whitespace from title", () => {
      const task = createTask("  padded title  ");
      assert.equal(task.title, "padded title");
    });
  });

  describe("getAllTasks", () => {
    it("returns empty array initially", () => {
      assert.deepEqual(getAllTasks(), []);
    });

    it("returns all created tasks", () => {
      createTask("A");
      createTask("B");
      assert.equal(getAllTasks().length, 2);
    });
  });

  describe("getTask", () => {
    it("returns task by id", () => {
      const created = createTask("Find me");
      const found = getTask(created.id);
      assert.equal(found.title, "Find me");
    });

    it("returns null for missing id", () => {
      assert.equal(getTask(999), null);
    });
  });

  describe("toggleTask", () => {
    it("toggles done status", () => {
      const task = createTask("Toggle me");
      assert.equal(task.done, false);
      const toggled = toggleTask(task.id);
      assert.equal(toggled.done, true);
      const toggledBack = toggleTask(task.id);
      assert.equal(toggledBack.done, false);
    });

    it("returns null for missing task", () => {
      assert.equal(toggleTask(999), null);
    });
  });

  describe("deleteTask", () => {
    it("deletes existing task", () => {
      const task = createTask("Delete me");
      assert.equal(deleteTask(task.id), true);
      assert.equal(getTask(task.id), null);
    });

    it("returns false for missing task", () => {
      assert.equal(deleteTask(999), false);
    });
  });
});
