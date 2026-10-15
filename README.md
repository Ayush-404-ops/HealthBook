# 🏥 HealthBook — Intelligent Doctor Appointment & Healthcare Platform

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=flat-square&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-14-EF008F?style=flat-square&logo=framer&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-HMAC_Verified-3395FF?style=flat-square&logo=razorpay&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A production-grade MERN Stack healthcare ecosystem** featuring Gemini AI symptom triage, conflict-free appointment scheduling with real-time slot locking, Razorpay HMAC payment escrow with automated refunds, Dijkstra shortest-path emergency routing via OpenStreetMap/OSRM, and gamified Health XP progression inspired by HabitKit & Habitica.

</div>

---

## 📑 Table of Contents

- [Live Features](#-live-features)
- [UI & Design System](#-ui--design-system)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#%EF%B8%8F-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Default Credentials](#-default-credentials)
- [API Reference](#-api-reference)
- [Security Highlights](#-security-highlights)
- [User Roles & Workflows](#-user-roles--workflows)
- [UI Component Library](#-ui-component-library)
- [License](#-license)

---

## ✨ Live Features

### 1. 🤖 AI Symptom Navigator (Gemini 2.0 Flash)
- Natural-language symptom triage powered by **Google Gemini 2.0 Flash**.
- Recommends the appropriate medical specialty (Cardiologist, Dermatologist, Orthopedist, etc.) with severity assessment.
- **Intelligent Fallback Rule Engine**: Offline keyword matching when API keys are unavailable or rate-limited — zero disruption to users.
- Live typewriter animation in the hero section simulates real Gemini AI interactions.

### 2. 📅 Conflict-Free Appointment Scheduling
- **Dynamic Slot Generation**: Auto-splits doctor working hours into precise `slotDurationMinutes` intervals.
- **Double-Booking Prevention**: MongoDB partial unique compound index on `{ doctor, date, startTime }` for `pending`/`confirmed` states rejects simultaneous race conditions atomically.
- **Past-Time Validation**: Server-side rejection of elapsed slots — no stale bookings possible.
- **Animated Slot Picker**: Live 30-min slot grid with auto-cycling highlight and real-time availability indicators.

### 3. 💳 Razorpay Payment Escrow & Refund Lifecycle
- **Order Generation**: Creates INR payment orders via the official Razorpay SDK.
- **HMAC-SHA256 Signature Verification**: Cryptographically verifies payment authenticity on the backend before confirming any slot.
- **Automated Refund Logic**: Cancellation by patient or doctor instantly triggers Razorpay refund and updates payment status to `refunded`.

### 4. 🔄 Strict Appointment State Machine
- Linear, enforced state transitions:
  - `pending` → `confirmed` or `cancelled`
  - `confirmed` → `completed` or `cancelled`
  - `completed` & `cancelled` are terminal (immutable) states.
- Doctors cannot mark `completed` unless the slot is both **confirmed** and **paid**.

### 5. 🗺️ Emergency Hospital Locator & Dijkstra Pathfinding
- Real-time GPS detection via browser Geolocation API.
- Live OpenStreetMap **Overpass API** queries — discovers hospitals within a 5 km radius.
- Interactive **Leaflet** map with custom SVG markers for user position, hospitals, and optimal destination.
- **Multi-Alternative Dijkstra Routing**: Queries OSRM `alternatives=true`, merges shared intersection waypoints into an adjacency graph, and runs custom Dijkstra to compute the verified optimal driving route.

### 6. 🎮 Gamified Health XP & Wellness Streak System
- Inspired by **HabitKit**, **Habitica**, and **Forest App** UI patterns.
- GitHub-style **Activity Heatmap** — 5-week intensity grid of health check-ins, vitals, and consultations.
- **XP Progression Bar**: Earn Health XP by fulfilling appointments, logging vitals, and maintaining hydration streaks.
- **Vitality Levels**: Progress from Novice to Vitality Sentinel with unlockable clinical milestone badges.
- **Interactive Daily Quests**: Toggle quest completion and earn XP in real time with toast notifications.
- **Wellness Tree Growth**: Visual tree stages (sprout → sapling → blooming bonsai) tied to streak count.

### 7. 🛡️ Role-Based Access Control (RBAC)
- Three distinct roles: `patient`, `doctor`, `admin`.
- Centralized role-to-dashboard path resolver (`roleUtils.js`).
- `ProtectedRoute` component guards all dashboard routes with redirect to `/unauthorized`.

---

## 🎨 UI & Design System

### Design Philosophy
The frontend UI was rebuilt from scratch with a **premium, gamified healthcare aesthetic** inspired by:
- **[Lapa Ninja](https://www.lapa.ninja/category/open-source/)** — Landing page rhythm, section spacing, and scroll reveal patterns.
- **[Webflow](https://webflow.com)** — Hero reveal animations and slide-in motion choreography.
- **[Interface In Game](https://interfaceingame.com/screenshots/)** — HUD panels, XP bars, badge systems, and gamified dashboard elements.
- **[Habitica](https://habitica.com)** — Gamified quest system, XP coins, and reward progression.
- **[HabitKit](https://www.habitkit.app/)** — GitHub-style heatmap streaks and activity visualization.

### Animation System (Framer Motion 14)
- **Hero Left Panel**: Staggered `fadeUp` text reveals using `staggerContainer` variants, animated feature pill tags with `backOut` spring entrance, floating animated stat counters with `useCountUp` scroll hook.
- **Hero Right Panel** (`HeroMockup`): Live AI typewriter cycling 4 symptom queries, animated heartbeat SVG `pathLength` draw, auto-cycling slot highlight every 2.2s, XP progress bar animation, success state with spring scale, 3 floating gamified badges (Gemini AI pulse, Zero Queue rock rotation, +150 XP slide-in).
- **Scroll Sections**: All sections use `whileInView` with `once: true` viewport triggers.
- **Micro-animations**: Icon rotation on stat cards, hover lift on specialty cards, hover slide on feature bullets.

### Dark / Light Mode
- One-click toggle between dark and light — no system preference dependency.
- `ThemeContext` persists preference to `localStorage`.
- Custom CSS variables + Tailwind v4 `dark:` utilities across all 18 UI components.

### Component Library (`/components/ui/`)
| Component | Description |
|---|---|
| `Button` | Primary, outline, ghost, danger variants with icon support |
| `Card` | Base card with optional `glass` variant |
| `Badge` | Status badges: paid, pending, confirmed, completed, cancelled |
| `Input` / `Textarea` / `Select` | Form inputs with error state and blue focus ring |
| `Avatar` | User avatar with image fallback initials |
| `Modal` | Accessible dialog using Radix UI |
| `ConfirmDialog` | Destructive action confirmation modal |
| `CommandPalette` | ⌘K searchable command launcher |
| `Tabs` | Radix-powered tab navigation |
| `Table` | Sortable data table |
| `Pagination` | Page navigation with ellipsis |
| `Skeleton` | Content loading placeholder |
| `EmptyState` | Empty data illustrations |
| `Tooltip` | Radix-powered hover tooltip |
| `ThemeToggle` | Animated sun/moon dark mode toggle |
| `HealthHabitHUD` | Full gamification panel (heatmap, quests, badges, XP bar, tree) |
| `NotificationBell` | Badge-count notification dropdown |
| `UserDropdown` | Avatar + role pill + settings menu |

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│        React 19 + Vite + TailwindCSS v4 Frontend           │
│  Framer Motion 14 • Lucide Icons • Radix UI Primitives    │
│  AuthContext • ThemeContext • React Router v7 • Recharts   │
└────────────────────────────┴─────────────────────────┘
                          │ HTTP + JWT HttpOnly Cookie
                          ▼
┌────────────────────────────────────────────────────────┐
│              Express.js REST API Server                     │
│  ├── Rate Limiter • Auth Middleware • RBAC Guards          │
│  ├── Appointment State Machine & Slot Validator          │
│  └── Sanitized Global Error Handler                       │
└────────┴─────────────┴────────────────┴─────────────┘
        │              │               │            │
        ▼              ▼               ▼            ▼
┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐
│ MongoDB  │ │ Razorpay │ │Google Gemini│ │  Overpass  │
│ Mongoose │ │ Orders & │ │ 2.0 Flash  │ │  API+OSRM  │
│ Indexed  │ │ Refunds  │ │ AI Triage  │ │  Dijkstra  │
└──────────┘ └──────────┘ └───────────┘ └───────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|:---:|---|
| **Frontend Framework** | React + Vite | 19 / 8 | SPA with fast HMR |
| **Routing** | React Router | v7 | Declarative nested & protected routes |
| **Styling** | TailwindCSS | v4 | Utility-first CSS with `dark:` variants |
| **Animations** | Framer Motion | 14 | Page reveals, scroll triggers, micro-animations |
| **UI Primitives** | Radix UI | — | Dialog, Dropdown, Tabs, Avatar, Tooltip |
| **Icons** | Lucide React | 1.50 | Consistent icon set across all components |
| **Maps & Spatial** | Leaflet + React-Leaflet | 1.9 / 5.0 | Interactive emergency hospital mapping |
| **Charts** | Recharts | 3 | Doctor dashboard analytics |
| **HTTP Client** | Axios | 1.19 | `withCredentials: true` JWT cookie transport |
| **Notifications** | React Hot Toast | 2.6 | XP toast, success/error feedback |
| **Backend Runtime** | Node.js + Express | 18+ / 4 | RESTful API server |
| **Database & ODM** | MongoDB + Mongoose | — / 8 | Document store with compound unique indexes |
| **Authentication** | JWT + bcryptjs | — | Stateless auth via `httpOnly` secure cookies |
| **Security** | Express Rate Limit | — | Brute-force & ReDoS mitigation |
| **Payment Gateway** | Razorpay SDK | — | Order creation, HMAC verification & refunds |
| **AI / LLM** | Google Generative AI SDK | gemini-2.0-flash | Symptom triage and specialist matching |
| **Spatial APIs** | Overpass API + OSRM | — | Hospital discovery & Dijkstra road routing |

---

## 📁 Project Structure

```
HealthBook/
├── server/
│   ├── controllers/
│   │   ├── adminController.js         # Stats, doctor approval & rejection
│   │   ├── aiController.js            # Gemini triage + offline rule fallback
│   │   ├── appointmentController.js   # Booking, state machine, cancellation
│   │   ├── authController.js          # Register, login, logout, getMe
│   │   ├── doctorController.js        # Discovery, profile, dynamic slot calc
│   │   └── paymentController.js       # Razorpay orders, HMAC verify & refunds
│   ├── middleware/
│   │   └── auth.js                    # JWT verify & authorize(roles...)
│   ├── models/
│   │   ├── Appointment.js             # Schema + unique partial slot index
│   │   ├── Doctor.js                  # Profile, availability rules, fee
│   │   └── User.js                    # User schema + bcrypt password hook
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js              # Rate-limited auth endpoints
│   │   ├── doctorRoutes.js
│   │   └── paymentRoutes.js
│   ├── scripts/
│   │   └── seedAdmin.js               # Seeds default admin account
│   ├── .env.example
│   └── server.js                      # Express bootstrap & DB connection
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js               # Axios instance with baseURL & interceptor
    │   ├── components/
    │   │   ├── auth/                  # Auth guard wrappers
    │   │   ├── landing/
    │   │   │   └── BentoFeatures.jsx  # Interactive bento grid feature section
    │   │   ├── layout/
    │   │   │   ├── DashboardLayout.jsx # Sidebar + topbar dashboard shell
    │   │   │   ├── Footer.jsx          # Site footer
    │   │   │   ├── Navbar.jsx          # Public nav with dark mode toggle
    │   │   │   ├── NotificationBell.jsx # Notification badge dropdown
    │   │   │   ├── PublicLayout.jsx    # Wraps Navbar + Footer
    │   │   │   └── UserDropdown.jsx    # Avatar + role + logout menu
    │   │   ├── ui/                    # 18-component design system (see table above)
    │   │   ├── ErrorBoundary.jsx      # React error boundary wrapper
    │   │   ├── ProtectedRoute.jsx     # Role-based route guard
    │   │   ├── SlotPicker.jsx         # Date-picker + animated slot grid
    │   │   └── SymptomNavigator.jsx   # AI symptom input & specialty result
    │   ├── context/
    │   │   ├── AuthContext.jsx        # Global user session & auth methods
    │   │   └── ThemeContext.jsx       # Dark/light toggle with localStorage
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx     # Doctor verification & platform analytics
    │   │   ├── DoctorDashboard.jsx    # Schedule editor & patient appointments
    │   │   ├── Landing.jsx            # Animated hero + bento + HUD + FAQ
    │   │   ├── Login.jsx              # Sign-in form
    │   │   ├── NearbyHospitals.jsx    # Live Leaflet map + Overpass + Dijkstra
    │   │   ├── NotFound.jsx           # 404 screen
    │   │   ├── PatientDashboard.jsx   # Doctor directory, booking & payment
    │   │   ├── Register.jsx           # Patient / Doctor registration
    │   │   └── Unauthorized.jsx       # 403 access denied screen
    │   ├── utils/
    │   │   ├── dijkstra.js            # Custom Dijkstra shortest-path algorithm
    │   │   └── roleUtils.js           # Centralized role -> dashboard path map
    │   ├── App.jsx                    # Route switchboard
    │   ├── index.css                  # Design tokens, animations, glow utilities
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 📦 Prerequisites

Ensure the following are installed:

- **Node.js** `v18.x` or higher
- **npm** `v9.x` or higher
- **MongoDB** — Local instance on `localhost:27017` **or** a MongoDB Atlas connection string

---

## ⚙️ Getting Started

### 1. Clone & Navigate

```bash
git clone <your-repo-url>
cd HealthBook
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your values (see Environment Configuration below)
npm run dev
```

Backend starts on **`http://localhost:5000`**.

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend launches at **`http://localhost:5173`**.

### 4. Seed Admin Account

```bash
cd server
npm run seed:admin
```

---

## 🔑 Environment Configuration

### Backend (`server/.env`)

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `PORT` | No | `5000` | Express server port |
| `MONGO_URI` | **Yes** | `mongodb://localhost:27017/healthbook` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Strong secret for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | Token TTL |
| `CLIENT_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `RAZORPAY_KEY_ID` | Optional | — | Razorpay test Key ID |
| `RAZORPAY_KEY_SECRET` | Optional | — | Razorpay test Key Secret |
| `GEMINI_API_KEY` | Optional | — | Google Gemini API key |

> **Optional keys behaviour:**
> - Without `RAZORPAY_KEY_ID` — app runs normally; checkout requests simulate graceful errors.
> - Without `GEMINI_API_KEY` — symptom navigator automatically switches to the built-in offline rule engine.

### Frontend (`client/.env`)

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |

---

## 👤 Default Credentials

After running `npm run seed:admin`:

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| **Admin** | `admin@healthbook.com` | `Admin@1234` | `/admin` |

Register new **Patient** or **Doctor** accounts via the public `/register` page.

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register patient or doctor |
| `POST` | `/api/auth/login` | Public · Rate-Limited | Sign in, set HttpOnly cookie |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Current session profile |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Public | List approved doctors (name, specialty, fee filters) |
| `GET` | `/api/doctors/:id` | Public | Doctor public profile |
| `GET` | `/api/doctors/:id/slots` | Public | Open slots for `?date=YYYY-MM-DD` |
| `GET` | `/api/doctors/me/profile` | Doctor | Own profile & schedule |
| `PUT` | `/api/doctors/profile` | Doctor | Update bio, fee, slot duration & availability |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Patient | Book a slot |
| `GET` | `/api/appointments/mine` | Patient | Patient's appointments |
| `PATCH` | `/api/appointments/:id/cancel` | Patient | Cancel + trigger refund |
| `GET` | `/api/appointments/doctor` | Doctor | All appointments for doctor |
| `PATCH` | `/api/appointments/:id/status` | Doctor | Update status |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Patient | Generate Razorpay INR order |
| `POST` | `/api/payments/verify` | Patient | HMAC verify + confirm slot |
| `POST` | `/api/payments/refund` | Authorized | Process Razorpay refund |

### AI Navigator (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/navigate` | Public | Symptom text → specialty recommendation |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Platform-wide metrics & revenue |
| `GET` | `/api/admin/doctors` | Admin | Doctors by approval status |
| `PUT` | `/api/admin/doctors/:id/approve` | Admin | Approve pending doctor |
| `PUT` | `/api/admin/doctors/:id/reject` | Admin | Reject / suspend doctor |

---

## 🔒 Security Highlights

1. **Brute-Force Protection** — `/api/auth/login` limited to **10 attempts per 15 minutes per IP** via `express-rate-limit`.
2. **ReDoS Mitigation** — All `$regex` inputs (e.g. specialty filter) are sanitized with `/[.*+?^${}()|[\]\\]/g` escaping.
3. **Data Leakage Prevention** — All 500-level catch blocks return generic `"Internal server error. Please try again later."` — no stack traces exposed.
4. **Secure Cookie Auth** — JWT stored in `httpOnly`, `sameSite: 'lax'` cookies, preventing XSS credential theft.
5. **Double-Booking Shield** — MongoDB compound partial unique index enforces slot integrity under high concurrency atomically.
6. **HMAC-SHA256 Payment Verification** — Backend independently recomputes Razorpay signature before finalizing any slot confirmation.

---

## 👥 User Roles & Workflows

### 🏥 Patient
1. Browse approved doctors filtered by specialty or consultation fee.
2. Use the **AI Symptom Navigator** to identify the right specialist from natural-language input.
3. Pick an available date — dynamic slots are generated from the doctor's weekly availability rules.
4. Lock the slot and complete checkout via **Razorpay escrow**.
5. Monitor appointment status, access receipts, or cancel (auto-refund triggered).
6. Visit **Nearby Hospitals** for emergency GPS routing with Dijkstra shortest-path navigation.
7. Track daily wellness with the **Health XP Heatmap & Quest HUD**.

### 🦺 Doctor
1. Register and await admin verification.
2. Once approved, configure working days/hours, consultation fee, and slot duration.
3. Monitor upcoming appointments in the dashboard.
4. Confirm slots and mark consultations **Completed** after the visit.
5. Cancel appointments (auto-refund issued to patient).

### 🛡️ Admin
1. View platform-wide metrics: patients, doctors, appointments, revenue.
2. Review new doctor applications with credentials.
3. Approve or reject/suspend doctor accounts.

---

## 🎨 UI Component Library

The project ships a **fully custom 18-component design system** built with TailwindCSS v4 and Radix UI primitives, all themed with blue/indigo/emerald palette and full dark mode support.

| Category | Components |
|---|---|
| **Forms** | `Input`, `Textarea`, `Select`, `Button` |
| **Data Display** | `Table`, `Badge`, `Avatar`, `Skeleton`, `Pagination` |
| **Feedback** | `EmptyState`, `Tooltip`, `ConfirmDialog` |
| **Navigation** | `Tabs`, `CommandPalette` (Cmd+K), `ThemeToggle` |
| **Overlay** | `Modal`, `NotificationBell`, `UserDropdown` |
| **Gamification** | `HealthHabitHUD` (heatmap + XP + quests + badges + tree) |
| **Layout** | `Card`, `DashboardLayout`, `PublicLayout`, `Navbar`, `Footer` |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  Built with ❤️ using React 19, Node.js, MongoDB, Gemini AI & Framer Motion
</div>
