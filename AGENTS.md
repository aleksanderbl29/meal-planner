# Development environment

Use the existing devenv environment for every project command, including dependency
installation, builds, and checks: `devenv shell <command>`. Do not use global Node
or package managers as a fallback. Keep tools declarative in `devenv.nix` and
commit intentional lock changes.

See README.md for setup and check commands. Report environment failures and the
checks they block.

Preserve the Danish UI and existing visual style.
