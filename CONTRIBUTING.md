# How to Contribute

Government employees, members of the public, and the private sector are encouraged to contribute to this repository!

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
2. **Create a descriptive feature/chore branch:** Use Conventional Commit prefixes (e.g., `feat/` or `chore/`):
   ````bash
   git switch -c feat/my-awesome-improvement
   ````
3. **Submit a Pull Request:** Push to your feature branch and open a PR pointing back to `main`.
