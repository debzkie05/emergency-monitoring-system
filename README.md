# CampusSafe - Emergency Monitoring & Incident Response System

[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/State_Management-Zustand_4.5-brown)](https://github.com/pmndrs/zustand)
[![Platform](https://img.shields.io/badge/Platforms-Mobile%20%7C%20Web%20%7C%20Desktop-purple)]()

**CampusSafe** is a centralized, cross-platform emergency monitoring, incident dispatch, and safety management ecosystem tailored for university campuses. Designed to bridge the critical gap between students, faculty, and campus security personnel, CampusSafe enables rapid distress signaling, automated dispatch triage, structured incident reporting, and real-time incident resolution tracking across mobile devices, web browsers, and desktop environments.

---

## Table of Contents

- [1. System Overview & Core Objectives](#1-system-overview--core-objectives)
  - [1.1 System Overview](#11-system-overview)
  - [1.2 Core Objectives](#12-core-objectives)
  - [1.3 Target Stakeholders](#13-target-stakeholders)
- [2. System Architecture & Tech Stack](#2-system-architecture--tech-stack)
  - [2.1 Frontend Platforms](#21-frontend-platforms)
  - [2.2 Backend & Data Storage](#22-backend--data-storage)
  - [2.3 Application State & Data Flow Architecture](#23-application-state--data-flow-architecture)
- [3. Scope of Work & Features](#3-scope-of-work--features)
  - [3.1 Feature Matrix](#31-feature-matrix)
  - [3.2 Incident Response Lifecycle](#32-incident-response-lifecycle)
  - [3.3 Out of Scope](#33-out-of-scope)
- [4. Resource Requirements](#4-resource-requirements)
  - [4.1 Hardware Requirements](#41-hardware-requirements)
  - [4.2 Software Tools & Development Stack](#42-software-tools--development-stack)
  - [4.3 Version Control & Environment Setup](#43-version-control--environment-setup)
- [5. Project Directory & File Structure](#5-project-directory--file-structure)
- [6. Setup & Execution Guide](#6-setup--execution-guide)
  - [6.1 Installation](#61-installation)
  - [6.2 Running on Supported Targets](#62-running-on-supported-targets)
  - [6.3 Demo & Testing Accounts](#63-demo--testing-accounts)

---

## 1. System Overview & Core Objectives

### 1.1 System Overview

Traditional university emergency management often relies on fragmented communication channels such as landline intercoms, dispersed hotlines, and manual logbooks. During critical situations—such as medical crises, structural fires, or active security threats—delays in pin-pointing an exact location or notifying available responders can lead to severe consequences.

**CampusSafe** eliminates these bottlenecks by introducing a high-availability, dual-portal client application:
1. **User Client (Students / Faculty):** An intuitive mobile-first interface featuring an instant one-touch SOS distress trigger with countdown buffering, guided incident reporting wizards, building/floor/room selector lookup, live incident tracking timelines, and a community lost-and-found repository.
2. **Admin Command Console (Campus Security / Dispatchers):** A dashboard optimized for desktop and tablet screens providing real-time triage statistics, live incident queues, one-click responder assignment (security, medical, fire, maintenance), status workflow transitions, and records auditing.

### 1.2 Core Objectives

- **Develop a unified cross-platform client supporting Mobile (iOS/Android), Web browsers, and Desktop environments (Windows/macOS):**
  Implement a single responsive TypeScript and React Native codebase that executes natively on mobile devices through Expo, while seamlessly compiling to modern web standards and running across desktop display form factors via responsive layouts and browser wrappers.
- **Build a functional RESTful API backend running on a local development server (localhost):**
  Establish an extensible client-server communication pattern operating in local development environments (`localhost`), handling incident ingestion, user authentication, responder status sync, and notification dispatching.
- **Implement local data persistence and central management across all supported frontend platforms:**
  Maintain synchronized state, offline tolerance, and local storage caching utilizing lightweight reactive state stores (Zustand) backed by asynchronous key-value persistence (`@react-native-async-storage/async-storage`).

### 1.3 Target Stakeholders

| Stakeholder Role | Interface Access | Primary Responsibilities |
| :--- | :--- | :--- |
| **Students & Faculty** | Mobile / Web User Portal | Trigger emergency distress alerts, file detailed incident reports with photos, track response milestones, submit lost and found items. |
| **Security Dispatchers** | Desktop / Web Admin Dashboard | Monitor incoming emergencies in real time, verify details, acknowledge alerts, and dispatch designated response teams. |
| **First Responders** | Mobile / Web Portal | Receive incident assignments, acknowledge dispatches, update physical on-site arrival status, and mark incidents resolved. |
| **Campus Administrators** | Desktop Web Console | View safety metrics, oversee facility hazard trends, and manage campus directory records. |

---

## 2. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  USER CLIENT                                      |
|    - Instant SOS Button (3s Buffer)         - Incident History & Live Timeline    |
|    - Incident Wizard (Type/Location/Photo)  - Lost & Found Hub / Profile Manager  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        CROSS-PLATFORM FRONTEND LAYER                              |
|   React Native (0.86.3) | Expo Router (v57) | React Native Web | TypeScript (6.0) |
|   Responsive Containers: AdminShell / ResponsiveFrame / PhoneFrame                |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                           STATE & PERSISTENCE LAYER                               |
|        Zustand Stores: authStore | incidentStore | lostFoundStore                 |
|        Local Persistence: @react-native-async-storage/async-storage               |
+-----------------------------------------------------------------------------------+
                                         ▲
                                         │
+-----------------------------------------------------------------------------------+
|                              ADMIN COMMAND CONSOLE                                |
|    - Operational Metrics Cards               - Responder Assignment Engine        |
|    - Real-Time Incident Triage Feed          - Status Lifecycle Transition Matrix |
+-----------------------------------------------------------------------------------+
```

### 2.1 Frontend Platforms

- **Cross-Platform Framework:**
  **React Native (`0.86.3`)** integrated with **Expo SDK (`57.0.27`)** and **Expo Router (`57.0.25`)**. Utilizes **React Native Web (`0.21.2`)** for browser execution and responsive styling abstractions that adjust dynamically based on screen viewport breakpoints (`desktop >= 900px`).
- **Mobile Support:**
  Native compilation targets for **iOS** (via Xcode / Expo Go / EAS Build) and **Android** (API Level 24+ via Android Studio / Expo Go / APK bundles) featuring touch gestures, animated triggers, and safe-area context management.
- **Web Support:**
  Modern web application accessible through all standard evergreen browsers including **Google Chrome**, **Mozilla Firefox**, **Microsoft Edge**, and **Apple Safari**.
- **Desktop Support:**
  Native web responsive build optimized for desktop screen widths (Windows, macOS, and Linux). Can be wrapped as a standalone desktop executable via **Electron** or native progressive web app (PWA) containers.

### 2.2 Backend & Data Storage

- **Development Environment:**
  **Node.js (v18.x / v20.x LTS)** development runtime operating on a local server (`localhost`).
- **Framework / Language:**
  **TypeScript (`6.0.3`)** and **JavaScript (ES2023)**. Architectural design adheres to RESTful resource endpoints (`/incidents`, `/responders`, `/users`, `/lost-found`) and modular service patterns.
- **Database Management System:**
  Local data persistence architecture utilizing in-memory relational stores with schema definitions for users, incidents, building locations, and responders, persisted client-side via **AsyncStorage** (`@react-native-async-storage/async-storage 2.2.0`) and structured mock databases.
- **Authentication Method:**
  **Role-Based Access Control (RBAC)** supporting `'user'` and `'admin'` privileges. Features credential validation, persistent session states via Zustand, and simulated asynchronous network delays for production parity.

### 2.3 Application State & Data Flow Architecture

The system utilizes modular, predictable **Zustand** stores decoupled from UI components:

1. **`authStore`**: Manages authenticated user context, roles (`user` vs `admin`), credentials verification, and session lifecycle.
2. **`incidentStore`**: Manages the comprehensive emergency pipeline, holding incident collections, multi-step emergency draft states, status update histories, and dispatch queries.
3. **`lostFoundStore`**: Controls the inventory of lost, found, and claimed campus personal belongings with categorized filtering and submission actions.

---

## 3. Scope of Work & Features

### 3.1 Feature Matrix

| Module | Feature | Description | Platform Support |
| :--- | :--- | :--- | :--- |
| **Authentication** | Dual-Role Secure Sign-In | Role-based authentication (`user` and `admin`) with validation against registered institutional credentials. | Mobile, Web, Desktop |
| **Authentication** | Session State & Sign-Out | Automatic session persistence and one-click session termination with state cleanup. | Mobile, Web, Desktop |
| **Emergency SOS** | One-Touch SOS Panic Trigger | Instant-trigger emergency button with an animated pulse and a 3-second cancellable safety buffer to prevent accidental alerts. | Mobile, Web |
| **Emergency Wizard** | Emergency Categorization | Multi-category classification selector: Medical Emergency, Fire, Security Threat, Physical Accident, Safety Hazard, and Other. | Mobile, Web, Desktop |
| **Emergency Wizard** | Building & Room Locator | Hierarchical campus location picker with predefined university buildings (CCS, COE, Engineering, Library, Gym, Cafeteria, Main Gate), floor levels, and specific room suggestions. | Mobile, Web, Desktop |
| **Emergency Wizard** | Evidence Capture & Description | Image picker integration allowing users to attach incident photos directly from their camera roll or device along with detailed notes. | Mobile, Web, Desktop |
| **Emergency Wizard** | Summary Review & Dispatch | Pre-submission verification card allowing users to review emergency details before dispatching to the security control desk. | Mobile, Web, Desktop |
| **Incident Tracking** | Live Status Timeline | Step-by-step visual audit trail displaying the chronological lifecycle of the report (`REPORTED` → `ACKNOWLEDGED` → `ASSIGNED` → `RESPONDING` → `ON-SITE` → `RESOLVED`). | Mobile, Web, Desktop |
| **Incident Tracking** | Personal Incident History | Filterable list displaying all previous reports submitted by the active user with color-coded status badges and timestamps. | Mobile, Web, Desktop |
| **Admin Command** | Operational KPI Analytics | Executive dashboard displaying counts of Active Incidents, Awaiting Acknowledgment, Resolved Today, and Average Response Times. | Web, Desktop |
| **Admin Command** | Live Incident Triage Feed | Real-time incident list filterable by tab states (`All`, `New`, `Active`, `Resolved`) for rapid prioritization. | Web, Desktop |
| **Admin Command** | Alert Acknowledgment | Formal dispatcher acknowledgment mechanism confirming report receipt and updating user timelines. | Web, Desktop |
| **Admin Command** | First Responder Allocation | Modal dispatch dialog enabling assignment of specific campus responders (Security Patrol, Medical Team Alpha, Fire Response Unit, Maintenance Team). | Web, Desktop |
| **Admin Command** | Status Transition Controller | Dispatch console action sheet allowing administrators to progress incidents through all operational stages with audit notes. | Web, Desktop |
| **Campus Facilities** | Building Directory | Directory of university infrastructure including floor plans and room inventories for campus navigation. | Web, Desktop |
| **Lost & Found** | Item Reporting | Public reporting form to register lost or found property with categorization (Electronics, Personal Items, ID Cards, Accessories), location, and photos. | Mobile, Web, Desktop |
| **Lost & Found** | Item Registry & Search | Publicly accessible catalog with search query filtering and status tags (`LOST`, `FOUND`, `CLAIMED`). | Mobile, Web, Desktop |
| **Lost & Found** | Claim Resolution (Admin) | Administrative controls to verify ownership claims and update item status to `CLAIMED`. | Web, Desktop |
| **User Profile** | Identity & Emergency Contacts | Profile viewing and editing displaying Student ID, Department/Program, and Next-of-Kin Emergency Contact information. | Mobile, Web, Desktop |

### 3.2 Incident Response Lifecycle

CampusSafe enforces a strict state machine governing incident progression:

```
[ REPORTED ] ──► [ ACKNOWLEDGED ] ──► [ ASSIGNED ] ──► [ RESPONDING ] ──► [ ON-SITE ] ──► [ RESOLVED ]
      │                                                                                         ▲
      └───────────────────────────────────► [ CANCELLED ] ──────────────────────────────────────┘
```

1. **`REPORTED`**: Distress signal dispatched by student/faculty with location payload.
2. **`ACKNOWLEDGED`**: Admin/dispatcher flags alert as verified and takes ownership.
3. **`ASSIGNED`**: First responder unit allocated to incident from available personnel.
4. **`RESPONDING`**: Response unit is en route to designated building and floor.
5. **`ON-SITE`**: Responders arrive at scene; immediate containment/medical aid underway.
6. **`RESOLVED`**: Threat neutralized or patient treated; incident formally closed.
7. **`CANCELLED`**: Marked if verified as false alarm or duplicate entry.

### 3.3 Out of Scope

To maintain high stability and project focus during the initial implementation phase, the following features are intentionally classified as out of scope:

- **Third-Party Telephony SMS / Cellular Voice Gateways:** Direct SMS broadcasting without internet connectivity or cellular carrier fallback integration.
- **External Municipal 911 / 999 Automatic Dispatch Integration:** Automated electronic bridge to municipal public safety answering points (PSAPs) outside campus jurisdiction.
- **Hardware IoT Panic Button Hardware Beacons:** Physical Bluetooth LE / LoRaWAN wall-mounted panic hardware buttons.
- **Commercial In-App Payment Gateways:** Fee processing or payments related to lost-and-found property storage or fines.
- **Continuous Global GPS Satellite Tracking Outside Campus Bounds:** Persistent background geolocation tracking when off campus premises (to preserve battery life and student privacy).

---

## 4. Resource Requirements

### 4.1 Hardware Requirements

- **Development Host System:**
  - **Processor:** Intel Core i5 / AMD Ryzen 5 or Apple Silicon (M1/M2/M3/M4) equivalent (minimum 4 cores).
  - **RAM:** Minimum 8 GB (16 GB recommended for concurrent mobile emulator execution).
  - **Storage:** 10 GB available SSD space for Node dependencies, Metro build cache, and build outputs.
- **Testing Devices (Client):**
  - **Android Device:** Android 8.0 (Oreo) or higher, or Android Virtual Device (AVD).
  - **iOS Device:** iOS 14.0 or higher, or macOS iOS Simulator.
  - **Display / Monitor:** Minimum 1280x720 resolution for administrative dashboard evaluation.

### 4.2 Software Tools & Development Stack

- **Node.js Environment:** Node.js `v18.x` or `v20.x LTS` and `npm` package manager (`v9.x` or higher).
- **Core Runtime & Libraries:**
  - `expo` (`^57.0.27`) & `expo-router` (`~57.0.25`)
  - `react` (`19.2.3`) & `react-native` (`0.86.3`)
  - `react-native-web` (`^0.21.2`)
  - `zustand` (`^4.5.0`)
  - `@react-native-async-storage/async-storage` (`2.2.0`)
  - `@expo/vector-icons` (`^15.0.2`)
- **Code Editor & IDE:** Visual Studio Code or Google Antigravity IDE with extensions:
  - ESLint
  - Prettier
  - Expo Tools
  - TypeScript and JavaScript Language Features
- **Web Browsers:** Google Chrome, Mozilla Firefox, or Microsoft Edge with Web Developer Tools.

### 4.3 Version Control & Environment Setup

- **Version Control System:** **Git** (`>= 2.30.0`)
- **Remote Hosting:** **GitHub** repository (`debzkie05/emergency-monitoring-system`)
- **Branch Management Strategy:**
  - `main`: Stable production-ready branch.
  - Feature branches: `feature/<feature-name>` for feature enhancements.
  - Bugfix branches: `fix/<bug-name>` for patch releases.
- **Commit Standards:** Conventional Commits convention (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

---

## 5. Project Directory & File Structure

```
CampusSafe/
├── app/                                 # Expo Router File-Based Routing Root
│   ├── _layout.tsx                      # Root Application Stack & Layout
│   ├── index.tsx                        # Global Entry Redirect (Auth Gate)
│   ├── (auth)/                          # Authentication Route Group
│   │   ├── _layout.tsx                  # Auth Group Stack Configuration
│   │   └── login.tsx                    # Multi-Role Sign-in Screen
│   ├── (user)/                          # User Portal (Mobile & Responsive Web)
│   │   ├── _layout.tsx                  # Bottom Tab Navigator Layout
│   │   ├── index.tsx                    # Home Screen: SOS Button & Quick History
│   │   ├── emergency/                   # Multi-Step Emergency Reporting Wizard
│   │   │   ├── index.tsx                # Wizard Entry Guard
│   │   │   ├── sent.tsx                 # Alert Confirmation Screen
│   │   │   ├── type.tsx                 # Emergency Category Selector
│   │   │   ├── location.tsx             # Campus Building & Floor Selector
│   │   │   ├── details.tsx              # Photos & Narrative Description Input
│   │   │   └── review.tsx               # Review & Final Submission Screen
│   │   ├── reports/                     # User Incident History & Tracking
│   │   │   ├── index.tsx                # Personal Reports List
│   │   │   └── [id].tsx                 # Live Incident Progress & Status Timeline
│   │   ├── lost-found/                  # Community Lost & Found Hub
│   │   │   ├── index.tsx                # Searchable Catalog of Items
│   │   │   └── report.tsx               # Lost/Found Item Reporting Form
│   │   └── profile.tsx                  # User Profile & Emergency Contacts
│   └── (admin)/                         # Admin Command Center (Desktop & Tablet)
│       ├── _layout.tsx                  # Admin Shell Navigation
│       ├── index.tsx                    # Executive Command Dashboard & KPIs
│       ├── incidents/                   # Incident Dispatch Management
│       │   ├── index.tsx                # Master Incident Triage Table
│       │   └── [id].tsx                 # Detailed Incident Dispatch Console
│       ├── locations/                   # Campus Facilities Management
│       │   └── index.tsx                # Facilities & Building Directory
│       ├── lost-found/                  # Admin Lost & Found Management
│       │   └── index.tsx                # Verification & Claim Resolution Desk
│       ├── reports/                     # Analytics & Safety Reports
│       │   └── index.tsx                # Statistical Safety Summaries
│       └── users/                       # User Registry & Roles
│           └── index.tsx                # Campus Safety Personnel & User Registry
├── src/                                 # Shared Application Source Code
│   ├── components/                      # Reusable UI & Layout Components
│   │   ├── common/                      # Shared Specialized Components
│   │   │   ├── IncidentCard.tsx         # Incident Display Card with Status
│   │   │   ├── StatusTimeline.tsx       # Multi-Stage Vertical Timeline
│   │   │   └── ComingSoon.tsx           # Placeholder for Extended Modules
│   │   ├── layout/                      # Layout & Frame Wrappers
│   │   │   ├── AdminShell.tsx           # Desktop Sidebar & Header Wrapper
│   │   │   ├── Header.tsx               # Screen Header Component
│   │   │   ├── PhoneFrame.tsx           # Mobile Frame Simulator
│   │   │   └── ResponsiveFrame.tsx      # Adaptive Viewport Container
│   │   └── ui/                          # Design System Primitives
│   │       ├── Button.tsx               # Theme-Aware Touch Button
│   │       ├── Card.tsx                 # Card Container with Shadows
│   │       ├── Input.tsx                # Form Input Component
│   │       └── StatusBadge.tsx          # Incident Status Badge Pill
│   ├── constants/                       # Style Constants & Tokens
│   │   └── theme.ts                     # Colors, Typography, Spacing, Shadows
│   ├── data/                            # Mock Data Schemas & Seed Data
│   │   ├── emergencyTypes.ts            # Emergency Classification Definitions
│   │   ├── incidents.ts                 # Seed Incident Records
│   │   ├── locations.ts                 # Predefined Buildings & Room Mappings
│   │   ├── responders.ts                # Available Emergency Responder Roster
│   │   └── users.ts                     # Predefined User & Admin Credentials
│   ├── stores/                          # Reactive Zustand State Stores
│   │   ├── authStore.ts                 # Authentication & Session Management
│   │   ├── incidentStore.ts             # Incident Dispatch & Lifecycle Management
│   │   └── lostFoundStore.ts            # Lost & Found Records Management
│   ├── types/                           # Strict TypeScript Interface Definitions
│   │   └── index.ts                     # User, Incident, Location, Responder Types
│   └── utils/                           # Helper Utilities
│       └── helpers.ts                   # Date Formatter, String & Badge Helpers
├── assets/                              # App Icons & Visual Assets
├── app.json                             # Expo Configuration Manifest
├── babel.config.js                      # Babel Compiler Presets
├── metro.config.js                      # Metro Bundler Configuration
├── package.json                         # Project Dependencies & Scripts
├── tsconfig.json                        # TypeScript Compiler Configuration
└── README.md                            # Comprehensive System Documentation
```

---

## 6. Setup & Execution Guide

### 6.1 Installation

1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/debzkie05/emergency-monitoring-system.git
   cd emergency-monitoring-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify TypeScript configuration and compilation:
   ```bash
   npx tsc --noEmit
   ```

### 6.2 Running on Supported Targets

#### Web Browser (Chrome, Firefox, Safari, Edge)
Launch the local development server in web mode:
```bash
npm run web
```
The application will open automatically at `http://localhost:8081`.

#### Mobile (Android / iOS)
Start the Expo Metro bundler:
```bash
npm start
```
- **Android:** Press `a` in the terminal to launch on a connected Android device or emulator, or run `npm run android`.
- **iOS:** Press `i` in the terminal to launch in the macOS iOS Simulator, or run `npm run ios`.
- **Physical Device:** Open the **Expo Go** app on your physical iOS or Android smartphone and scan the terminal QR code.

### 6.3 Demo & Testing Accounts

The system includes preconfigured mock accounts for testing both student and administrative roles:

| Role | Email Address | Password | Name / Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campussafe.edu` | `password` | Juan Dela Cruz (ID: `2024-00123`) |
| **Student** | `maria@campussafe.edu` | `password` | Maria Santos (ID: `2024-00456`) |
| **Admin** | `admin@campussafe.edu` | `password` | Admin Officer (ID: `ADMIN-001`) |

---

## 7. License & Credits

Developed for educational and campus community safety enhancement. Built with [React Native](https://reactnative.dev/), [Expo](https://expo.dev/), and [TypeScript](https://www.typescriptlang.org/).
## Loading performance

- **Skeleton loading:** `src/components/ui/Skeleton.tsx` and `src/components/common/Skeletons.tsx` show grey placeholder shapes while saved incidents load from the device. `LoadingGate` only shows them if loading lasts longer than 150 ms, so fast loads never flash a skeleton. The pulse stops when the user has "reduce motion" turned on.
- **Safety rule:** skeletons never replace the red emergency banner or the alert queue. The siren and banner do not wait for loading.
- **Image loading:** `SmartImage` shows a skeleton until a photo has loaded, and a placeholder icon if it fails.
- **Lazy loading:** the grouped-reports pop-up, the emergency action pop-up and the dev tools are loaded only when first needed. On web, each route is also split into its own file (`asyncRoutes` in `app.json`).
- **Preview:** in development, open the admin dashboard, press "Show Controls" in DEV TOOLS, then "Preview loading skeletons" to see the loading look for 2.5 seconds.
