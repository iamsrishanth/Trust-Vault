# 🛡️ TrustVault — Blockchain Evidence Management System

A blockchain-inspired crime evidence management system that creates tamper-proof, transparent records of evidence custody transfers using cryptographic hashing and digital signatures.

## 🎯 Problem

Crime evidence is vulnerable to tampering, loss, and broken chains of custody. Traditional paper-based logs lack transparency and are easy to forge, leading to compromised court proceedings and wrongful outcomes.

## 💡 Solution

TrustVault provides an **immutable digital chain of custody** where every evidence handoff is:

- **Hashed** with SHA-256 to create a unique digital fingerprint
- **Signed** with HMAC-SHA256 digital signatures to verify identity
- **Chained** so each block references the previous one — any tampering breaks the chain
- **Auditable** with a full chronological history downloadable as a report

---

## 🏗️ How It Works

### Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   React UI   │───▶│ Data Service │───▶│ localStorage │
│  (Vite + TS) │    │   Layer      │    │  (Blockchain │
│              │    │              │    │   Blocks)    │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Supabase   │    │  CryptoJS    │
│   (Auth)     │    │  (SHA-256 +  │
│              │    │   HMAC)      │
└──────────────┘    └──────────────┘
```

### Evidence Lifecycle

| Step | Role | Action |
|------|------|--------|
| 1 | **Police Officer** | Registers evidence → uploads file → SHA-256 hash generated → genesis block created |
| 2 | **Police Officer** | Transfers custody to Lab or Hospital → new block added with digital signature |
| 3 | **Lab Technician** | Verifies evidence integrity → performs analysis → submits signed report |
| 4 | **Hospital** | Conducts medical examination → submits signed report |
| 5 | **Court Official** | Verifies the entire blockchain chain → downloads audit report → closes case |

### Blockchain Chain Structure

Each custody transfer creates a **block** containing:

```
Block #N
├── Case ID
├── From → To (custody transfer)
├── Action description
├── Timestamp
├── File Hash (SHA-256 of evidence)
├── Previous Block Hash (links to Block #N-1)
└── Digital Signature (HMAC-SHA256)
```

If anyone modifies a past block, the hash chain breaks — **tampering is instantly detectable**.

---

## ✨ Features

- **Evidence Registration** — Upload files with automatic SHA-256 hashing, evidence type classification (physical, digital, biological, weapon, documentary)
- **Custody Transfers** — Digitally signed handoffs between Police → Lab → Hospital → Court
- **Chain Verification** — One-click integrity check validates every block in the chain
- **Audit Trail** — Searchable page with case filtering and downloadable reports
- **Role-Based Access** — 5 roles: Police, Lab, Hospital, Court, Admin
- **Dark Mode** — Toggle between light and dark themes
- **Premium UI** — Glassmorphism, gradient borders, micro-animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS (with custom glassmorphism utilities) |
| Auth | Supabase Auth (JWT-based) |
| Cryptography | CryptoJS (SHA-256 hashing, HMAC-SHA256 signatures) |
| Charts | Recharts (Admin dashboard) |
| State | React Context + localStorage |
| Font | Inter (Google Fonts) |

---

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/your-username/Trust-Vault.git
cd Trust-Vault
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory (or use the existing one):

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

> You need a [Supabase](https://supabase.com/) project for authentication. The free tier works fine.

**4. Start the development server**

```bash
npm run dev
```

The app will open at **<http://localhost:5173/>**

**5. Build for production** (optional)

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboards/
│   │   ├── PoliceDashboard.tsx    # Evidence registration & transfers
│   │   ├── LabDashboard.tsx       # Forensic analysis & reports
│   │   ├── HospitalDashboard.tsx  # Medical examination reports
│   │   ├── CourtDashboard.tsx     # Chain verification & case closure
│   │   └── AdminDashboard.tsx     # System overview & analytics
│   ├── CustodyChain.tsx           # Blockchain timeline visualization
│   ├── Layout.tsx                 # App shell with dark mode toggle
│   └── StatusBadge.tsx            # Case status indicator
├── contexts/
│   └── AuthContext.tsx            # Supabase auth provider
├── lib/
│   ├── blockchain.ts              # SHA-256, HMAC-SHA256, chain verification
│   ├── dataService.ts             # Centralized CRUD (CaseService, BlockService)
│   └── mockData.ts                # TypeScript interfaces & types
├── pages/
│   ├── Index.tsx                  # Landing page
│   ├── Auth.tsx                   # Login / Sign up
│   ├── Dashboard.tsx              # Role-based dashboard router
│   └── AuditTrail.tsx             # Full audit trail viewer
└── App.tsx                        # Routes & providers
```

---

## 🧪 Testing the App

1. **Sign up** at `/auth` with any email — select a role (Police, Lab, Court, etc.)
2. **Police**: Register a new case → upload evidence → see SHA-256 hash → transfer to Lab
3. **Lab**: Verify evidence integrity → submit analysis report → transfer to Court
4. **Court**: Verify blockchain chain → download audit report → close case
5. **Audit Trail**: Go to `/audit` → search cases → view full custody history
6. **Dark Mode**: Click the 🌙 icon in the top navigation bar

---

## 📜 License

MIT
