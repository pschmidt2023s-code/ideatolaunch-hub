import { spawn } from "node:child_process";
import process from "node:process";

const port = process.env.PORT ?? "4173";

const child = spawn(
  process.execPath,
  ["./node_modules/vite/bin/vite.js", "preview", "--host", "0.0.0.0", "--port", port],
  { stdio: "inherit" }
);

child.on("exit", (code) => process.exit(code ?? 0));