# How to Contribute

Government employees, members of the public, and the private sector are encouraged to contribute to this repository!

## Contribution Licensing

Unless otherwise noted, you retain copyright in your contribution and agree that any contribution submitted for inclusion in this repository is provided under the same license terms that apply to this project. See [`LICENSE`](LICENSE) for details.

## Local Development & Testing

To make local development and quality control as seamless as possible, we leverage standard npm scripts:

1. **One-Time Setup:** Run `npm install` to grab dev dependencies.
2. **Start Development Server:** Run `npm run dev` to serve the application locally on `http://localhost:8000`.
3. **Validate Code Quality:** Run `npm run validate` to run ESLint 10+, Prettier format checks, and Node unit tests.
4. **Run Integration Tests:** Run `npm run test` to execute both unit and Playwright E2E tests.

## Git Workflow Strategy

We strictly follow a structured Git workflow to keep our history clean and reviewable:

1. **Branch off the right base.**
   - An issue labeled `EXPERIMENTAL BRANCH ONLY` targets the single open pull request labeled `DEMO`. Stop unless this returns exactly one pull request. Branch from its `headRefName` and open the pull request against that branch:
     ````bash
     gh pr list --repo bcgov/nr-seedtransfer-map --state open --label DEMO --json number,headRefName
     ````
   - Any other issue branches off a fresh `main`, and the pull request targets `main`:
     ````bash
     git checkout main && git pull
     git switch -c feat/my-awesome-improvement
     ````
2. **External contributors (forks):** Fork the repository, clone your fork, and add this repository as `upstream`. Create your branch from the base selected in step 1 (`main`, or the `headRefName` of the single open pull request labeled `DEMO`). Push the branch to your fork and open the pull request against that same base.
3. **Commit changes using Conventional Commits:** Ensure your commit messages match the Conventional Commit format (e.g., `feat(ui): add loading spinner` or `chore(hygiene): establish templates`).
