#!/usr/bin/env -S deno --allow-net --allow-read --allow-write --allow-env

import serveAPI from "../src/api/serve.ts";

await serveAPI();
