#!/usr/bin/env -S deno run --allow-run --allow-read

import shell from "./helpers/shell.ts";
import webDir from "../src/web/dir.ts";

// Deno.chdir(webDir);

await shell.run(
  "deno",
  "run",
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--unstable",
  "https://deno.land/x/bundler@0.8.1/spa_server_cli.ts",
  `${webDir}/index.html`,
);
