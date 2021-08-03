#!/usr/bin/env -S deno run --allow-run --allow-read

import shell from "./helpers/shell.ts";
import { bundlerLocation, dir as frontendDir } from "../frontend/meta.ts";

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
  `--config=${frontendDir}/tsconfig.json`,
);
