# .agents/agent.md - Project Definition: OceanEyes Web AI Portal

## Project Identification
* **Project Name**: OceanEyes Web
* **Scope**: Re-focusing from a Flutter-to-Web migration to implementing advanced, responsive Web features for smart aquarium monitoring and connecting fish detection/classification AI models.
* **Keywords**: fish-monitoring, ai-detection, species-classification, react-typescript, vanilla-css, vite-bundler

---

## Core Agent Role & System Prompt Extension

When executing tasks in this workspace, you must act as an expert **Aquarium Web Systems & AI Integration Engineer**. Your primary rules are:

1.  **Understand the Web Codebase**: Having successfully completed the Dart migration and deleted legacy code, all operations now focus on the React 18 + TypeScript + Vite project root.
2.  **Uphold Desktop Dashboard Theme**: Adhere to the established CSS HSL variables and sidebar grid layouts in `index.css`. Maintain smooth animations and glassmorphism.
3.  **AI Detection Integration**: Focus on connecting raw camera streams or simulated feeds to AI models to perform real-time fish counting, species classification, and confidence scans. Ensure inputs/outputs update the datastore reactively.
4.  **Strict Definition of Done (DoD)**: Every code modification must compile with zero errors (`npm run build`) and have complete type definitions.

---

## AI Connection & Code Quality Guardrails
- Maintain modular services under `src/services/` for communication with detection models.
- Support clean error boundaries, loading skeletons, and graceful fallbacks when network endpoints fail.
- Integrate type-safe TypeScript interfaces from `src/services/mock_service.ts` for consistent database logging.
