# HealthBook Client

The frontend for the HealthBook Doctor Appointment & Healthcare Navigation platform, built with React 19, Vite, and React Router v7.

---

## Features

- **Role-Based Authentication**: Secure authentication via HttpOnly JWT cookies with automatic role routing (`/patient`, `/doctor`, `/admin`).
- **AI Symptom Navigator**: Instant specialty recommendation powered by Google Gemini with rule-based fallback.
- **Doctor Directory & Booking**: Real-time slot generation and selection based on doctor working hours and existing bookings.
- **Integrated Payments**: Razorpay checkout with client-side verification and refund state display.
- **Emergency Hospital Navigator**: Real-time GPS location, Overpass API query for nearby hospitals, Leaflet map rendering, and Dijkstra pathfinding across OSRM driving route alternatives.

---

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, defaults to http://localhost:5000/api)
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Production build
npm run build

# 5. Lint
npm run lint
```

---

## Project Structure

```
src/
├── api/            # Axios instance and API interceptors
├── components/     # Reusable UI components (Navbar, SlotPicker, SymptomNavigator, etc.)
├── context/        # AuthContext for session management
├── pages/          # Application views (Landing, Login, Register, Dashboards, NearbyHospitals)
├── utils/          # Dijkstra pathfinding and role-routing utilities
├── App.jsx         # Route configuration
├── index.css       # Design system CSS variables and layout styles
└── main.jsx        # Root mount point
```
