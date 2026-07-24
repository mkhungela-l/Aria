# ARIA Prototype Documentation

## 1. Project Overview
ARIA (AI Requirements Intelligence Architecture) is iOCO's Internal AI Platform, built to address two major crises:
1. **The Requirements Crisis:** Eliminating vague requirements that lead to 30-50% sprint rework.
2. **The Shadow AI Crisis:** Preventing regulatory exposure (POPIA Section 72) caused by employees feeding sensitive client data to external AI providers (ChatGPT, Gemini).

This codebase acts as the **Demo Day interactive prototype** for AI Innovation Week 2026.

## 2. What Was Done (End-to-End Execution)
Instead of a single monolithic script, the solution was architected into a modern, modular **React + Vite** application. The build ensures clean separation of concerns and features a high-performance bundling step.

### 2.1 Project Architecture
*   `vite.config.js` - Configured with `vite-plugin-singlefile` to bundle the entire React app into one highly portable `.html` file for easy demo sharing.
*   `src/data/mockData.js` - Extracted and typed all the sample data (ROLES, INIT_ISSUES, DEPT_MODULES, etc.) cleanly.
*   `src/utils/helpers.js` - Centralized domain logic, such as the `classifyData` function (which detects PII and determines POPIA classifications).
*   `src/components/ui.jsx` - Built a robust, reusable UI atomic design system (Cards, Badges, Buttons, Toasts, Modals) mimicking iOCO's enterprise design language.
*   `src/App.jsx` - The main application shell housing the Sidebar routing and View orchestration.

### 2.2 Innovative Enhancements Added
To make the submission stand out for the judges, the following new capabilities were engineered beyond the original code:

1.  **Interactive Traceability Graph (`react-force-graph-2d`)**
    *   *Where:* **Traceability Matrix View**
    *   *What:* Converts flat requirement chains into a physical physics-based node graph.
    *   *Why:* Allows QAs and PMs to visually grab and drag the dependency tree (`Requirement Doc` → `Issues` → `User Stories` → `Test Cases`) to spot orphaned stories or missing test coverage instantly.
2.  **Version Compare Diff Component**
    *   *Where:* **Analyse Requirements View**
    *   *What:* A visual Git-style "Diff" that strikes through vague original client text and highlights the ARIA-recommended fix.
    *   *Why:* Immediately proves the tool's core value proposition to stakeholders by visually contrasting "bad" vs "good" requirements.
3.  **Live Data Sovereignty Map**
    *   *Where:* **Enterprise Hub View**
    *   *What:* A visual dashboard widget demonstrating internal `af-south-1` routing vs. intercepted/blocked external `us-east` calls.
4.  **Real-Time ROI Tracker**
    *   *Where:* **Enterprise Hub View**
    *   *What:* A progress tracker showing the R2.4M projected savings tracking towards its goal.

## 3. What is Needed to Take This to Production (Next Steps)
This codebase is currently a **Front-End Mock/Prototype**. To transition this into the Horizon 1 Production deployment outlined in the submission document, the following is needed:

### 3.1 Backend & Infrastructure Needs
*   **Azure af-south-1 Environment:** Provisioning of the secure Azure tenant to host the production instances.
*   **LLM API Keys (Claude Enterprise):** The actual API keys for the Anthropic Claude Enterprise API (with zero retention policy) to power the 7-agent pipeline.
*   **Backend Node.js/Python Gateway:** A secure API Gateway to intercept queries, handle the PII scanning/classification backend logic, and manage the audit logging to an Azure Cosmos DB.

### 3.2 Integration Authentication
*   **M365 OAuth Credentials:** Service account credentials to wire up the real Microsoft Teams, Word, and Outlook integrations.
*   **Atlassian API Tokens:** OAuth 2.0 or API tokens for Jira and Confluence to allow ARIA to physically read Confluence pages and push User Stories to the Jira backlog.

### 3.3 Security & Compliance Validation
*   **CISO Sign-off:** Final review of the data classification engine (`classifyData`) logic to ensure it meets exact iOCO internal policies before real client data is processed.
