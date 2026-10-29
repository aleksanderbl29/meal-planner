# Development environment

Use the existing devenv environment for every project command:
`devenv shell <command>`. Do not install tools globally.

Install dependencies with `devenv shell pnpm install --frozen-lockfile`.
Run `devenv shell pnpm exec tsc --noEmit` and `devenv shell pnpm build`
before submitting changes.

Keep UI text Danish and follow the existing components and visual style.
