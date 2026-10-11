# CampusSafe boilerplate (Expo + React Native + TypeScript)

One codebase, three role areas. After login, `AuthGate` sends each user to their own route group by role:
`(user)` mobile tabs for students and staff, `(admin)` sidebar dashboard (runs in the browser with `npx expo start --web`), `(responder)` assigned incidents.

## Setup

```bash
npx create-expo-app@latest CampusSafe          # default template with Expo Router
cd CampusSafe
# copy app/, src/, assets/ and .env.example from this boilerplate into the project (replace the default app/)
# merge app.json and tsconfig.json with the ones Expo generated (the @/* alias must point to ./src/*)
npx expo install expo-secure-store expo-location expo-notifications react-native-web react-dom
npm install zustand axios socket.io-client @tanstack/react-query
cp .env.example .env
npx expo start
```

## Folder map

```
app/                         Routes only. Every screen file is a one-line re-export.
  (auth)/                    login, loading
  (user)/                    tabs: index, reports, lost-found, profile (+ campus-map, emergency)
    emergency/sent.tsx         first screen after the one-tap alert
    emergency/details/         optional steps afterwards: type, location, details, review
  (admin)/                   incidents, lost-found, users, locations, settings (sidebar layout)
  (responder)/               index, assignments/[id]
src/
  features/                  One folder per feature: screens/ components/ hooks/ api/ + types.ts, constants.ts
    auth/  emergency-alert/  incidents/  lost-found/  locations/  users/
    dashboard/  home/  responder/  settings/  campus-map/  notifications/
    (lost-found keeps screens/user/ and screens/admin/ side by side)
  shared/                    components/ui, components/common, hooks (useRealtime), layouts (AdminShell)
  services/                  api.ts, storage.ts, realtime.ts, offlineQueue.ts, queryClient.ts
  theme/colors.ts
  config/env.ts
assets/                      images, icons, maps
```

## Rules that keep it clean

1. **Routes stay thin.** Files in `app/` only re-export a screen from `src/features`.
2. **Data flows one way:** screen, then hook, then `api/`, then `services/api.ts`.
3. **A feature owns its types and constants.** Only truly global things (colors, shared UI) live outside features.
4. **Features do not import each other's internals.** Share through `shared/`. (Allowed here: home and dashboard use pieces of `emergency-alert` and `incidents`.)
5. **Server data lives in React Query hooks.** Zustand is only for client state (signed-in user, the report draft).
6. **The app never connects to the database.** All data goes through your API. `offlineQueue.ts` only keeps failed alerts for retry.
7. **New feature** = a new folder in `src/features/` plus a one-line route in `app/`.

## The instant-alert flow

1. `EmergencyCard` starts a 3-second cancel countdown, then `POST /alerts` with time and last known location.
2. The draft store remembers the incident id and opens `emergency/sent`.
3. The user can add details (type, location, description) or skip. "Update report" sends `PATCH /alerts/:id`.

## Finished vs placeholder

Working starting points: login and role routing, instant alert with cancel, the details steps (location picker is a placeholder), incidents list and detail with Acknowledge, live updates through Socket.IO, admin shell, offline queue helper.
Placeholders: lost and found, campus map, locations, users, settings, profile, my reports, responder screens, notifications, photo upload.

## Backend contract this expects

`POST /auth/login`, `POST /alerts`, `GET /alerts`, `GET /alerts/:id`, `PATCH /alerts/:id`, and socket events `alert:new` and `alert:updated`.

## Works on phone, tablet, and desktop

One codebase runs on iOS, Android, and the web (`npx expo start`, then press `w` for the browser).

- Breakpoints live in `src/constants/theme.ts` (`tablet: 600`, `desktop: 1024`). `src/hooks/useResponsive.ts` reads them and updates on window resize and device rotation.
- Phones: full-screen layout with bottom tabs.
- Tablets (iPad, Android tablets, large windows): a centered, readable column with bottom tabs; lists use two columns.
- Desktop: the same column with a left side menu instead of bottom tabs. The login card is centered.
- Admin screens use their own desktop layout (sidebar) from 900px wide and a mobile layout below that.
- New screens should use `useResponsive()` instead of fixed widths.

Dependency note: `expo-font` must stay at `~13.0.4` for Expo SDK 52. A newer version crashes the web build with a blank page ("Module implementation must be a class").
