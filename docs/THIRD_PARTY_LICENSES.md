# Third-Party Licenses

This document inventories all direct dependencies used in the HealthBook project (`client/package.json` and `server/package.json`), along with their installed versions and license classifications.

> [!WARNING]
> **Non-Permissive / Ethical License Flagged**:
> `react-leaflet` (v5.0.0) is distributed under the **Hippocratic-2.1** license. The Hippocratic License is an ethical source-available license that restricts software use based on human rights criteria. While derived from MIT, it is not considered a purely permissive OSI-approved license. All other direct dependencies use standard permissive licenses (MIT, Apache-2.0, BSD-2-Clause, ISC).

---

## Client Dependencies (`client/`)

| Package Name | Declared Version | Installed Version | License | License Category |
| :--- | :--- | :--- | :--- | :--- |
| `@radix-ui/react-avatar` | `^1.2.6` | `1.2.6` | MIT | Permissive |
| `@radix-ui/react-dialog` | `^1.1.23` | `1.1.23` | MIT | Permissive |
| `@radix-ui/react-dropdown-menu` | `^2.1.24` | `2.1.24` | MIT | Permissive |
| `@radix-ui/react-tabs` | `^1.1.21` | `1.1.21` | MIT | Permissive |
| `@radix-ui/react-tooltip` | `^1.2.16` | `1.2.16` | MIT | Permissive |
| `@tailwindcss/vite` | `^4.3.3` | `4.3.3` | MIT | Permissive |
| `axios` | `^1.19.0` | `1.19.0` | MIT | Permissive |
| `framer-motion` | `^14.0.0` | `14.0.0` | MIT | Permissive |
| `leaflet` | `^1.9.4` | `1.9.4` | BSD-2-Clause | Permissive |
| `lucide-react` | `^1.50.0` | `1.50.0` | ISC | Permissive |
| `react` | `^19.2.8` | `19.2.8` | MIT | Permissive |
| `react-dom` | `^19.2.8` | `19.2.8` | MIT | Permissive |
| `react-hot-toast` | `^2.6.0` | `2.6.0` | MIT | Permissive |
| `react-icons` | `^5.7.0` | `5.7.0` | MIT | Permissive |
| `react-leaflet` | `^5.0.0` | `5.0.0` | **Hippocratic-2.1** | **Flagged (Ethical / Non-Permissive)** |
| `react-router-dom` | `^7.18.2` | `7.18.2` | MIT | Permissive |
| `recharts` | `^3.10.1` | `3.10.1` | MIT | Permissive |
| `tailwindcss` | `^4.3.3` | `4.3.3` | MIT | Permissive |

---

## Server Dependencies (`server/`)

| Package Name | Declared Version | Installed Version | License | License Category |
| :--- | :--- | :--- | :--- | :--- |
| `@google/generative-ai` | `^0.21.0` | `0.21.0` | Apache-2.0 | Permissive |
| `bcryptjs` | `^2.4.3` | `2.4.3` | MIT | Permissive |
| `cookie-parser` | `^1.4.6` | `1.4.7` | MIT | Permissive |
| `cors` | `^2.8.5` | `2.8.6` | MIT | Permissive |
| `dotenv` | `^16.3.1` | `16.6.1` | BSD-2-Clause | Permissive |
| `express` | `^4.18.2` | `4.22.3` | MIT | Permissive |
| `express-rate-limit` | `^8.7.0` | `8.7.0` | MIT | Permissive |
| `jsonwebtoken` | `^9.0.2` | `9.0.3` | MIT | Permissive |
| `mongoose` | `^8.0.3` | `8.24.3` | MIT | Permissive |
| `multer` | `^2.4.0` | `2.4.0` | MIT | Permissive |
| `razorpay` | `^2.9.2` | `2.9.8` | MIT | Permissive |

---

## License Overview

- **MIT License**: Standard permissive license allowing free reuse, modification, and distribution.
- **Apache 2.0**: Permissive license with explicit patent grants and trademark protection.
- **BSD 2-Clause**: Permissive open-source license with simplified disclaimer terms.
- **ISC**: Functionally equivalent to the two-clause BSD license and MIT.
- **Hippocratic License 2.1**: Adds human rights adherence requirements to standard open source permissions.
