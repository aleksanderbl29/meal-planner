import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const output = mkdtempSync(join(tmpdir(), "meal-planner-tests-"))
try {
  execFileSync(process.execPath, [resolve("node_modules/typescript/bin/tsc"),
    "tests/similar-meals.test.ts", "--outDir", output, "--module", "commonjs",
    "--target", "es2022", "--esModuleInterop", "--strict", "--skipLibCheck"], { stdio: "inherit" })
  execFileSync(process.execPath, ["--test", join(output, "tests/similar-meals.test.js")], { stdio: "inherit" })
} finally {
  rmSync(output, { recursive: true, force: true })
}
