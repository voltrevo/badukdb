#!/usr/bin/env -S deno run --allow-run --allow-read

import shell from "./helpers/shell.ts";
import frontendDir from "../frontend/dir.ts";
import { bundlerLocation } from "../frontend/deps.ts";

Deno.chdir(frontendDir);

await shell.run(
  "deno",
  "run",
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--unstable",
  `${bundlerLocation}/cli.ts`,
  "bundle",
  "-L",
  "debug",
  `index.html=index.html`,
);
