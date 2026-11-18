import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });

execFileSync("tsc", ["-p", "tsconfig.build.json"], { stdio: "inherit" });
execFileSync(
  "tsc-alias",
  [
    "-p",
    "tsconfig.build.json",
    "--resolve-full-paths",
    "--resolve-full-extension",
    ".js",
  ],
  { stdio: "inherit" },
);

mkdirSync("dist/styles", { recursive: true });
cpSync("src/styles/globals.css", "dist/styles/globals.css");
