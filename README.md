# 🏥 HealthBook — Intelligent Doctor Appointment & Healthcare Platform

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.22-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=flat-square&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A dual-service healthcare web application**: A high-performance **MERN Stack** operational application (React 19, Node.js/Express, MongoDB) unified with a privacy-preserving **Django 5 & Scikit-Learn** analytics and machine learning service.

</div>

---

## 📸 Screenshots

<!-- Place screenshots or recorded demo GIFs here -->
| Patient Dashboard & Slot Picker | AI Symptom Navigator |
| :---: | :---: |
| *(Screenshot placeholder: `docs/screenshots/patient-dashboard.png`)* | *(Screenshot placeholder: `docs/screenshots/ai-triage.png`)* |

| Doctor Consultations & Schedule | Analytics BI Dashboard |
| :---: | :---: |
| *(Screenshot placeholder: `docs/screenshots/doctor-roster.png`)* | *(Screenshot placeholder: `docs/screenshots/analytics-kpis.png`)* |

---

## 📑 Table of Contents

- [Live Features](#-live-features)
- [System Architecture](#-system-architecture)
- [Technology Stack & Licenses](#-technology-stack--licenses)
- [Project Structure](#-project-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup (Node / Express)](#1-backend-setup-node--express)
  - [2. Frontend Setup (React / Vite)](#2-frontend-setup-react--vite)
  - [3. Analytics & ML Service (Django)](#3-analytics--ml-service-django)
  - [4. Docker Database Option (PostgreSQL)](#4-docker-database-option-postgresql)
- [Environment Configuration](#-environment-configuration)
- [Default Demonstration Accounts](#-default-demonstration-accounts)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Known Limitations](#-known-limitations)
- [Contributing & Documentation Links](#-contributing--documentation-links)
- [License](#-license)

---

## ✨ Live Features

Every feature listed below is verified and functioning in the active codebase:

1. **🤖 AI Symptom Navigator & Medical Triage (Google Gemini 2.0 Flash)**:
   - Natural-language symptom triage suggesting clinical specialties and urgency ratings.
   - **Deterministic Fallback Engine**: Seamless offline keyword matching when external API keys are unset or network-constrained.
2. **📅 Atomic Conflict-Free Appointment Scheduling**:
   - Dynamic 30-minute slot generation honoring individual doctor working hours.
   - **Double-Booking Prevention**: MongoDB partial unique compound index on `{ doctor, date, startTime }` for active states guarantees zero race-condition bookings.
   - **Past-Time & Weekday Validation**: Rejection of past time slots and off-day appointments.
3. **⚡ In-Memory Slot Locking with Real-Time SSE Updates**:
   - Temporary 5-minute hold lock (`services/holds.js`) reserving slots during patient checkout.
   - Server-Sent Events (`/api/events/stream`) broadcasting instant `slot:held` and `slot:released` updates to all connected browser clients.
4. **💳 Razorpay Payment Escrow & Automated Refund Lifecycle**:
   - Order creation via official Razorpay SDK.
   - Server-side cryptographic HMAC-SHA256 signature verification before slot confirmation.
   - Instant automated payment refund processing upon cancellation by patient or doctor.
5. **🔄 Strict Appointment State Machine**:
   - Transitions strictly enforced: `pending` → `confirmed` or `cancelled`; `confirmed` → `completed`, `cancelled`, or `no-show`.
   - Terminal states (`completed`, `cancelled`, `no-show`) cannot be overridden.
6. **📁 Medical Records Repository with Active Access Control**:
   - Patient record upload with PDF, PNG, and JPEG extension whitelisting.
   - **Magic-Byte Header Validation**: Verifies binary signatures (`%PDF-`, PNG `\x89PNG`, JPEG `\xFF\xD8\xFF`) before saving to disk.
   - **Clinical Relationship Authorization**: Doctors can access a record only when they share a confirmed or completed appointment with that patient.
7. **🗺️ Emergency Hospital Discovery & Routing (Leaflet + OpenStreetMap)**:
   - Interactive OpenStreetMap integration querying local hospital nodes via the Overpass API.
   - Turn-by-turn driving distance calculation via the Open Source Routing Machine (OSRM).
8. **🎮 Gamified Health Habit HUD**:
   - Patient wellness tracker with Health XP progression, streak counters, and habit completion badges.
9. **📊 Django Analytics Warehouse & Privacy-Preserving ETL**:
   - Reads doctor snapshots and appointment facts into PostgreSQL (with SQLite zero-config fallback).
   - **Privacy Boundary**: Strips patient names, emails, phones, and medical files; transforms patient IDs into salted SHA-256 digests (`patient_hash`).
10. **🧠 Machine Learning No-Show Risk Predictor (Scikit-Learn)**:
    - Supervised `RandomForestClassifier` trained on non-leaking pre-appointment features (lead time, hour, weekday, fee, cancellation history).
    - Authenticated JSON inference endpoint `/reports/api/noshow-risk/` returning predicted probability and risk tiers (`LOW`, `MEDIUM`, `HIGH`).
11. **📈 Exploratory Data Analysis Notebook**:
    - Fully executed 34-cell Jupyter notebook (`analytics/notebooks/appointment_analysis.ipynb`) analyzing status distributions, lead time correlations, and revenue by specialization.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────┐       ┌──────────────────────────────────────┐
│  React 19 SPA (Vite + Tailwind) │ HTTP  │  Express REST API (server/)          │
│  - Patient & Doctor Portals     │ ────> │  - Cookie JWT Auth (httpOnly)        │
│  - Real-Time SSE Listener       │ <──── │  - MongoDB 8 (Mongoose)              │
│  - Leaflet Map & Hospital Nav   │  SSE  │  - Slot Hold Lock & Scheduler        │
└─────────────────────────────────┘       └──────────────────┬───────────────────┘
                                                             │
                                               One-Way Sync  │ Privacy Barrier
                                             (Salted SHA256) │ (PII/PHI Stripped)
                                                             ▼
                                          ┌──────────────────────────────────────┐
                                          │  Django 5 Analytics (analytics/)     │
                                          │  - PostgreSQL 16 / SQLite            │
                                          │  - Scikit-Learn No-Show Model        │
                                          │  - BI Reporting & Admin Panel        │
                                          └──────────────────────────────────────┘
```

For detailed architectural flowcharts and external service interactions, refer to [docs/ARCHITECTURE.md](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack & Licenses

| Layer | Technologies | License |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Recharts | **MIT** / **ISC** |
| **Mapping** | Leaflet 1.9.4, React-Leaflet 5, OpenStreetMap, OSRM | **BSD-2-Clause** / **ODbL** / **Hippocratic-2.1** |
| **Operational Backend** | Node.js 20, Express 4.22, Mongoose 8.24, Multer 2.2, bcryptjs | **MIT** |
| **Operational Database** | MongoDB 8.0 | **SSPL** (Server) / **MIT** (Driver) |
| **Analytics Backend** | Django 5.0+, Python 3.12+, psycopg2-binary | **BSD-3-Clause** |
| **Analytics Database** | PostgreSQL 16 (or SQLite 3 fallback) | **PostgreSQL License** |
| **Machine Learning & Data** | Scikit-Learn 1.4+, Pandas 2.3+, Seaborn 0.13+, Matplotlib 3.10+ | **BSD-3-Clause** / **PSF** |
| **External Integrations** | Razorpay Node SDK (MIT), Google Generative AI SDK (Apache-2.0) | **Permissive** |

Detailed justifications and community metrics are available in [docs/TOOL_SELECTION.md](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/TOOL_SELECTION.md).

---

## 📁 Project Structure

```text
HealthBook/
├── client/                     # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── api/                # Axios instance with credentials support
│   │   ├── components/         # Radix UI wrappers, SlotPicker, HealthHabitHUD
│   │   ├── context/            # AuthContext (JWT session state)
│   │   └── pages/              # Landing, PatientDashboard, DoctorDashboard, AdminDashboard
│   └── package.json
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── controllers/            # Auth, Appointment, Doctor, Records, AI, Payment
│   ├── middleware/             # auth (JWT), mongoSanitize (NoSQL injection defense)
│   ├── models/                 # User, Doctor, Appointment, MedicalRecord, Review
│   ├── routes/                 # Express REST endpoint routers
│   ├── services/               # holds.js (in-memory lock manager)
│   ├── tests/                  # Node.js native test runner test suite
│   ├── scheduler.js            # Background maintenance timer
│   └── server.js               # Application entry point
├── analytics/                  # Django 5 Analytics & ML Service
│   ├── config/                 # Django settings and URL router
│   ├── ml/                     # Scikit-Learn training, inference, and metrics
│   │   ├── train.py            # Model training & CV script
│   │   ├── predict.py          # Standalone inference runner
│   │   └── metrics.json        # Evaluation metrics
│   ├── notebooks/              # Jupyter analysis notebook & CSV export
│   │   └── appointment_analysis.ipynb
│   ├── reports/                # Django app: models, views, management commands
│   ├── requirements.txt        # Python dependency manifest
│   └── manage.py
├── docs/                       # Technical Documentation
│   ├── ARCHITECTURE.md         # Mermaid system diagrams
│   ├── TOOL_SELECTION.md       # Tool selection rationale & health metrics
│   ├── COURSE_MAPPING.md       # Curricular topic verification mapping
│   ├── SECURITY_AND_PRIVACY.md # Threat model & OWASP Top 10 audit
│   ├── AI_USAGE.md             # Generative AI usage declaration
│   └── THIRD_PARTY_LICENSES.md # Comprehensive open-source license audit
├── docker-compose.yml          # PostgreSQL 16 container definition
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.11 or higher (v3.12/3.14 tested)
- **MongoDB**: Active local instance on `mongodb://127.0.0.1:27017`

---

### 1. Backend Setup (Node / Express)

```bash
cd server
cp .env.example .env

# Install dependencies
npm install

# Seed default administrator account
node scripts/seedAdmin.js

# Start backend development server (Port 5000)
npm run dev
```

---

### 2. Frontend Setup (React / Vite)

In a separate terminal:

```bash
cd client

# Install dependencies
npm install

# Start frontend development server (Port 5173)
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

### 3. Analytics & ML Service (Django)

In a separate terminal:

```bash
cd analytics

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (defaults to SQLite fallback if DB_HOST is unset)
python manage.py migrate

# Seed synthetic demographic demo data (500 appointments)
python manage.py seed_demo_data --count 500 --seed 42

# Train the appointment no-show machine learning model
python ml/train.py

# Start Django analytics server (Port 8000)
python manage.py runserver 8000
```
Access the Django analytics dashboard at **`http://localhost:8000/reports/`** (log in using Django credentials or superuser created via `python manage.py createsuperuser`).

---

### 4. Docker Database Option (PostgreSQL)

To use PostgreSQL instead of SQLite for analytics:

```bash
# Start PostgreSQL 16 container
docker compose up -d

# Set in analytics/.env:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=healthbook_analytics
# DB_USER=hb_user
# DB_PASSWORD=hb_secure_password_2026

cd analytics
python manage.py migrate
```

---

## ⚙️ Environment Configuration

### Node Backend (`server/.env`)
| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | API listen port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/healthbook` |
| `JWT_SECRET` | Secret key for signing session tokens | *(strong random secret string)* |
| `JWT_EXPIRES_IN` | Session token lifespan | `7d` |
| `CLIENT_URL` | Allowed client CORS origin | `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay test key ID | `rzp_test_xxxxxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret key | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_API_KEY` | Google Gemini API key | *(optional - fallback engine active)* |

### Django Analytics (`analytics/.env`)
| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `SECRET_KEY` | Django cryptographic secret | *(django secret key string)* |
| `DEBUG` | Enable debug mode | `True` |
| `DB_HOST` | PostgreSQL host (*leave empty for SQLite*) | `localhost` or empty |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Analytics database name | `healthbook_analytics` |
| `DB_USER` | Analytics database user | `hb_user` |
| `DB_PASSWORD` | Analytics database password | `hb_secure_password_2026` |
| `MONGO_URI` | MongoDB source URI for sync | `mongodb://localhost:27017/healthbook` |
| `PATIENT_HASH_SALT` | Cryptographic salt for SHA-256 pseudonymization | `open-source-healthbook-salt-2026` |

---

## 👤 Default Demonstration Accounts

The database seed scripts configure the following pre-seeded test accounts:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@healthbook.com` | `Admin@1234` | Full system KPIs, doctor approval queue, platform statistics |
| **Doctor** | *(Register via UI)* | *(Set on register)* | Availability management, appointment rosters, clinical records |
| **Patient** | *(Register via UI)* | *(Set on register)* | Bookings, symptom triage, payments, personal record uploads |

---

## 🧪 Testing & Quality Assurance

All test suites execute without external network dependencies:

```bash
# 1. Run Node.js Server Test Suite (23 passing tests: SSE, slots, scheduler, security)
cd server
npm test

# 2. Run Frontend Linter & Build Verification
cd client
npm run lint
npm run build

# 3. Run Django Analytics Test Suite (14 passing tests: KPIs, login guard, sync, demo data)
cd analytics
python manage.py test

# 4. Verify Machine Learning Training & Inference Pipelines
cd analytics
python ml/train.py
python ml/predict.py
```

---

## ⚠️ Known Limitations

1. **In-Process Server-Sent Events (SSE):**  
   The real-time slot lock broadcasting mechanism utilizes an in-memory Node.js `EventEmitter` (`utils/events.js`). In a horizontally scaled production deployment with multiple Node server instances, a shared message broker (such as Redis Pub/Sub) is required to broadcast events across instances.
2. **Demo-Mode Payment Processing:**  
   When Razorpay keys are configured with test credentials (`rzp_test_...`), checkout executes in simulation mode. No real monetary transactions take place, and refunds are generated via test payment IDs.
3. **Synthetic Demographic Analytics Data:**  
   The data analyzed in `analytics/notebooks/appointment_analysis.ipynb` and utilized for model training in `analytics/ml/train.py` is generated by the synthetic generator (`seed_demo_data.py`). Patterns represent realistic clinical distributions but are strictly synthetic.
4. **Stateless JWT Lifetime:**  
   Session tokens are stateless and expire after 7 days. While calling `/api/auth/logout` clears the client's `httpOnly` cookie, tokens cannot be actively revoked server-side prior to expiration without an auxiliary token blacklist store.

---

## 📚 Contributing & Documentation Links

- [System Architecture](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/ARCHITECTURE.md)
- [Tool Selection & Framework Rationale](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/TOOL_SELECTION.md)
- [Course Topic Curriculum Mapping](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/COURSE_MAPPING.md)
- [Security & Privacy Audit (OWASP Top 10)](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/SECURITY_AND_PRIVACY.md)
- [AI Coding Assistant Usage Declaration](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/AI_USAGE.md)
- [Third-Party Software Licenses](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/THIRD_PARTY_LICENSES.md)
- [Contributing Guidelines](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/CONTRIBUTING.md)
- [Code of Conduct](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/CODE_OF_CONDUCT.md)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/LICENSE) file for details.
All third-party dependencies and their corresponding open-source licenses are audited in [docs/THIRD_PARTY_LICENSES.md](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/THIRD_PARTY_LICENSES.md).
