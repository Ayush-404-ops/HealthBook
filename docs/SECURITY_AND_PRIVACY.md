# HealthBook Security & Privacy Specification & Audit Report

**Date of Audit:** October 2026  
**Auditor:** Automated Diagnostic Suite & Pair Programming Assistant  
**Scope:** Local deployment (`localhost`) covering `server/`, `client/`, and `analytics/`.

---

## 1. Threat Model (One-Page Overview)

### System Architecture & Trust Boundaries
HealthBook consists of three primary subsystems:
1. **Node.js/Express + MongoDB API (`server/`)**: Core transactional operational system handling authentication, doctor scheduling, appointments, real-time SSE notifications, and medical record management.
2. **React + Vite SPA (`client/`)**: Client-side single-page application communicating over HTTP REST with session tokens stored in `httpOnly`, `SameSite=Lax` cookies.
3. **Django 5 Analytics Service (`analytics/`)**: Secondary, read-only analytics warehouse backed by PostgreSQL (with SQLite fallback) used for reporting, business intelligence, and ML appointment no-show prediction.

```
┌────────────────┐           ┌──────────────────────────────────────┐
│  Patient /     │  HTTPS    │  Express REST API (server/)          │
│  Doctor Web UI │ ────────> │  - Cookie JWT Auth (httpOnly)        │
│  (client/)     │           │  - MongoDB Data Store (Mongoose)     │
└────────────────┘           │  - Local Uploads (/server/uploads)   │
                             └──────────────────┬───────────────────┘
                                                │
                                  ETL / Sync    │ Privacy Boundary
                              (One-way, Salted) │ (PII/PHI Stripped)
                                                ▼
                             ┌──────────────────────────────────────┐
                             │  Django Analytics & ML (analytics/)  │
                             │  - DoctorSnapshots                   │
                             │  - AppointmentFacts (patient_hash)   │
                             │  - scikit-learn No-Show Model        │
                             └──────────────────────────────────────┘
```

### Actors & Capabilities
- **Anonymous Visitor:** Can browse approved doctors, view landing information, register as a patient or doctor, and attempt login.
- **Patient:** Can book appointments, hold slots, pay consultation fees, upload medical records, and view/delete their own medical records.
- **Doctor:** Can manage slot availability, view appointment rosters, and view medical records *only* for patients with whom they share a confirmed or completed appointment.
- **Administrator:** Can approve doctor profiles, inspect platform KPIs, and access aggregate statistics.
- **Analytics Service:** Read-only ingestion pipeline operating across an internal privacy boundary.

### High-Priority Threat Vectors
1. **Broken Access Control (IDOR / BOLA):** Patients accessing another patient's medical files or doctors viewing arbitrary medical histories without a clinical relationship.
2. **Injection (NoSQL / Mongo Operator Injection):** Manipulating JSON payloads with operators (`$gt`, `$ne`, `$where`) to bypass authentication or extract data.
3. **Malicious File Upload:** Uploading executable scripts (`.html`, `.svg`, `.sh`, `.exe`) disguised as medical documents to trigger remote code execution or stored XSS.
4. **Data Leakage in Secondary Storage:** Exposing patient names, contact info, or medical conditions in the business intelligence database.
5. **Session & Cookie Hijacking:** Unauthorized reading or cross-site transmission of authorization tokens.

---

## 2. Personal Data Inventory & Storage Locations

HealthBook enforces strict segregation between operational data and analytical aggregates:

| Data Element | Classification | Storage Location | Retention / Access Rules |
| :--- | :--- | :--- | :--- |
| **Full Name** | PII | MongoDB (`users` collection) | Accessible by user profile and confirmed clinicians. |
| **Email Address** | PII | MongoDB (`users` collection) | Unique index; lowercase; used solely for authentication and notifications. |
| **Phone Number** | PII | MongoDB (`users` collection) | Optional; strictly restricted to operational contact. |
| **Password** | Secret | MongoDB (`users` collection) | Hashed via `bcryptjs` with 10 salt rounds; never stored in plaintext. Excluded by default (`select: false`). |
| **Medical Records (PHI)** | Sensitive PHI | MongoDB (`medicalrecords`) & Local disk (`server/uploads/`) | Files stored on disk using randomized filenames (`record-<timestamp>-<rand>.<ext>`). Only accessible by the patient owner, administrator, or clinician with a shared appointment. |
| **Appointment Records** | Clinical / Financial | MongoDB (`appointments` collection) | Tracks date, time, status, payment state, and Razorpay transaction IDs. |
| **Doctor Information** | Professional Data | MongoDB (`doctors` collection) | Specialty, experience, consultation fee, approval status, and availability rules. |

---

## 3. Deliberate Privacy Exclusions from Analytics (`analytics/`)

To comply with health data privacy standards and HIPAA/GDPR data minimization principles, the Django analytics reporting service deliberately excludes all direct identifiers:

- ❌ **No Patient Names:** Patient full names are completely excluded from the ETL synchronization script (`sync_from_mongo.py`).
- ❌ **No Patient Email or Phone Numbers:** Contact details are never queried or copied.
- ❌ **No Medical Records or Notes:** File uploads, lab reports, consultation notes, and diagnoses are never copied to the analytics database.
- ✅ **Cryptographic Pseudonymization (`patient_hash`):** Patient IDs are transformed into a one-way salted SHA-256 digest:
  $$\text{patient\_hash} = \text{SHA256}(\text{PATIENT\_HASH\_SALT} + \text{":"} + \text{patient\_id})$$
  This permits longitudinal cohort analysis (e.g., repeat cancellations, no-show history) without exposing the patient identity.
- ✅ **Doctor Snapshots Only:** Clinician performance is tracked via aggregated `DoctorSnapshot` records (specialty, fee, average rating).

---

## 4. Audit Execution & Actual Tool Outputs

### 1. Dependency Audit: `npm audit` (Server)
- **Command:** `npm audit` inside `server/`
- **Output Summary:**
  ```text
  # npm audit report
  braces  *
  Severity: high
  braces vulnerable to stack-exhaustion denial of service through deeply nested patterns - GHSA-vfj7-8cjw-p6xm
  fix available via `npm audit fix --force`
  Will install nodemon@1.14.10, which is a breaking change
  node_modules/braces
    chokidar  2.0.0 - 3.6.0
      nodemon  >=1.14.11
  3 high severity vulnerabilities
  ```
- **Evaluation & Risk:** The vulnerability is nested in `nodemon`'s file watcher dependency (`chokidar` -> `braces`). `nodemon` is a developer tool (`devDependencies`) and is not executed in production runtime. Fixing it automatically via `npm audit fix --force` would downgrade nodemon to `1.14.10` (a major breaking change). Per guidelines, `--force` was not executed.

### 2. Dependency Audit: `npm audit` (Client)
- **Command:** `npm audit` followed by `npm audit fix` inside `client/`
- **Initial Output:** 2 high severity vulnerabilities in `axios` (prototype pollution gadgets and DoS in fetch adapter) and `source-map-js`.
- **Action Taken:** Executed `npm audit fix` (safe mode, no `--force`).
- **Final Output:**
  ```text
  changed 2 packages, and audited 166 packages in 3s
  found 0 vulnerabilities
  ```

### 3. Dependency Audit: `pip-audit` (Analytics)
- **Command:** `pip-audit -r requirements.txt`
- **Output Summary:**
  ```text
  Found 13 known vulnerabilities in 1 package
  Name   Version ID              Fix Versions
  ------ ------- --------------- -------------------
  django 5.0.14  PYSEC-2025-47   4.2.22,5.1.10,5.2.2
  django 5.0.14  PYSEC-2025-105  4.2.24,5.1.12,5.2.6
  django 5.0.14  PYSEC-2026-3717 5.2.17,6.0.8,6.1.1
  ...
  ```
- **Evaluation & Risk:** The pinned `requirements.txt` previously referenced Django 5.0.14. The active runtime environment utilizes Django 6.1.1 which already patches these vulnerabilities. `requirements.txt` was adjusted to require `Django>=5.2.17`.

### 4. Static Code Analysis: `oxlint` (Client)
- **Command:** `npx oxlint src/` inside `client/`
- **Output Summary:**
  ```text
  Found 30 warnings and 0 errors.
  Finished in 66ms on 46 files with 104 rules using 22 threads.
  ```
- **Evaluation:** Zero syntax or critical errors. Warnings were limited to unused imports (which were cleaned) and React effect cascading render lint suggestions.

### 5. Static Code Analysis: `bandit` (Analytics)
- **Command:** `bandit -r analytics -x analytics/venv`
- **Initial Output:**
  - 20 Low-severity issues:
    - 14 occurrences of `B311` (standard pseudo-random generator `random` used in `seed_demo_data.py` for synthetic appointment creation).
    - 5 occurrences of `B106` (mock passwords used in test fixtures `tests.py`).
    - 1 occurrence of `B110` (try-except-pass in `sync_from_mongo.py` line 91).
- **Remediation:** Fixed `B110` in `sync_from_mongo.py` by replacing silent pass with diagnostic logger warnings.
- **Final Output:**
  ```text
  Run metrics:
    Total issues (by severity):
      Undefined: 0, Low: 19, Medium: 0, High: 0
    Total issues (by confidence):
      Undefined: 0, Low: 0, Medium: 5, High: 14
  ```

### 6. Dynamic Scanning: OWASP ZAP Baseline
- **Execution Check:** `docker images`
- **Output:** `docker : The term 'docker' is not recognized as the name of a cmdlet, function, script file, or operable program.`
- **Result:** Docker is not installed on the host environment; the optional containerized ZAP scan was skipped as requested.

---

## 5. Manual OWASP Top 10 Review & Code Remediation

| OWASP Category | Finding & Evaluation | Affected File(s) | Remediation Applied |
| :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | **VULNERABILITY FOUND:** In `recordController.js`, any user with `role === 'doctor'` could access any patient's medical records by ID without clinical justification. | `server/controllers/recordController.js` | Enforced strict access control: doctors can only retrieve a patient's medical record if there is a shared appointment with status `'confirmed'` or `'completed'`. |
| **A01: Broken Access Control** | Patient A attempted IDOR access to Patient B's record. | `server/controllers/recordController.js` | Re-verified and tested: patients who are not the record owner are rejected with `HTTP 403`. |
| **A02: Cryptographic Failures** | Authentication cookies configuration. | `server/controllers/authController.js` | Verified cookies are set with `httpOnly: true`, `sameSite: 'lax'`, and `secure: process.env.NODE_ENV === 'production'`. Added identical security flags when clearing cookie in `logout`. |
| **A03: Injection (NoSQL)** | **VULNERABILITY FOUND:** `req.body.email` in login could accept an object `{ "$gt": "" }`, causing NoSQL operator injection or unhandled runtime crashes. | `server/controllers/authController.js`, `server/server.js`, `server/middleware/mongoSanitize.js` | 1. Created `mongoSanitize` middleware to recursively reject any request body, query, or parameter with keys starting with `$` or containing `.`.<br>2. Added explicit `typeof email === 'string'` and `typeof password === 'string'` guards in `authController.login`. |
| **A04: Insecure Design (File Upload)** | **VULNERABILITY FOUND:** `multer` storage accepted any file extension and MIME type. Users could upload executable scripts or spoofed file extensions. | `server/routes/recordRoutes.js`, `server/controllers/recordController.js` | 1. Added `fileFilter` allowlist restricted to `.pdf`, `.png`, `.jpg`, `.jpeg` and matching MIME types.<br>2. Implemented file magic-byte validation checking file headers (`%PDF`, PNG signature `0x89504E47`, JPEG `0xFFD8FF`) before persisting. |
| **A05: Security Misconfiguration (CORS)** | **VULNERABILITY FOUND:** In `server.js`, the CORS origin callback returned `callback(null, true)` for unrecognized origins while `credentials: true` was enabled. | `server/server.js` | Updated CORS middleware to reject unrecognized cross-origin requests with `callback(new Error('Blocked by CORS policy'))`. |
| **A05: Security Misconfiguration (Static Files)** | Uploaded files served without execution prevention headers. | `server/server.js` | Configured `/uploads` static route with `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'`. |
| **A07: Identification & Auth Failures** | Brute force protection on authentication routes. | `server/routes/authRoutes.js` | Confirmed `loginLimiter` (`express-rate-limit`) limits login attempts to 10 requests per 15 minutes per IP. |
| **A09: Security Logging & Monitoring** | PII leakage in application logs. | `server/controllers/*`, `analytics/reports/*` | Audited application log calls. Confirmed logs output operation states and error messages; no patient names, plain passwords, or medical notes are printed to stdout. |

---

## 6. Automated Security Test Suite Verification

All defensive controls were codified into `server/tests/security.test.js` and verified through the Node.js test runner:

```text
> healthbook-server@1.0.0 test
> node --test "tests/*.test.js"

▶ SSE Events System
  ✔ eventBus publishes and receives events (1.9852ms)
  ✔ SSE endpoint flushes headers and receives real-time events, then cleans up cleanly (46.7167ms)
✔ SSE Events System (50.0111ms)
▶ Medical Records & Upload Directory
  ✔ uploads directory exists and is writable (3.6014ms)
✔ Medical Records & Upload Directory (5.0657ms)
▶ Scheduler Service
  ✔ can run scheduled maintenance tasks without error (1.047ms)
  ✔ starts and stops scheduler cleanly without open handles (0.5142ms)
✔ Scheduler Service (2.7633ms)
▶ Security Audit - Automated Defensive Controls
  ✔ unauthenticated access to protected route returns 401 (1.156ms)
  ✔ patient A cannot access patient B medical record (expect 403) (0.4477ms)
  ✔ doctor cannot access patient record without shared confirmed/completed appointment (expect 403) (0.3443ms)
  ✔ doctor CAN access patient record when shared confirmed/completed appointment exists (expect 200) (0.6392ms)
  ✔ file upload with spoofed magic bytes or wrong extension is rejected (expect 400) (6.052ms)
  ✔ hasMongoOperator detects nested $ and dot keys (0.3366ms)
  ✔ sanitizeMongo middleware rejects payloads containing Mongo operators (expect 400) (0.4016ms)
  ✔ login rejects non-string credentials to prevent operator injection (expect 400) (0.4398ms)
✔ Security Audit - Automated Defensive Controls (13.3697ms)
▶ Slots Service - hold timer and availability
  ✔ creates a slot hold successfully (3.4049ms)
  ✔ prevents another patient from holding the same slot (1.1138ms)
  ✔ releases hold correctly (0.4816ms)
  ✔ converts hold on appointment booking (0.5866ms)
  ✔ expires overdue holds (0.6583ms)
✔ Slots Service - hold timer and availability (8.7062ms)
ℹ tests 23
ℹ suites 0
ℹ pass 23
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 749.2881
```

---

## 7. Known Remaining Risks

1. **Development Dependency Advisory in `nodemon` (`braces`):**
   - *Risk:* Potential ReDoS / stack exhaustion if an attacker can manipulate files watched by nodemon during development.
   - *Mitigation:* This dependency is only present in `devDependencies` and is not deployed or executed in production. Resolving it requires `--force` which downgrades nodemon across a major version boundary.
2. **Stateless JWT Revocation:**
   - *Risk:* Once issued, JWT tokens remain cryptographically valid until their 7-day expiration (`JWT_EXPIRES_IN`). Calling `/api/auth/logout` clears the browser cookie, but the token itself cannot be invalidated server-side without a stateful token blacklist (e.g., Redis).
   - *Recommendation:* Introduce a short-lived access token (e.g., 15 minutes) combined with a rotating refresh token or Redis-backed blocklist for high-security deployments.
3. **Registration Endpoint Rate Limiting:**
   - *Risk:* While `/api/auth/login` is rate-limited to 10 requests per 15 minutes, `/api/auth/register` does not currently enforce an IP rate limit, allowing automated account creation scripts.
   - *Recommendation:* Apply a dedicated registration rate limiter (e.g., max 5 registrations per hour per IP) and optional CAPTCHA verification.
