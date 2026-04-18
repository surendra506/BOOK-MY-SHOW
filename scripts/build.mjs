import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(join(root, "public"), join(dist, "public"), { recursive: true });
await cp(join(root, "assists"), join(dist, "assists"), { recursive: true });
await cp(join(root, "server.mjs"), join(dist, "server.mjs"));
await cp(join(root, "README.md"), join(dist, "README.md"));

const packageJson = {
  name: "ipl-ticket-booking",
  version: "1.0.0",
  private: true,
  type: "module",
  scripts: {
    start: "node server.mjs"
  },
  description: "Production build for the IPL ticket booking web application."
};

await writeFile(join(dist, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);

console.log("Build complete: dist/");
