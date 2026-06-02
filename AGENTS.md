# AGENTS.md - Project Context & Migration Guidelines

Welcome, AI coding assistant. This file defines the repository-level context, constraints, and standard operating procedures for the **Ocena Eyes Web** project.

---

## 1. Project Overview & Goal

The mission of this project is to build a modern, high-performance web application **ported from an existing Dart / Flutter codebase**. The ported web app must have absolute parity with the original Dart source code across:
1. **Functions**: Identical business logic, validation rules, state transitions, API calls, and calculations.
2. **Layout**: Identical spatial structure, alignment, responsive layout shifts, navigation, and spacing.
3. **Format**: Identical typography sizes, input styling, margins, paddings, borders, shadows, and interactive states.
4. **Theme**: Identical color palettes (light/dark themes), custom gradients, and brand assets.

---

## 2. Recommended Technology Stack

We follow standard, reliable, and convention-driven structures as outlined in our `planner` skill:
* **Frontend Core**: React 18+ (TypeScript)
* **Build System & Dev Server**: Vite (for rapid HMR and premium compilation)
* **Styling**: Vanilla CSS utilizing custom HSL properties (CSS variables) for high-performance design, harmony, and fluid layout control.
* **State Management**: React Context, `useReducer`, or localized custom hooks.
* **Testing Suite**: Vitest + React Testing Library (for unit and integration tests).

---

## 3. Migration Mapping Rules (Dart -> Web)

To ensure consistency and reliability, map Dart concepts to their Web equivalents as follows:

### A. Layout & UI Mapping

| Dart Widget | React / HTML Element | CSS Layout Pattern |
| :--- | :--- | :--- |
| `Scaffold` | `<main className="scaffold">` | `display: flex; flex-direction: column; min-height: 100vh;` |
| `AppBar` | `<header>` / `<nav>` | Fixed or sticky header; Flexbox with space-between. |
| `Column` | `<div>` / `<section>` | `display: flex; flex-direction: column;` |
| `Row` | `<div>` | `display: flex; flex-direction: row; align-items: center;` |
| `Stack` | `<div>` | `position: relative;` (children: `position: absolute;`) |
| `Container` | `<div>` | Controlled width, height, padding, margin, borders, box-shadow. |
| `Padding` | `<div>` or wrapper class | Applied `padding` or `margin` via CSS variables. |
| `SizedBox` | `<div>` / empty element | Margin or gap property (`gap: var(--spacing);`). |
| `ListView` / `GridView` | `<ul>` or `<div>` | CSS Grid (`grid-template-columns`) or Flexbox with `overflow-y: auto`. |

### B. Typography & Theme Translation
- **Color Parity**: Read Dart `ThemeData`, `Colors`, or hex codes (e.g., `0xFF123456`) and declare them as global CSS variables in `index.css`:
  ```css
  :root {
    --primary-color: #123456;
    --background-color: #f8f9fa;
    --text-primary: #212529;
    --border-radius: 8px;
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  ```
- **Font Parity**: Replicate Dart text styles (size, weight, spacing) using standard rem units and Google Fonts (e.g. Inter, Outfit) to maintain a modern, premium web aesthetic.

### C. Logical Parity
- **State Management**: Map Dart `StatefulWidget` / `Provider` / `Bloc` to React local state (`useState`, `useReducer`) or React Context for global app states.
- **Asynchronous Logic**: Translate Dart `Future` to JavaScript `Promise` / `async-await`. Map Dart `Stream` to RxJS, WebSockets, or EventListeners.
- **Model Validation**: Port Dart model classes to TypeScript standard interfaces and use runtime schema validation (e.g., Zod) to ensure data input matches.

---

## 4. Operational Commands

AI agents should use these standard commands within this workspace:
* **Install dependencies**: `npm install`
* **Run local dev server**: `npm run dev`
* **Run unit/component tests**: `npm run test`
* **Linter & Formatter validation**: `npm run lint` and `npm run format`
* **Production bundle build**: `npm run build`

---

## 5. Development Guardrails

1. **Keep Styles Separated**: Do not write inlined CSS styles or dynamic tailwind utilities unless asked. Use CSS modules or `index.css` global theme variables.
2. **Defensive Coding**: All network-facing services must use robust error boundaries, clear loading skeletons, and custom retry logic to prevent app crashes.
3. **No Unfinished Code**: Never leave empty stubs, unresolved TODOs, or speculative comments. Implement fully validated models.
