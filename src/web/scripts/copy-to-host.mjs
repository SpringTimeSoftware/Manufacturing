import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(root, "..");
const distRoot = resolve(webRoot, "dist");
const hostWwwroot = resolve(webRoot, "..", "server", "STS.Mfg.Host", "wwwroot");

if (!existsSync(distRoot)) {
  throw new Error(`Web build output not found: ${distRoot}`);
}

mkdirSync(hostWwwroot, { recursive: true });
rmSync(hostWwwroot, { recursive: true, force: true });
mkdirSync(hostWwwroot, { recursive: true });
cpSync(distRoot, hostWwwroot, { recursive: true });
