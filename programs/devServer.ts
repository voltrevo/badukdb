#!/usr/bin/env -S deno run --allow-run --allow-read

import shell from "./helpers/shell.ts";
import { bundlerLocation, dir as frontendDir } from "../frontend/meta.ts";

await shell.run(
  "deno",
  "run",
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--unstable",
  `${bundlerLocation}/spa_server_cli.ts`,
  `${frontendDir}/index.html`,
);
