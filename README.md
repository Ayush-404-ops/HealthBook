# 🏥 HealthBook — Full Stack Doctor Appointment System

A production-ready **MERN Stack** application for booking doctor appointments with AI-driven symptom navigation and integrated Razorpay payments.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Razorpay |
| AI | Google Gemini AI |

---

## 📁 Project Structure

```
HealthBook/
├── server/               # Express + MongoDB backend
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── scripts/          # Seed scripts
│   ├── server.js         # Entry point
│   └── .env.example      # Environment variable template
└── client/               # React frontend (coming soon)
```

---

## ⚙️ Backend Setup

```bash
cd server
npm install
cp .env.example .env    # Fill in your credentials
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret |
| `GEMINI_API_KEY` | Google Gemini AI key |

---

## 🔐 API Routes

| Prefix | Module |
|---|---|
| `/api/auth` | Register, Login, Profile |
| `/api/doctors` | Doctor listing & availability |
| `/api/appointments` | Book & manage appointments |
| `/api/payments` | Razorpay order & verification |
| `/api/ai` | AI Symptom Navigator |
| `/api/admin` | Admin dashboard operations |

---

## 👥 Roles

- **Patient** — Browse doctors, book & pay for appointments
- **Doctor** — Manage schedule, view upcoming appointments
- **Admin** — Approve doctors, view platform analytics

---

## 🌱 Seed Admin

```bash
npm run seed:admin
```

---

## 📄 License

MIT
