# Development environment

Use the existing `devenv.nix` and `devenv.lock`. Run every project tool with
`devenv shell <command>`; a shell does not persist between tool calls.
Install dependencies with `devenv shell pnpm install --frozen-lockfile`.
Run `devenv shell pnpm exec tsc --noEmit`, `devenv shell pnpm test`, and
`devenv shell pnpm build` for relevant changes. Do not install global tools.
If devenv cannot start, report the actual error and the checks not run.
