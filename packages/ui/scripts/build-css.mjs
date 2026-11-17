import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const packageDirectory = fileURLToPath(new URL("../", import.meta.url));
const inputFile = resolve(packageDirectory, "src/styles/globals.css");
const outputFile = resolve(packageDirectory, "dist/styles/globals.css");
const css = await readFile(inputFile, "utf8");

await mkdir(dirname(outputFile), { recursive: true });

const result = await postcss([tailwindcss()]).process(css, {
  from: inputFile,
  to: outputFile,
});

await writeFile(outputFile, result.css);
