# Agent instructions

## Branches

- An issue labeled `EXPERIMENTAL BRANCH ONLY` targets the open pull request labeled `DEMO`.
- Resolve that pull request with `gh pr list --repo bcgov/nr-seedtransfer-map --state open --label DEMO --json number,headRefName`.
- Exactly one result is valid. Its `headRefName` is the branch to create from and the pull request base.
- Zero results or more than one result: stop. Do not branch from `main` or from a hardcoded branch name.
- Any other issue branches from `origin/main`. Its pull request base is `main`.
- `.github/workflows/demo-deploy.yml` fails when the number of open pull requests labeled `DEMO` is not 1. That failure blocks the demo redirect.
