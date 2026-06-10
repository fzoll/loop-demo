import { createServer } from "node:http";
import { getAllTasks, getTask, createTask, toggleTask, deleteTask } from "./store.js";

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // Health check
  if (path === "/health" && method === "GET") {
    return json(res, 200, { status: "ok", taskCount: getAllTasks().length });
  }

  // GET /tasks
  if (path === "/tasks" && method === "GET") {
    const filter = url.searchParams.get("done");
    let tasks = getAllTasks();
    if (filter === "true") tasks = tasks.filter((t) => t.done);
    if (filter === "false") tasks = tasks.filter((t) => !t.done);
    return json(res, 200, tasks);
  }

  // GET /tasks/:id
  const taskMatch = path.match(/^\/tasks\/(\d+)$/);
  if (taskMatch && method === "GET") {
    const task = getTask(Number(taskMatch[1]));
    if (!task) return json(res, 404, { error: "Task not found" });
    return json(res, 200, task);
  }

  // POST /tasks
  if (path === "/tasks" && method === "POST") {
    try {
      const { title, priority } = await parseBody(req);
      const task = createTask(title, priority);
      return json(res, 201, task);
    } catch (err) {
      return json(res, 400, { error: err.message });
    }
  }

  // PATCH /tasks/:id/toggle
  const toggleMatch = path.match(/^\/tasks\/(\d+)\/toggle$/);
  if (toggleMatch && method === "PATCH") {
    const task = toggleTask(Number(toggleMatch[1]));
    if (!task) return json(res, 404, { error: "Task not found" });
    return json(res, 200, task);
  }

  // DELETE /tasks/:id
  if (taskMatch && method === "DELETE") {
    const deleted = deleteTask(Number(taskMatch[1]));
    if (!deleted) return json(res, 404, { error: "Task not found" });
    return json(res, 204, null);
  }

  json(res, 404, { error: "Not found" });
}

const PORT = process.env.PORT || 3456;

const server = createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Task API running on http://localhost:${PORT}`);
});

export { server };
