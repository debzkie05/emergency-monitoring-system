# CampusSafe - Fixed Project

## What was fixed
- Restored backward-compatible theme color aliases used by the existing screens.
- Restored the missing `fontSize.hero` value.
- TypeScript check now passes with `tsc --noEmit`.
- Expo web production export was tested successfully.
- Removed the bundled `node_modules` and `.expo` folders from this ZIP so Windows/npm can install clean dependencies.

## Setup
Open PowerShell in this folder:

```powershell
npm install
npm start
```

For web:

```powershell
npm run web
```

For Android:

```powershell
npm run android
```

## If npm reports an old/corrupt dependency state
Run:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm start
```

Do NOT run `npx expo` first. Use the project scripts above.

## Verification performed
- TypeScript: PASS
- Expo web export: PASS
