# FCM Integration Plan

## Overview

Integrate Firebase Cloud Messaging (FCM) into the SalesApp Template to support push
notifications on iOS, Android, and Web. The integration will use
`@react-native-firebase/app` + `@react-native-firebase/messaging` (the de-facto
standard for bare/managed Expo workflow with EAS).

**Current state:** No Firebase setup. No push notification libraries installed.  
**Target:** Full FCM support — token registration, foreground/background/quit-state
message handling, deep-link routing on tap, and token refresh.

---

## Phase 1 — Firebase Project Setup (Manual / Backend)

These are one-time configuration steps done outside the codebase.

1. Create a Firebase project (or use an existing one) at console.firebase.google.com.
2. Register the Android app (`com.fasttrack.sales`) → download `google-services.json`.
3. Register the iOS app (`com.fasttrack.sales`) → download `GoogleService-Info.plist`.
4. Enable **Cloud Messaging** in the Firebase console.
5. For iOS: generate an APNs Auth Key (p8) or APNs certificate in Apple Developer
   portal and upload it to Firebase → Project Settings → Cloud Messaging → iOS app.

---

## Phase 2 — Dependency Installation

```bash
# Core Firebase
pnpm add @react-native-firebase/app @react-native-firebase/messaging

# Expo notification permissions helper (expo-notifications handles permission UI)
pnpm add expo-notifications
```

**Why `@react-native-firebase` over `expo-notifications` alone:**
- Full background message handling requires native Firebase SDK.
- `expo-notifications` is UI/permission-only; FCM delivery uses the native Firebase SDK.
- Both can coexist: expo-notifications for permission prompts + local notification
  display; @react-native-firebase/messaging for token management and raw FCM payloads.

---

## Phase 3 — Native Configuration

### 3.1 app.config.ts — Plugin Registration

Add Firebase plugins to `app.config.ts` so EAS prebuild wires up native modules:

```ts
// app.config.ts (additions inside plugins array)
"@react-native-firebase/app",
[
  "expo-notifications",
  {
    icon: "./assets/notification-icon.png",  // 96×96 monochrome PNG
    color: "#ffffff",
    sounds: ["./assets/sounds/notification.wav"],
  },
],
```

### 3.2 google-services.json / GoogleService-Info.plist

Place the downloaded Firebase config files:

```
android/app/google-services.json        ← Android
ios/SalesApp_Template/GoogleService-Info.plist  ← iOS
```

For EAS managed secrets (CI/CD), store them as EAS secrets and inject via
`app.config.ts`:

```ts
// app.config.ts
googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
```

### 3.3 Android — AndroidManifest.xml

Add the following permissions (most are added automatically by the Firebase plugin,
but verify they are present after prebuild):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>   <!-- Android 13+ -->
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE"/>
```

### 3.4 iOS — Push Capability

The `@react-native-firebase/app` plugin adds the Push Notifications entitlement
automatically via `app.config.ts`. Verify in Xcode:  
`Signing & Capabilities → + Capability → Push Notifications`

---

## Phase 4 — Notification Service (New Files)

Create a dedicated notification service layer following the existing `services/api/`
pattern.

### File Structure

```
app/
└── services/
    └── notifications/
        ├── index.ts              ← public API (re-exports)
        ├── notificationService.ts ← core FCM logic
        ├── notificationHandler.ts ← foreground display logic
        └── types.ts              ← shared types
```

### 4.1 `types.ts`

```ts
export type NotificationData = {
  type: "order_update" | "promotion" | "system"
  entityId?: string
  deepLink?: string
}

export type FcmToken = string
```

### 4.2 `notificationService.ts`

Responsibilities:
- Request permission on first launch (deferred to an appropriate moment — not on cold
  start).
- Retrieve and return the FCM token.
- Register a token-refresh listener and re-upload on change.
- Register background message handler (must be called outside React tree, at module
  scope, before `AppRegistry.registerComponent`).

Key implementation points:

```ts
import messaging from "@react-native-firebase/messaging"
import { api } from "@/services/api"
import { storage } from "@/utils/storage"

const FCM_TOKEN_KEY = "fcm_token"

// Called at module scope in index.ts (before AppRegistry)
export function registerBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Persist or route the message; do NOT update UI here
    console.log("Background FCM message", remoteMessage)
  })
}

export async function requestPermission(): Promise<boolean> {
  const status = await messaging().requestPermission()
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  )
}

export async function getFcmToken(): Promise<FcmToken | null> {
  const hasPermission = await messaging().hasPermission()
  if (!hasPermission) return null
  return messaging().getToken()
}

export async function uploadTokenIfChanged(token: FcmToken) {
  const stored = storage.load(FCM_TOKEN_KEY)
  if (stored === token) return
  await api.registerFcmToken(token)   // see Phase 5
  storage.save(FCM_TOKEN_KEY, token)
}

export function subscribeToTokenRefresh(onToken: (t: FcmToken) => void) {
  return messaging().onTokenRefresh(onToken)
}
```

### 4.3 `notificationHandler.ts`

Handles foreground notifications (FCM does not show them automatically):

```ts
import messaging from "@react-native-firebase/messaging"
import * as Notifications from "expo-notifications"

export function configureForegroundHandler() {
  // expo-notifications display settings
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  // FCM foreground listener — convert to local notification
  return messaging().onMessage(async remoteMessage => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title ?? "",
        body: remoteMessage.notification?.body ?? "",
        data: remoteMessage.data,
      },
      trigger: null,  // show immediately
    })
  })
}
```

---

## Phase 5 — API Layer Extension

Add a token registration endpoint to the existing `api` service in
`app/services/api/index.ts`:

```ts
// New method on Api class
async registerFcmToken(token: string) {
  return this.apisauce.post("/users/me/fcm-token", { token })
}
```

Add the corresponding response type in `types.ts`:

```ts
export type RegisterFcmTokenResponse = {
  success: boolean
}
```

---

## Phase 6 — Provider Integration (app.tsx)

### 6.1 Root-Level Background Handler

In `app/index.ts` (or wherever `AppRegistry.registerComponent` is called), register
the background handler **before** the component:

```ts
import { registerBackgroundHandler } from "@/services/notifications"
registerBackgroundHandler()
```

### 6.2 NotificationProvider

Create `app/services/notifications/NotificationProvider.tsx`:

```tsx
import React, { useEffect } from "react"
import {
  requestPermission,
  getFcmToken,
  uploadTokenIfChanged,
  subscribeToTokenRefresh,
  configureForegroundHandler,
} from "./notificationService"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined
    let unsubscribeRefresh: (() => void) | undefined

    async function init() {
      const granted = await requestPermission()
      if (!granted) return

      const token = await getFcmToken()
      if (token) await uploadTokenIfChanged(token)

      unsubscribeRefresh = subscribeToTokenRefresh(uploadTokenIfChanged)
      unsubscribeForeground = configureForegroundHandler()
    }

    init()
    return () => {
      unsubscribeForeground?.()
      unsubscribeRefresh?.()
    }
  }, [])

  return <>{children}</>
}
```

### 6.3 app.tsx — Updated Provider Stack

```tsx
<SafeAreaProvider initialMetrics={initialWindowMetrics}>
  <KeyboardProvider>
    <ThemeProvider>
      <NotificationProvider>          {/* ← new */}
        <AppNavigator
          linking={linking}
          initialState={initialNavigationState}
          onStateChange={onNavigationStateChange}
        />
      </NotificationProvider>
    </ThemeProvider>
  </KeyboardProvider>
</SafeAreaProvider>
```

---

## Phase 7 — Deep Link Routing on Notification Tap

When a user taps a notification while the app is in background or quit state, route
to the relevant screen.

Add a tap handler in `NotificationProvider.tsx`:

```tsx
import { useNavigation } from "@react-navigation/native"
import * as Notifications from "expo-notifications"
import messaging from "@react-native-firebase/messaging"

// Inside NotificationProvider useEffect:

// Background tap (app was backgrounded)
messaging().onNotificationOpenedApp(remoteMessage => {
  routeFromNotification(remoteMessage.data, navigation)
})

// Quit-state tap
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) routeFromNotification(remoteMessage.data, navigation)
  })

// Foreground tap (via expo-notifications)
const tapSub = Notifications.addNotificationResponseReceivedListener(response => {
  routeFromNotification(response.notification.request.content.data, navigation)
})
```

Create `app/services/notifications/notificationRouter.ts`:

```ts
import { NavigationContainerRef } from "@react-navigation/native"
import { NotificationData } from "./types"

export function routeFromNotification(
  data: Record<string, unknown> | undefined,
  navigation: NavigationContainerRef<any>,
) {
  if (!data) return
  const payload = data as NotificationData

  switch (payload.type) {
    case "order_update":
      navigation.navigate("Transactions")
      break
    case "promotion":
      navigation.navigate("Catalog")
      break
    default:
      navigation.navigate("Home")
  }
}
```

---

## Phase 8 — Permission UI (Settings Screen)

In `app/screens/SettingsScreen.tsx`, add a UI toggle to let users manage notification
permissions:

- Show current permission status (granted / denied / not-determined).
- If denied on iOS, deep-link to system Settings.
- If not-determined, call `requestPermission()` on toggle.

Use `expo-notifications` `getPermissionsAsync()` and `requestPermissionsAsync()` for
cross-platform permission querying.

---

## Phase 9 — EAS Build Configuration

### eas.json — Environment Variables

```json
{
  "build": {
    "production": {
      "env": {
        "GOOGLE_SERVICES_JSON": "google-services.json"
      }
    }
  }
}
```

Store `GOOGLE_SERVICES_JSON` and `GOOGLE_SERVICE_INFO_PLIST` as EAS secrets for CI:

```bash
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./android/app/google-services.json
eas secret:create --scope project --name GOOGLE_SERVICE_INFO_PLIST --type file --value ./ios/SalesApp_Template/GoogleService-Info.plist
```

---

## Phase 10 — Testing

### Unit Tests

- `notificationService.ts`: mock `@react-native-firebase/messaging`, assert token
  upload called on first fetch, skipped when token unchanged.
- `notificationRouter.ts`: assert correct screen navigated for each `type` value.
- `apiProblem.ts`: extend existing test for FCM token registration error cases.

### Integration Tests (Maestro)

Add `.maestro/notification_tap.yaml`:
- Simulate background notification tap → assert correct screen is active.

### Manual Checklist

- [ ] Cold start: permission dialog appears on first launch.
- [ ] Token logged and uploaded to API on first launch.
- [ ] Foreground notification displayed as local notification.
- [ ] Background tap navigates to correct screen.
- [ ] Quit-state tap navigates to correct screen.
- [ ] Token refresh triggers re-upload.
- [ ] iOS APNs delivery confirmed via Firebase Console test message.
- [ ] Android FCM delivery confirmed via Firebase Console test message.

---

## File Change Summary

| File | Change |
|------|--------|
| `app.config.ts` | Add `@react-native-firebase/app` + `expo-notifications` plugins |
| `app/app.tsx` | Wrap AppNavigator in `NotificationProvider` |
| `app/index.ts` | Call `registerBackgroundHandler()` before `AppRegistry` |
| `app/services/api/index.ts` | Add `registerFcmToken()` method |
| `app/services/api/types.ts` | Add `RegisterFcmTokenResponse` type |
| `app/services/notifications/index.ts` | New — re-exports |
| `app/services/notifications/types.ts` | New — shared types |
| `app/services/notifications/notificationService.ts` | New — core FCM logic |
| `app/services/notifications/notificationHandler.ts` | New — foreground display |
| `app/services/notifications/notificationRouter.ts` | New — tap routing |
| `app/services/notifications/NotificationProvider.tsx` | New — React provider |
| `app/screens/SettingsScreen.tsx` | Add permission toggle UI |
| `android/app/google-services.json` | New — Firebase Android config |
| `ios/.../GoogleService-Info.plist` | New — Firebase iOS config |
| `eas.json` | Add EAS secret references |

---

## Risk & Decisions

| Risk | Mitigation |
|------|-----------|
| iOS APNs setup complexity | Use APNs Auth Key (p8) — simpler than certificates, doesn't expire |
| `google-services.json` in version control | Use EAS secrets for CI; add to `.gitignore` if needed |
| Background handler must run before `AppRegistry` | Document clearly; enforce via module-scope call in `index.ts` |
| Android 13+ runtime permission | Use `expo-notifications` `requestPermissionsAsync()` which handles API level differences |
| Token may be null on first launch if permission denied | Guard all token upload calls with null check |
| New Architecture (newArchEnabled: true) | Both `@react-native-firebase` v21+ and `expo-notifications` v0.29+ support the New Architecture |
