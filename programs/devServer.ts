#!/usr/bin/env -S deno run --unstable --allow-run --allow-read --allow-env --allow-write --allow-net

import shell from "./helpers/shell.ts";
import { bundlerLocation, dir as frontendDir } from "../frontend/meta.ts";
import serveAPI from "../backend/serveAPI.ts";

const serveAPIPromise = serveAPI();

const bundlerDevServerPromise = shell.run(
  "deno",
  "run",
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--unstable",
  `${bundlerLocation}/spa_server_cli.ts`,
  `${frontendDir}/index.html`,
  `--config=${frontendDir}/tsconfig.json`,
);

try {
  await Promise.all([
    serveAPIPromise,
    bundlerDevServerPromise,
  ]);
} catch (error) {
  console.error(error.stack);
  Deno.exit(1);
}
