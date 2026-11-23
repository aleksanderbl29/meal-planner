import assert from "node:assert/strict"

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3100"

for (const path of ["/missing-runtime-check.png", "/missing-runtime-check.css", "/missing-runtime-check.js"]) {
  const response = await fetch(new URL(path, baseUrl))
  const html = await response.text()
  assert.equal(response.status, 404, `${path} should return 404`)
  assert.ok(!html.includes("__next_error__"), `${path} should render without server errors`)
  assert.ok(!html.includes("Clerk: auth() was called"), `${path} should not require middleware`)
  assert.ok(html.includes("Måltidsplanlægger"), `${path} should preserve the Danish layout`)
  console.log(`PASS ${path}: clean 404`)
}

const asset = await fetch(new URL("/placeholder.svg", baseUrl))
assert.equal(asset.status, 200, "Existing static assets should still be served")
assert.match(asset.headers.get("content-type") || "", /image\/svg\+xml/)
console.log("PASS /placeholder.svg: existing asset served")
