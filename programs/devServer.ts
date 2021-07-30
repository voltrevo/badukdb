#!/usr/bin/env -S deno run --allow-run --allow-read

import shell from "./helpers/shell.ts";
import webDir from "../frontend/dir.ts";
import { bundlerLocation } from "../frontend/deps.ts";

await shell.run(
  "deno",
  "run",
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--unstable",
  `${bundlerLocation}/spa_server_cli.ts`,
  `${webDir}/index.html`,
);
