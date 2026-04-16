# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm start              # Start Expo dev client
pnpm android            # Run on Android
pnpm ios                # Run on iOS
pnpm web                # Run on web

# Code Quality
pnpm lint               # ESLint with auto-fix
pnpm lint:check         # ESLint (no fix)
pnpm compile            # TypeScript type-check (no emit)

# Testing
pnpm test               # Run Jest
pnpm test:watch         # Jest in watch mode
pnpm test:maestro       # Maestro E2E tests

# EAS Builds
pnpm build:ios:sim      # iOS simulator dev build
pnpm build:android:sim  # Android simulator dev build
pnpm build:ios:prod     # iOS production build
pnpm build:android:prod # Android production build

# Utilities
pnpm depcruise          # Analyze dependency structure
pnpm align-deps         # Fix Expo SDK version mismatches
pnpm prebuild:clean     # Clean native build cache
```

```bash
# Run a single test file
pnpm test -- path/to/test.ts
```

**Requirements:** Node >=20, pnpm package manager.

## Architecture

### Tech Stack

- **Expo 55 / React Native 0.83** — cross-platform (iOS, Android, Web)
- **React Navigation 7** — native-stack + bottom-tabs
- **apisauce** — HTTP client (axios wrapper)
- **react-native-mmkv** — fast encrypted local storage
- **i18next / react-i18next** — i18n with 7 locales (en, ar, ko, es, fr, ja, hi)
- **react-native-reanimated 4** — animations
- **Ignite boilerplate** — base structure from Infinite Red

### Directory Roles

```
app/
├── app.tsx              # Root: loads fonts/i18n, mounts providers
├── components/          # Shared UI components (Screen, Text, Button, TextField, Toggle/…)
├── screens/             # Full-screen components
├── navigators/          # AppNavigator (root), navigationTypes, navigationUtilities
├── services/api/        # apisauce client, response types, error handling
├── theme/               # Design token system (see below)
├── i18n/                # i18next config + translation files per locale
├── utils/               # storage wrapper, date helpers, hooks
├── config/              # Environment config selected by __DEV__
└── devtools/            # Reactotron config (dev only)
assets/                  # Icons and images
ignite/templates/        # Ignite code-gen templates
```

### Provider Stack (app.tsx)

`SafeAreaProvider` → `KeyboardProvider` → `ThemeProvider` → `AuthProvider` → `CartProvider` → `AppNavigator`

### Theme System

All styling flows through `app/theme/`. Key files:

| File | Purpose |
|------|---------|
| `context.tsx` | `ThemeProvider` + `useAppTheme()` hook |
| `theme.ts` | Light/dark theme objects |
| `colors.ts` / `colorsDark.ts` | Color palettes |
| `spacing.ts` | Spacing scale |
| `typography.ts` | Font families and sizes |

Components call `useAppTheme()` to get the active theme. Theme preference is persisted via MMKV and falls back to the OS setting.

Styles are defined as `ThemedStyle<T>` functions, not static objects. This enables live theme switching:

```typescript
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  paddingHorizontal: spacing.lg,
})
// In component: <View style={themed($container)} />
// themed() from: const { themed } = useAppTheme()
```

Mixed arrays work: `themed([$static, $dynamic])` — static styles are passed through as-is.

### Navigation

`AppNavigator.tsx` is the root navigator. Navigation param types are declared in `navigationTypes.ts`. Navigation state is persisted across restarts via `navigationUtilities.ts` (controlled by `config.persistNavigation`). Type-safe navigation uses `NavigatorScreenParams` generics.

**Auth guard is navigator-level:** `AppNavigator` renders entirely different screen sets based on `isAuthenticated`. Login/logout replaces the full navigation stack — back-navigation into protected/public screens is impossible by design.

The Catalog tab is a nested stack navigator (`CatalogNavigator`), enabling drill-down (List → Detail → Stock/Pricing) while keeping tabs accessible.

### API Layer

A singleton `api` instance (apisauce) lives in `services/api/index.ts`. Base URL is selected from `config/` by `__DEV__`. Default timeout is 10 seconds. Errors are normalized via `apiProblem.ts`.

All API methods return **discriminated unions** instead of throwing:

```typescript
// Returns {kind: "ok", result: T} or an ApiProblem
const response = await api.login(credentials)
if (response.kind !== "ok") {
  // handle error — response.kind narrows the error type
  return
}
// response.result is typed here
```

Screens check `response.kind` directly. Avoid wrapping API calls in try/catch — the union pattern already encodes failure.

### Global State (Contexts)

`app/contexts/` holds lightweight Context API providers (no Redux/Zustand):

- **`AuthContext`** — `isAuthenticated`, token persistence, login/logout
- **`CartContext`** — cart items, `getQuantity(itemCode)` helper, `fetchCart()` refresh

Cart is fetched once on app mount. After mutations (add/remove), call `fetchCart()` explicitly to sync state.

### Config

Environment values are merged at runtime:

```typescript
// config/index.ts
const Config = { ...BaseConfig, ...(__DEV__ ? DevConfig : ProdConfig) }
```

Only `API_URL`, timeouts, and feature flags differ between environments. Add shared constants to `BaseConfig`.

### Storage

`utils/storage/index.ts` wraps MMKV with `load`, `save`, `remove`, and `clear`. MMKV is encrypted on Android.

### i18n

`i18n/index.ts` initializes i18next, detects locale via `expo-localization`, and sets RTL layout for Arabic via `I18nManager`. Translation keys are typed as `TxKeyPath` (recursive keyof English translations) — all keys must exist in `en.ts` to compile.

### Path Aliases

`@/*` maps to `app/*` and `@assets/*` maps to `assets/*` (configured in `tsconfig.json` and `babel.config.js`).

### Screen Component

`components/Screen.tsx` is the standard page wrapper. It handles safe-area insets, keyboard avoidance, and scroll behavior. Use the `preset` prop:

- `"fixed"` — static layout, no scroll
- `"scroll"` — always scrollable
- `"auto"` — disables scroll if content fills less than 92% of the viewport, enables it otherwise
