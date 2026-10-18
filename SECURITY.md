# Security Policy

The HealthBook team takes the security of our application, user data, and infrastructure seriously. We appreciate your efforts to responsibly disclose vulnerabilities.

---

## 1. Supported Versions

Security updates are actively applied to the main branch:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## 2. Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities privately:
1. Navigate to the repository's **Security** tab on GitHub.
2. Select **Advisories** and click **Report a vulnerability** to open a private GitHub Security Advisory.
3. If GitHub Private Vulnerability Reporting is unavailable, you may contact the maintainers via a private repository communication channel.

### What to Include
To help us triage and resolve the issue quickly, please provide:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
- Relevant environment details (Node version, browser, OS, MongoDB version).
- Any potential mitigations or suggested fixes.

---

## 3. Scope

### In Scope
- Remote Code Execution (RCE)
- Authentication or authorization bypass (JWT tampering, privilege escalation)
- Injection attacks (NoSQL injection, Command injection, SSRF)
- Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)
- Sensitive data exposure or credential leaks in API responses
- Insecure direct object references (IDOR) impacting user records or appointments

### Out of Scope
- Denial of Service (DoS/DDoS) attacks against development/demo servers
- Social engineering, phishing, or physical attacks
- Issues requiring physical access to a user's unlocked device
- Reports from automated vulnerability scanners without a practical proof of concept
- Self-XSS or attacks requiring unrealistic user interaction

---

## 4. Response Timeline

- **Initial Acknowledgment:** Within 48 hours of receipt.
- **Triage and Assessment:** Within 5 business days.
- **Fix & Patch Deployment:** As quickly as reasonably possible depending on severity.
- **Public Disclosure:** Coordinated after a fix has been released and verified.
