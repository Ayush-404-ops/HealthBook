# 🏥 HealthBook — Full Stack Doctor Appointment & Healthcare Navigation System

A production-ready **MERN Stack** healthcare web application featuring AI-powered symptom triage, conflict-free doctor appointment scheduling, integrated Razorpay payment verification with automated refunds, and OpenStreetMap emergency hospital routing using Dijkstra's shortest-path algorithm.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Seed Admin Account](#3-seed-admin-account)
- [Environment Configuration](#-environment-configuration)
  - [Backend (`server/.env`)](#backend-serverenv)
  - [Frontend (`client/.env`)](#frontend-clientenv)
- [Default Credentials](#-default-credentials)
- [API Reference](#-api-reference)
- [Security & Architecture Highlights](#-security--architecture-highlights)
- [User Roles & Workflows](#-user-roles--workflows)
- [License](#-license)

---

## ✨ Key Features

### 1. 🤖 AI Symptom Navigator
- Natural language symptom triage powered by **Google Gemini 2.0 Flash**.
- Recommends the appropriate medical specialty (e.g., Cardiologist, Dermatologist, Orthopedist) and severity assessment.
- **Intelligent Fallback Rule Engine**: Seamless offline keyword matching if external API keys are unavailable or rate-limited.

### 2. 📅 Conflict-Free Appointment Scheduling
- **Dynamic Slot Generation**: Automatically splits doctor working hours into slots based on their custom `slotDurationMinutes`.
- **Double-Booking Prevention**: MongoDB partial unique compound index (`{ doctor: 1, date: 1, startTime: 1 }` on `pending` and `confirmed` appointments) rejects simultaneous overlapping bookings.
- **Past-Time Validation**: Server-side checks reject dates in the past or time slots that have already elapsed today.

### 3. 💳 Razorpay Payments & Refund Lifecycle
- **Order Generation**: Creates INR payment orders via the Razorpay SDK.
- **HMAC-SHA256 Signature Verification**: Cryptographically verifies payment signatures on the backend before confirming slots.
- **Automated Refund Logic**: When a paid appointment is cancelled by either the patient or the doctor, the system initiates a Razorpay refund and updates the payment status to `refunded`.

### 4. 🔄 Strict Appointment State Machine
- Enforces linear state transitions:
  - `pending` ➔ `confirmed` or `cancelled`
  - `confirmed` ➔ `completed` or `cancelled`
  - `completed` & `cancelled` are terminal states.
- Doctors cannot mark an appointment `completed` unless it is both **confirmed** and **paid**.

### 5. 🗺️ Emergency Hospital Locator & Dijkstra Pathfinding
- Real-time GPS detection using browser Geolocation API.
- Live OpenStreetMap queries via **Overpass API** to discover hospitals within a 5 km radius.
- Interactive **Leaflet** map with custom user, hospital, and destination markers.
- **Multi-Alternative Road Network Graph**: Queries the **OSRM Driving Engine** with `alternatives=true` to fetch route options, merges shared intersection waypoints into an adjacency graph, and executes **Dijkstra's Algorithm** to calculate and verify the optimal driving path through the street network.

### 6. 🛡️ Role-Based Access Control (RBAC)
- Role segregation for `patient`, `doctor`, and `admin`.
- Centralized role-to-dashboard navigation resolver ([roleUtils.js](client/src/utils/roleUtils.js)).
- Route-level protection via `ProtectedRoute` redirecting unauthorized access to `/unauthorized`.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite UI                   │
│   (AuthContext • Leaflet • React Router • Hot Toast)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP + Credentials (JWT Cookie)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Server                    │
│  ├── Rate Limiter (/api/auth/login)                    │
│  ├── Auth & Role RBAC Middleware                       │
│  ├── Appointment State Machine & Validator             │
│  └── Sanitized Global Error Handler                    │
└───────┬───────────────────┬────────────────────┬───────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌──────────────┐    ┌───────────────┐    ┌───────────────┐
│   MongoDB    │    │ Razorpay API  │    │ Google Gemini │
│   Mongoose   │    │  (Orders,     │    │  2.0 Flash    │
│  (Indexed)   │    │   Refunds)    │    │  (AI Triage)  │
└──────────────┘    └───────────────┘    └───────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | High-performance SPA with fast HMR |
| **Routing** | React Router v7 | Declarative nested and protected routes |
| **Maps & Spatial** | Leaflet & React-Leaflet | Interactive emergency hospital mapping |
| **HTTP Client** | Axios | Configured with `withCredentials: true` |
| **Icons & Feedback** | React Icons (Feather) & React Hot Toast | Clean UI iconography and notification toasts |
| **Backend Runtime** | Node.js & Express 4 | RESTful API server |
| **Database & ODM** | MongoDB & Mongoose 8 | Document store with compound unique indexes |
| **Authentication** | JWT & bcryptjs | Stateless auth via `httpOnly` secure cookies |
| **Security** | Express Rate Limit & Custom ReDoS Sanitizer | Brute-force & regex attack mitigation |
| **Payment Gateway** | Razorpay SDK | Payment order creation, verification & refunds |
| **AI / LLM** | Google Generative AI SDK (`gemini-2.0-flash`) | Symptom analysis and doctor recommendations |
| **Spatial APIs** | Overpass API & Project OSRM | Live hospital discovery & road routing |

---

## 📁 Project Structure

```
HealthBook/
├── server/
│   ├── controllers/
│   │   ├── adminController.js         # Stats, doctor approval & rejection
│   │   ├── aiController.js            # Gemini symptom analysis & rule fallback
│   │   ├── appointmentController.js   # Booking, cancellation, doctor schedule
│   │   ├── authController.js          # Registration, login, logout, getMe
│   │   ├── doctorController.js        # Doctor discovery, profile, slot calculation
│   │   └── paymentController.js       # Razorpay orders, HMAC verify & refunds
│   ├── middleware/
│   │   └── auth.js                    # JWT verify & authorize(roles...)
│   ├── models/
│   │   ├── Appointment.js             # Appointment schema + unique slot index
│   │   ├── Doctor.js                  # Doctor profile & availability rules
│   │   └── User.js                    # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js              # Rate-limited auth endpoints
│   │   ├── doctorRoutes.js
│   │   └── paymentRoutes.js
│   ├── scripts/
│   │   └── seedAdmin.js               # Creates default admin user
│   ├── .env.example                   # Backend environment template
│   ├── package.json
│   └── server.js                      # Server startup & DB connection
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js               # Axios instance with baseURL & interceptor
    │   ├── components/
    │   │   ├── Navbar.jsx             # Top navigation with role links & emergency
    │   │   ├── ProtectedRoute.jsx     # Route guard with /unauthorized redirect
    │   │   ├── SlotPicker.jsx         # Date-picker and dynamic time slot grid
    │   │   ├── Spinner.jsx            # Loading animation
    │   │   └── SymptomNavigator.jsx   # AI symptom input & specialty tagger
    │   ├── context/
    │   │   └── AuthContext.jsx        # Global user session & auth methods
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx     # Doctor verification & analytics
    │   │   ├── DoctorDashboard.jsx    # Schedule editor & patient appointments
    │   │   ├── Landing.jsx            # Hero page with feature highlights
    │   │   ├── Login.jsx              # Sign-in form
    │   │   ├── NearbyHospitals.jsx    # Live map, Overpass query, Dijkstra path
    │   │   ├── NotFound.jsx           # 404 page
    │   │   ├── PatientDashboard.jsx   # Doctor directory, booking & payment
    │   │   ├── Register.jsx           # Patient/Doctor registration
    │   │   └── Unauthorized.jsx       # 403 access denied screen
    │   ├── utils/
    │   │   ├── dijkstra.js            # Graph-based Dijkstra shortest path
    │   │   └── roleUtils.js           # Centralized role ➔ path mapping
    │   ├── App.jsx                    # Route switchboard
    │   ├── index.css                  # Design system tokens and styles
    │   └── main.jsx
    ├── .env.example                   # Client environment template
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 📦 Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas connection string

---

## ⚙️ Getting Started

### 1. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install backend dependencies
npm install

# Create environment configuration
cp .env.example .env

# Start server in development mode (with nodemon)
npm run dev
```

The backend server will start on **`http://localhost:5000`**.

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to the client directory
cd client

# Install frontend dependencies
npm install

# Create environment configuration (optional)
cp .env.example .env

# Start the Vite development server
npm run dev
```

The client app will launch at **`http://localhost:5173`**.

### 3. Seed Admin Account

To seed the initial administrator user into your database:

```bash
cd server
npm run seed:admin
```

---

## 🔑 Environment Configuration

### Backend (`server/.env`)

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `PORT` | No | `5000` | Port on which Express server listens |
| `MONGO_URI` | **Yes** | `mongodb://localhost:27017/healthbook` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Strong secret for signing auth tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry duration |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin |
| `RAZORPAY_KEY_ID` | Optional | — | Razorpay test Key ID |
| `RAZORPAY_KEY_SECRET` | Optional | — | Razorpay test Key Secret |
| `GEMINI_API_KEY` | Optional | — | Google Gemini API key for AI symptom triage |

> **Note on Optional Keys:**
> - If `RAZORPAY_KEY_ID` is omitted, the app runs normally, but checkout requests will simulate errors.
> - If `GEMINI_API_KEY` is omitted, the symptom navigator automatically switches to its offline rule-based classification engine.

### Frontend (`client/.env`)

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Base URL for backend API requests |

---

## 👤 Default Credentials

After running `npm run seed:admin` in the `server` directory, you can sign in with:

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| **Admin** | `admin@healthbook.com` | `Admin@1234` | `http://localhost:5173/admin` |

To test Patient and Doctor functionality, simply click **"Register"** on the frontend navigation bar and select either **"Patient"** or **"Doctor"**.

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`patient` or `doctor`) |
| `POST` | `/api/auth/login` | Public (Rate Limited) | Sign in and set HttpOnly auth cookie |
| `POST` | `/api/auth/logout` | Public | Invalidate auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Public | List approved doctors (with specialty, name & fee filters) |
| `GET` | `/api/doctors/:id` | Public | Retrieve a doctor's public profile |
| `GET` | `/api/doctors/:id/slots` | Public | Compute open slots for a doctor on `?date=YYYY-MM-DD` |
| `GET` | `/api/doctors/me/profile` | Doctor | Retrieve current doctor's own profile and schedule |
| `PUT` | `/api/doctors/profile` | Doctor | Update bio, consultation fee, slot duration & availability |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Patient | Book an appointment slot |
| `GET` | `/api/appointments/mine` | Patient | Retrieve patient's appointments |
| `PATCH` | `/api/appointments/:id/cancel` | Patient | Cancel appointment and trigger payment refund |
| `GET` | `/api/appointments/doctor` | Doctor | Retrieve all appointments booked with doctor |
| `PATCH` | `/api/appointments/:id/status` | Doctor | Update status (`confirmed`, `completed`, `cancelled`) |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Patient | Generate a Razorpay INR order for an appointment |
| `POST` | `/api/payments/verify` | Patient | Verify Razorpay HMAC signature & mark slot confirmed |
| `POST` | `/api/payments/refund` | Authorized | Process refund for a paid appointment |

### AI Navigator (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/navigate` | Public | Submit symptom text for specialty recommendation |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Total counts for patients, doctors, appointments & revenue |
| `GET` | `/api/admin/doctors` | Admin | List doctors filtered by approval status |
| `PUT` | `/api/admin/doctors/:id/approve` | Admin | Approve pending doctor application |
| `PUT` | `/api/admin/doctors/:id/reject` | Admin | Reject / suspend doctor account |

---

## 🔒 Security & Architecture Highlights

1. **Brute-Force Protection**: The `/api/auth/login` route is protected by `express-rate-limit` (maximum 10 login attempts per 15-minute window per IP).
2. **ReDoS Attack Mitigation**: User input in `$regex` queries (such as the doctor specialty filter) is automatically sanitized to escape metacharacters (`/[.*+?^${}()|[\]\\]/g`).
3. **Data Leakage Prevention**: All 500 server error catch blocks return sanitized, generic messages (`"Internal server error. Please try again later."`) to prevent exposing internal stack traces or database connection details.
4. **Secure Cookie Storage**: Authentication tokens are stored in `httpOnly`, `sameSite: 'lax'` cookies, preventing XSS-based credential theft.
5. **Double-Booking Shield**: MongoDB compound unique index enforces data integrity even under high-concurrency requests.

---

## 👥 User Roles & Workflows

### 🏥 Patient Workflow
1. Browse approved doctors by specialty or consultation fee.
2. Use the **AI Symptom Navigator** if unsure which specialist to see.
3. Select an available date and time slot generated dynamically from the doctor's weekly rules.
4. Complete instant checkout via Razorpay.
5. View status updates, access receipt details, or cancel appointments (which automatically refunds payments).
6. Click **"Nearby Hospitals"** in the navigation bar to locate emergency rooms near their current GPS location with shortest-path routing.

### 🩺 Doctor Workflow
1. Register as a Doctor and wait for Admin verification.
2. Once approved, configure working days, hours (e.g. `Monday 09:00 - 17:00`), consultation fee, and slot duration (e.g. `30` minutes).
3. Monitor upcoming appointments in real time.
4. Confirm slots and mark consultations **"Completed"** once concluded.

### 🛡️ Admin Workflow
1. Monitor platform-wide metrics: total registered patients, approved doctors, completed appointments, and total revenue.
2. Review new doctor applications, inspect credentials, and approve or reject them.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
