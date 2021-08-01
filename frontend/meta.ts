import SourceDir from "../backend/helpers/SourceDir.ts";

export const dir = await SourceDir(import.meta.url);

export const bundlerLocation =
  "https://raw.githubusercontent.com/voltrevo/Bundler/bf741fe";
