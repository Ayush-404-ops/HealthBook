# Contributing to HealthBook

Thank you for your interest in contributing to HealthBook! This document provides guidelines and instructions for contributing to this open-source project.

---

## 1. Getting Started

### Fork and Clone

1. Fork the repository on GitHub by clicking the **Fork** button in the upper right corner of the repository page.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/HealthBook.git
   cd HealthBook
   ```
3. Set the upstream remote to stay synchronized with the main project:
   ```bash
   git remote add upstream https://github.com/Ayush-404-ops/HealthBook.git
   ```

---

## 2. Environment Setup

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **MongoDB**: Local MongoDB instance (`mongod`) running on port `27017` or a MongoDB Atlas connection string.

### Backend Setup (`server/`)

1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in `.env` with appropriate values. At minimum:
   - `JWT_SECRET` (required)
   - `MONGO_URI` (defaults to `mongodb://127.0.0.1:27017/healthbook`)
   - `PORT` (defaults to `5000` or `5001`)
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup (`client/`)

1. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## 3. Running Tests and Checks

Before submitting any code, verify all tests and linters pass:

- **Server Unit Tests**:
  ```bash
  cd server
  npm test
  ```
- **Client Build Validation**:
  ```bash
  cd client
  npm run build
  ```
- **Client Code Style & Linting**:
  ```bash
  cd client
  npm run lint
  ```
  HealthBook uses **oxlint** for fast, standards-compliant JavaScript and React linting. Ensure all errors are resolved before opening a PR.

---

## 4. Branch Naming Conventions

Create a dedicated feature or bugfix branch for your work. Use the following prefixes:

- `feat/` — New features or functional enhancements (e.g., `feat/patient-history-filter`)
- `fix/` — Bug fixes or stability improvements (e.g., `fix/slot-hold-race-condition`)
- `docs/` — Documentation updates and hygiene (e.g., `docs/api-guide`)
- `test/` — Adding or refactoring unit/integration tests
- `chore/` — Build tasks, package updates, or configuration adjustments

Example:
```bash
git checkout -b feat/slot-release-webhook
```

---

## 5. Commit Message Guidelines

We follow standard Conventional Commits:

```text
<type>(<scope>): <short imperative description>

[optional body explaining rationale and context]
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Guidelines**:
  - Keep commits small, atomic, and focused on a single logical change.
  - Write messages in the imperative mood (e.g., "add hold timeout" not "added hold timeout").
  - Do not commit secrets, environment `.env` files, or test upload artifacts.

---

## 6. How to Open a Pull Request

1. Fetch and rebase your branch on the latest `upstream/main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Push your branch to your fork:
   ```bash
   git push origin <your-branch-name>
   ```
3. Open a Pull Request on GitHub targeting `main`.
4. Fill out the PR template checklist:
   - [ ] Unit tests pass (`npm test` in `server/`)
   - [ ] Client builds cleanly (`npm run build` in `client/`)
   - [ ] Linting passes with 0 errors (`npm run lint` in `client/`)
   - [ ] No secrets or sensitive keys are committed
   - [ ] Documentation has been updated as appropriate
5. Respond constructively to code review feedback.
