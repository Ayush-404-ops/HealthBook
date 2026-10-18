# AI Coding Assistant Usage Declaration

This document transparently discloses the use of generative AI coding assistants during the research, implementation, review, and documentation of the **HealthBook** full-stack healthcare platform.

---

## 1. Statement of AI Collaboration

In accordance with academic integrity and engineering transparency standards, the author acknowledges that AI coding assistants (**Anthropic Claude** via Claude Sonnet and Antigravity pair-programming agent environments) were utilized as collaborative engineering tools during this project.

The AI assistant served as an advanced pair programmer to accelerate boilerplate generation, assist with architectural scaffolding, conduct code reviews against industry benchmarks (such as the OWASP Top 10), and draft test matrices.

**Critical Note:** All architectural decisions, design implementations, and generated code artifacts were actively inspected, evaluated, executed, debugged, and verified by the author. The author fully understands the codebase, its internal mechanisms, security protections, and algorithmic logic.

---

## 2. Breakdown of AI Contributions by Subsystem

| Subsystem | Area of AI Assistance | Specific Contributions |
| :--- | :--- | :--- |
| **Backend (`server/`)** | Architecture & Hygiene | - Assisted in scaffolding Express controllers, Mongoose schemas, and state machine transitions.<br>- Suggested defensive middleware structures including NoSQL injection sanitization (`middleware/mongoSanitize.js`) and magic-byte file signature validation in `recordController.js`.<br>- Helped construct Node.js native test runner suites (`server/tests/security.test.js`, `slots.test.js`, `events.test.js`). |
| **Frontend (`client/`)** | Component Scaffolding & Polish | - Assisted in generating modern Tailwind CSS v4 styling structures and Radix UI headless component wrappers (`Card`, `Button`, `Modal`, `Tabs`).<br>- Assisted with integrating Leaflet OpenStreetMap components and real-time SSE stream listeners. |
| **Analytics (`analytics/`)** | Data Science & Django Scaffolding | - Scaffolded Django models (`DoctorSnapshot`, `AppointmentFact`) and management commands (`sync_from_mongo.py`, `seed_demo_data.py`).<br>- Helped design the Scikit-Learn machine learning training pipeline (`ml/train.py`) with cross-validation and class imbalance weighting.<br>- Assisted with initial cell structure and Seaborn plotting code for the `appointment_analysis.ipynb` Jupyter notebook. |
| **Documentation & Auditing** | Security & Compliance | - Assisted in running static security tools (`oxlint`, `bandit`, `pip-audit`, `npm audit`) and structuring the threat model in `docs/SECURITY_AND_PRIVACY.md`.<br>- Formatted technology selection tables and course syllabus mappings. |

---

## 3. Human Engineering & Oversight

The author actively directed all prompt engineering, reviewed generated pull requests, rejected unviable suggestions, corrected platform-specific errors, and ensured business logic fidelity:

1. **Bug Identification & Fixing:** Caught and resolved runtime issues such as Node test runner directory globbing crashes, Mongoose status enum gaps (`no-show`), duplicate Django URL namespace warnings (`urls.W005`), and missing ML requirements (`scikit-learn`, `joblib`, `faker`).
2. **Access Control Enforcement:** Personally verified and strengthened medical record access control, ensuring doctors can strictly access records only when a shared confirmed or completed appointment exists.
3. **Data Privacy Guardrails:** Mandated and implemented the salted SHA-256 pseudonymization boundary (`patient_hash`) to guarantee zero patient PII or PHI enters the Django analytics database.

---

## 4. What I Changed or Wrote Myself

*(This section is reserved for the author to annotate personal custom implementations, manual refactoring, and independent features)*

- [ ] **Custom Domain Logic & Tweaks:**
  <!-- Add any specific functions, algorithms, or components you authored from scratch -->
- [ ] **Design & Styling Adjustments:**
  <!-- Add any specific UI changes, theme tweaks, color palettes, or layout customizations -->
- [ ] **Refactoring & Performance Enhancements:**
  <!-- Add any code blocks or architecture decisions you re-architected -->
- [ ] **Testing & Verification:**
  <!-- Add any manual test workflows or edge cases you verified independently -->
