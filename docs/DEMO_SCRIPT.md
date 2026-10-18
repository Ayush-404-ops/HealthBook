# 🎓 Faculty Presentation & Demonstration Script (7–10 Minutes)

**Project:** HealthBook — Intelligent Doctor Appointment & Healthcare Platform  
**Target Audience:** Evaluation Committee & Faculty Reviewers  
**Duration:** 7 to 10 Minutes Total (5–7 min presentation + 3 min Q&A)

---

## ⏱️ Timeline & Screen Flow

```
┌───────────────────┬──────────────────────────────────────────┬────────────────────────┐
│ Timestamp         │ Feature / Screen                         │ Key Technical Concept  │
├───────────────────┼──────────────────────────────────────────┼────────────────────────┤
│ 00:00 – 01:00     │ Architecture & Overview Slide            │ Dual-Service Polyglot  │
│ 01:00 – 02:45     │ Patient Portal & AI Symptom Triage       │ Gemini AI & Fallback   │
│ 02:45 – 04:00     │ Real-Time Slot Picker & Locking          │ SSE & Compound Index   │
│ 04:00 – 05:15     │ Doctor Dashboard & Medical Records       │ Access Control (IDOR)  │
│ 05:15 – 06:15     │ Emergency Hospital Discovery & Leaflet   │ Overpass API & OSRM    │
│ 06:15 – 07:45     │ Django Analytics & ML No-Show Model      │ Salted ETL & Scikit-ML │
│ 07:45 – 10:00     │ Faculty Q&A & Technical Defense          │ Architecture Decisions │
└───────────────────┴──────────────────────────────────────────┴────────────────────────┘
```

---

## 🖥️ Step-by-Step Demonstration Plan

### Step 1: System Overview & Architecture (1 Minute)
- **Screen:** Show [ARCHITECTURE.md](file:///c:/Users/thumm/OneDrive/Desktop/fsd_final/HealthBook/docs/ARCHITECTURE.md) or System Architecture slide.
- **Talking Points:**
  - *"HealthBook is an enterprise dual-service healthcare application."*
  - *"The operational core is built with React 19, Node.js/Express, and MongoDB, delivering low-latency real-time booking and document management."*
  - *"The secondary service is built with Django 5 and Scikit-Learn, acting as a privacy-preserving analytics warehouse and predictive risk modeling engine."*
  - *"A strict privacy boundary separates the two: no patient names, contact info, or medical records ever reach the analytics service."*

---

### Step 2: Patient Journey & AI Symptom Triage (1 min 45 sec)
- **Screen:** Open Browser at `http://localhost:5173`.
- **Actions:**
  1. Point out the hero section and click **"AI Symptom Navigator"**.
  2. Type a sample symptom: `"I have a throbbing headache, light sensitivity, and nausea for 2 days"`.
  3. Show Gemini 2.0 Flash recommendation: **Neurologist**, High urgency triage.
  4. Explain fallback: *"If external Gemini API quota is exceeded or offline, our deterministic regex engine executes automatically without crashing."*
  5. Click **"Book with Recommended Doctor"**.

---

### Step 3: Atomic Slot Booking & Real-Time SSE Locking (1 min 15 sec)
- **Screen:** Doctor Profile Page & `SlotPicker` component.
- **Actions:**
  1. Open a second browser window (e.g., incognito or split screen) side-by-side.
  2. Select an available date. Highlight the dynamic 30-minute slot grid.
  3. Click a slot (e.g., `10:00 AM`).
  4. **Key Moment:** Show that the slot instantly turns yellow/locked in both windows via **Server-Sent Events (`/api/events/stream`)**.
  5. Explain the in-memory hold lock (`services/holds.js`) with 5-minute auto-expiry.
  6. Click **"Confirm & Pay"** to simulate Razorpay escrow checkout and HMAC-SHA256 signature verification.
  7. Explain: *"Even under a race condition where two users click simultaneously, MongoDB's partial unique compound index atomically prevents double booking."*

---

### Step 4: Doctor Portal & Medical Records Security (1 min 15 sec)
- **Screen:** Log in as Doctor or Admin.
- **Actions:**
  1. View the newly confirmed appointment in the consultation roster.
  2. Inspect patient medical records repository (`/api/records/:id`).
  3. **Security Highlight:**
     - *"During our OWASP Top 10 security audit, we identified that doctors previously could view any record by ID."*
     - *"We patched this vulnerability: doctors can now only access medical records if they share an active confirmed or completed appointment with that patient."*
  4. Show medical record upload with file magic-byte validation (`%PDF-`, PNG, JPEG headers).

---

### Step 5: Emergency Hospital Discovery & Routing (1 Minute)
- **Screen:** Navigate to **"Emergency Hospitals"** (`/hospitals`).
- **Actions:**
  1. Trigger current GPS location.
  2. Show Leaflet map rendering hospital markers fetched live from OpenStreetMap Overpass API.
  3. Click a hospital: display turn-by-turn driving route rendered using OSRM shortest-path routing.
  4. Mention: *"100% open-source mapping stack — zero proprietary API fees, zero patient location tracking."*

---

### Step 6: Django Analytics & ML No-Show Predictor (1 min 30 sec)
- **Screen:** Open Django Analytics Dashboard at `http://localhost:8000/reports/`.
- **Actions:**
  1. Show KPI summary cards: Total appointments, completion rate, cancellation rate, revenue.
  2. Point out the anonymized privacy hash (`patient_hash`): *"Notice that individual patient IDs are salted SHA-256 digests. Zero PII is stored in this database."*
  3. Open terminal and run the inference predictor:
     ```bash
     cd analytics
     python ml/predict.py
     ```
  4. Show predicted risk probability and feature importance (lead time days, hour of day, doctor specialty).
  5. Briefly display the executed Jupyter Notebook (`appointment_analysis.ipynb`) showing the status distribution heatmap and lead time correlation chart.

---

## ❓ Frequently Asked Faculty Questions & Honest Answers

### Q1: Why did you use two databases (MongoDB and PostgreSQL)?
> **Short Honest Answer:**  
> *"We applied polyglot persistence based on data access patterns. MongoDB handles operational transactions because doctor schedules, nested availability windows, and flexible medical records naturally map to hierarchical JSON documents with atomic document-level locking. PostgreSQL was chosen for the analytics warehouse because relational databases excel at structured SQL aggregation, cohort analysis, foreign key integrity, and direct integration with Python data science tools like Pandas and Scikit-Learn."*

---

### Q2: How exactly is double-booking prevented under concurrent load?
> **Short Honest Answer:**  
> *"It is guaranteed at the database engine level, not merely in application logic. We created a MongoDB partial unique compound index on `{ doctor: 1, date: 1, startTime: 1 }` filtered strictly on status in `['pending', 'confirmed']`. If two requests bypass application locks at the exact same millisecond, MongoDB's storage engine enforces uniqueness and rejects the second write with an atomic `E11000` duplicate key exception."*

---

### Q3: How was your machine learning model trained and validated?
> **Short Honest Answer:**  
> *"We trained a Random Forest Classifier and compared it against a Logistic Regression baseline using 5-fold stratified cross-validation. To handle class imbalance (no-shows are typically under 20%), we applied balanced class weights. Most importantly, we strictly avoided data leakage: we only used features knowable at the moment of booking (lead time, hour of day, weekday, fee, specialty, and prior cancellations). We never used post-appointment data like status or payment completion time."*

---

### Q4: What parts of this project are NOT production-ready?
> **Short Honest Answer:**  
> *"Three specific areas:  
> 1. **In-process SSE**: Our real-time event bus runs in Node.js memory. In a multi-server cluster behind a load balancer, we would need a Redis Pub/Sub backplane.  
> 2. **Payments**: We operate in Razorpay simulation mode with test credentials; no real bank settlement occurs.  
> 3. **Stateless JWT Revocation**: Tokens expire after 7 days. Logout clears the browser cookie, but immediate server-side token invalidation requires a Redis token blacklist."*

---

### Q5: How much of this code did you write versus AI coding tools?
> **Short Honest Answer:**  
> *"We transparently documented this in `docs/AI_USAGE.md`. We used Claude to accelerate boilerplate scaffolding, draft initial test matrices, and assist with OWASP Top 10 static audit checks. However, all domain logic, the doctor-patient relationship authorization fix, the NoSQL sanitization middleware, the salted privacy hashing, and end-to-end debugging were directed, verified, and understood by us."*

---

## 🛠️ Quick Command Reference for Demo

```bash
# Terminal 1: Core Backend API
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev

# Terminal 3: Analytics Service
cd analytics
python manage.py runserver 8000

# Terminal 4: Verification / ML Runner
cd analytics
python ml/predict.py
```
