#!/usr/bin/env node
/**
 * Stops dev servers (Next, Vite, tsx watch) left running from earlier
 * `pnpm dev` sessions. Only Node processes whose command line contains this
 * project's folder are touched, so other apps on the machine are safe.
 */
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const self = process.pid;

function findProcesses() {
  if (process.platform === "win32") {
    const script =
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | " +
      "ForEach-Object { \"$($_.ProcessId)`t$($_.CommandLine)\" }";
    const out = execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '\\"')}"`, {
      encoding: "utf8",
    });
    return out.split(/\r?\n/).filter(Boolean).map((line) => {
      const [pid, ...cmd] = line.split("\t");
      return { pid: Number(pid), cmd: cmd.join("\t") };
    });
  }
  const out = execSync("ps -eo pid=,args=", { encoding: "utf8" });
  return out.split("\n").filter(Boolean).map((line) => {
    const match = line.trim().match(/^(\d+)\s+(.*)$/);
    return { pid: Number(match?.[1]), cmd: match?.[2] ?? "" };
  });
}

const needle = root.toLowerCase();
const targets = findProcesses().filter(
  (p) => p.pid && p.pid !== self && p.cmd.toLowerCase().includes(needle) && !p.cmd.includes("stop-dev.mjs"),
);

let stopped = 0;
for (const { pid } of targets) {
  try {
    process.kill(pid, "SIGKILL");
    stopped += 1;
  } catch {
    // already exited
  }
}

console.log(
  stopped
    ? `Stopped ${stopped} leftover dev process${stopped === 1 ? "" : "es"}. Ports 3000, 4000 and 5173 are free.`
    : "No leftover dev servers found.",
);
