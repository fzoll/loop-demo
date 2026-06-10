const tasks = new Map();
let nextId = 1;

export function getAllTasks() {
  return [...tasks.values()];
}

export function getTask(id) {
  return tasks.get(id) ?? null;
}

export function createTask(title, priority = "medium") {
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Title is required and must be a non-empty string");
  }
  const validPriorities = ["low", "medium", "high"];
  if (!validPriorities.includes(priority)) {
    throw new Error(`Priority must be one of: ${validPriorities.join(", ")}`);
  }
  // BUG: no max length validation on title — accepts megabytes of text
  const task = {
    id: nextId++,
    title: title.trim(),
    priority,
    done: false,
    createdAt: new Date().toISOString(),
    // BUG: no updatedAt field — after toggle, no way to know when it was last modified
  };
  tasks.set(task.id, task);
  return task;
}

export function toggleTask(id) {
  const task = tasks.get(id);
  if (!task) return null;
  task.done = !task.done;
  return task;
}

export function deleteTask(id) {
  return tasks.delete(id);
}

export function clearAll() {
  tasks.clear();
  nextId = 1;
}
