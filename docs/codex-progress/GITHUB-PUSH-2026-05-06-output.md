# GitHub Push - 2026-05-06

## Prompt

Push all code to `https://github.com/SpringTimeSoftware/Manufacturing`.

## Current Status

- Started repository publication workflow.
- Local folder was not a Git repository at the start of this prompt.
- Target GitHub repository was reachable and returned no refs from `git ls-remote`.
- GitHub CLI `gh` is not installed locally, so publication will use plain `git`.
- Initialized Git repository on branch `main`.
- Added repository remote `origin` as `https://github.com/SpringTimeSoftware/Manufacturing.git`.
- Added `.gitignore` to exclude local run folders, dependency caches, build outputs, logs, IIS publish artifacts, and packaged zip snapshots from source control.
- Excluded TypeScript incremental/config compiler outputs from the initial commit.
- Staged source, documentation, database scripts, deployment scripts, reference UI assets, web/mobile/server projects, and tests for the initial commit.
