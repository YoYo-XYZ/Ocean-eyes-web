---
name: planner
description: Helps the agent plan, organize, and choose standard/reliable methods to scaffold and build programming projects.
version: 1.0.0
author: Antigravity
---

# Planner Skill: Task Organization & Conventional Project Building

This skill guides the agent to plan, decompose, and execute software projects using the most reliable, conventional, and industry-standard practices. By invoking this skill, you ensure that codebase architectures are robust, maintainable, properly tested, and easy to build.

---

## 1. Project Planning & Task Organization

Before writing code for any project, follow a structured planning flow to decompose objectives into manageable, sequential steps.

### A. Core Architecture Design
- **Understand the Goal**: Identify the primary value proposition, system boundaries, and target user experience.
- **Identify Key Entities & Flow**: Draft a high-level model/entity schema and data flow before implementing services.
- **Deconstruct into Components**: Break the app down into decoupled layers (e.g., UI/Frontend, API/Backend, Database/Storage, Business Logic, Utilities).

### B. Dependency-Ordered Roadmapping
Create a structured roadmap in a `task.md` file located in the workspace artifacts directory. Sequence tasks logically based on dependencies (least-dependent layers first):
1. **Infrastructure & Shared Configs**: `.gitignore`, Linters (`eslint`, `ruff`), Compilers/Bundlers (`tsconfig.json`, `vite.config.ts`), and Package Manifests (`package.json`, `pyproject.toml`).
2. **Core Data Models & Interfaces**: Define schemas, types, and database/storage wrappers.
3. **Core Utility/Business Logic**: Core functional libraries that have no external framework dependencies.
4. **Backend Services & API Layer**: Server endpoints, routing, controllers.
5. **Frontend/UI Components**: Reusable components, state management, and page layouts.
6. **Integration & Final Polish**: End-to-end user flows, final styling, error boundary handling, and performance tuning.

### C. Task Breakdown Format
Each task item in `task.md` must be granular, highly actionable, and specify its **Definition of Done (DoD)**:
- Good: `[ ] Create User schema validation using Zod and write unit tests for valid/invalid user models.`
- Bad: `[ ] Build user profile page.`

---

## 2. Choosing Conventional & Reliable Build Stacks

Always default to widely adopted, production-ready, and highly maintained technologies. Avoid obscure frameworks, unmaintained packages, or overly complex configurations unless explicitly requested.

### A. Recommended Technology Matrix

| Project Category | Preferred Stack | Bundler/Build System | Package/Dep Manager | Linting & Formatting |
| :--- | :--- | :--- | :--- | :--- |
| **Web Apps (Modern)** | Next.js or React + TS | Vite | `npm` / `pnpm` | ESLint + Prettier |
| **Web Apps (Simple)** | Semantic HTML5 + Vanilla JS | Native / Vite | `npm` | Prettier |
| **Python Backend** | FastAPI or Flask | - | `poetry` or `pipenv` | Ruff / Black |
| **Python Scripts** | Pure Python 3.10+ | - | `pip` + `requirements.txt` | Ruff |
| **System/Backend** | Go (native toolchain) | `go build` | Go Modules | `gofmt` + `golangci-lint` |
| **High Performance** | Rust | Cargo | Cargo | `cargo fmt` + `clippy` |

### B. Standard Directory Structures

#### 📂 Node / React / TypeScript Project (Vite-based)
```text
my-app/
├── .github/workflows/    # CI pipelines
├── public/               # Static assets (favicons, manifest)
├── src/
│   ├── assets/           # Images, SVGs, fonts
│   ├── components/       # Reusable UI components (Button, Modal)
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Layout wrappers (Sidebar, Dashboard)
│   ├── pages/            # View components mapped to routes
│   ├── services/         # API clients / third-party integrations
│   ├── utils/            # Helper functions / formatters
│   ├── App.tsx           # Root component
│   ├── index.css         # Tailwind or global variables/themes
│   └── main.tsx          # Application entry point
├── tests/                # Component & unit tests
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

#### 📂 Python Project (Poetry-based)
```text
my-project/
├── .github/workflows/
├── docs/                 # Documentation
├── src/
│   └── my_project/       # Main package directory
│       ├── __init__.py
│       ├── core/         # Business logic & configurations
│       ├── api/          # Route handlers / controllers
│       ├── models/       # Database schemas & validation models
│       └── main.py       # Application entry point
├── tests/
│   ├── conftest.py       # Shared test fixtures
│   └── test_*.py         # Unit & integration tests
├── .gitignore
├── pyproject.toml        # Dependencies and tool configurations
└── README.md
```

---

## 3. Reliable Coding & Quality Standards

To keep projects clean, secure, and robust, adhere to these development standards:

### A. Environment Configuration
- Never hardcode credentials, keys, or endpoints.
- Always use a `.env.example` template file with dummy values.
- Load variables securely using standard libraries (e.g., `dotenv` in Node, `python-dotenv` or `pydantic-settings` in Python).

### B. Defensive Programming & Error Handling
- **TypeScript**: Enable `strict: true` in `tsconfig.json`. Avoid `any`. Prefer explicit interfaces and type guards.
- **Python**: Use type hints (`typing` module) extensively. Leverage `mypy` for static analysis.
- **Error Boundaries**: Wrap network calls, file systems, and external APIs in explicit `try-catch` or `try-except` blocks.
- **User Experience**: Always provide user-friendly error messages, loading indicators, and graceful fallbacks when requests fail.

### C. Quality Assurance (QA) Checklist
Before completing any task, ensure:
1. **Linting and Formatting**: Run the project's linter and formatter. The codebase should compile/build with zero warnings or errors.
2. **Automated Tests**:
   - Write unit tests for all core business logic and utility functions.
   - Run the test suite and ensure a 100% pass rate.
3. **Manual Validation**: Test critical flows manually (e.g., verify in browser, run API requests using curl/Postman, examine logs).
