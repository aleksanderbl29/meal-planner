# Development environment

Run project tools through `devenv shell <command>` for each invocation. The
existing `devenv.nix`, `devenv.yaml`, and `devenv.lock` define the environment.
Keep added tools and dependencies declarative.

Install dependencies with `devenv shell pnpm install --frozen-lockfile`.
Run checks with `devenv shell pnpm test` and `devenv shell pnpm exec tsc --noEmit`.
Run the production build with `devenv shell pnpm build`.
