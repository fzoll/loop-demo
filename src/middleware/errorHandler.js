import { AppError } from "../errors.js";

export function errorHandler(err, res) {
  console.error(err);

  if (err instanceof AppError) {
    res.writeHead(err.statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message, statusCode: err.statusCode }));
    return;
  }

  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Internal Server Error", statusCode: 500 }));
}
