#!/usr/bin/env -S deno run --allow-run --allow-read

import shell from "./helpers/shell.ts";
import frontendDir from "../frontend/dir.ts";

Deno.chdir(frontendDir);

await shell.run(
  "deno",
  "run",
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--unstable",
  "https://deno.land/x/bundler@0.8.1/cli.ts",
  "bundle",
  "-L",
  "debug",
  `index.html=index.html`,
);
