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
  const task = {
    id: nextId++,
    title: title.trim(),
    priority,
    done: false,
    createdAt: new Date().toISOString(),
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
