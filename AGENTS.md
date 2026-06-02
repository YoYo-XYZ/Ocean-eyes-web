# AGENTS.md - OceanEyes Web: AI Fish Monitoring Portal

Welcome, AI coding assistant. This file defines the repository-level context, architecture, and standard operating procedures for the **OceanEyes Web** project.

---

## 1. Project Overview & Objective

The **OceanEyes** project is a modern, high-performance web dashboard designed to monitor smart aquariums. Having successfully migrated from a legacy Dart/Flutter application, the project is now fully web-native.

Our new objectives are:
1.  **Advance Web Diagnostics**: Enhance the full-screen desktop dashboard that displays real-time health metrics (pH, temperature, clarity, chemistry) and fish tables.
2.  **Integrate AI Detection & Classification**: Connect our fish detection and classification models to the active monitoring feeds to automate:
    - Counting live fish in camera viewports.
    - Classifying individual fish species (e.g. Neon Tetra, Guppy, Corydoras).
    - Tracking fish confidence scores and reporting visibility discrepancies in real-time.

---

## 2. Technology Stack & Directory Structure

*   **Frontend Core**: React 18+ (TypeScript)
*   **Build System & Bundler**: Vite (HMR enabled)
*   **Styling**: Vanilla CSS utilizing custom HSL properties (CSS variables) for premium, full-page responsive dashboard grids.
*   **Icons**: Lucide Icons (`lucide-react`)
*   **Mock Database / Service**: LocalStorage-backed service (`src/services/mock_service.ts`) emulating Firestore streaming.

### 📂 Directory Scaffolding
```text
C:\Hope\Project\Ocean-eyes-web/
├── .agents/                 # Workspace agent skills and configurations
├── public/                  # Static assets & icons
├── src/
│   ├── assets/              # SVGs, images
│   ├── context/             # React Context providers (AppContext.tsx)
│   ├── pages/
│   │   ├── ViewerApp.tsx    # Customer dashboard views (Home, Live cam, Analytics)
│   │   └── IoTMonitor.tsx   # IoT Scanner Console (Simulator workspace)
│   ├── services/
│   │   └── mock_service.ts  # Datastore & local mock state managers
│   ├── App.tsx              # Sidebar dashboard layout entry point
│   ├── index.css            # Premium CSS variable design systems
│   └── main.tsx             # DOM bootstrapper
├── .gitignore
├── AGENTS.md                # Project guidelines (this file)
└── package.json
```

---

## 3. AI Model Integration Conventions

When implementing code to connect the AI fish detection/classification models:

### A. Data Schema for Model Inferences
Model inputs consist of simulated or live RTSP camera frames. Inference outputs must match our TypeScript interfaces in `src/services/mock_service.ts`:
*   **Detected Species Map**: A key-value map containing the count of each species observed, e.g.:
    ```typescript
    species_detected: {
      "neon-tetra": 5,
      "guppy": 3,
      "corydoras": 2
    }
    ```
*   **Confidence Scores**: A double between `0.0` and `1.0` representing camera model detection accuracy.
*   **Clarity Rating**: Model-computed water clarity score (double between `0.0` and `10.0`).

### B. Communication Interface
Model integrations should support the following modular structures:
1.  **Simulated scanner state**: Connected via `MockFirestore` writes in `mock_service.ts` for immediate split-screen syncing.
2.  **API Services**: Designed inside a clean services file (e.g., `src/services/ai_service.ts`) supporting either REST endpoints or real-time WebSockets to stream frame-by-frame JSON coordinates.
3.  **Local Inference (Optional)**: Designed for client-side model runners (e.g., TensorFlow.js or ONNX Runtime Web) to run lightweight classification models directly in the browser.

---

## 4. Development Guardrails

1.  **Theme and Style Parity**: Adhere to the established CSS HSL variables and typography (`Outfit`, `Inter`). Avoid inlined styling; keep modifications inside standard modules or `index.css`.
2.  **Strict Type Safety**: TypeScript compiling must pass with **zero errors**. Avoid `any` types; explicitly declare and reuse interfaces in `mock_service.ts`.
3.  **No speculations or unfinished stubs**: Code additions must be fully verified and tested. If adding new network integrations, include clean error boundaries and loading states.

---

## 5. Operational Commands
*   `npm run dev` - Start local development server.
*   `npm run build` - Compile and bundle production package.
*   `npm run lint` - Validate linter rules.
