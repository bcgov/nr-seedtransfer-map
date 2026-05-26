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

1. **Always branch off a fresh main:**
   ````bash
   git checkout main && git pull
   ````
2. **Create a descriptive branch:** Use a branch type prefix (e.g., `feat/` or `chore/`):
   ````bash
   git switch -c feat/my-awesome-improvement
   ````
3. **Submit a Pull Request:**
   - **Internal Contributors (Push Access):** Push your branch directly to this repository and open a Pull Request pointing back to `main`.
   - **External Contributors (Forks):** Fork the repository, clone your fork locally, create your branch from an up-to-date `main`, push the branch to your fork, and open a Pull Request from your fork's branch to this repository's `main`.
4. **Commit changes using Conventional Commits:** Ensure your commit messages match the Conventional Commit format (e.g., `feat(ui): add loading spinner` or `chore(hygiene): establish templates`).
