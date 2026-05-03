# 🚀 Build Instructions & Environment Guide

This document outlines the strict environment rules and steps required to build this React Native Expo application successfully on EAS (Expo Application Services) without encountering Gradle or Metro Bundling errors.

## ⚠️ Critical Rules (Do Not Change)

Over the course of development, several specific configurations were locked in to prevent the Android build pipeline from failing. **If you revert these, your app will fail to build:**

1. **Keep Expo SDK at 52:**
   - **Do not upgrade to Expo SDK 53.** It is currently in an experimental state and causes breaking changes with React Native Autolinking (`ExpoModulesPackage`). 
   - Your `package.json` must have `"expo": "^52.0.0"`.
   - Your React Native version must stay at `"react-native": "0.76.9"`.

2. **Keep the `.npmrc` File:**
   - The project uses `pnpm`. By default, `pnpm` uses a symlinked `node_modules` structure which breaks the native Android Java compiler (`javac`) when it tries to locate `ExpoModulesPackage.kt`.
   - The `.npmrc` file contains `node-linker=hoisted`. **Do not delete this file.** It forces `pnpm` to install packages in a flat structure, which allows the Android build to succeed.

3. **Mandatory Dependencies:**
   - **`@babel/runtime`**: Metro Bundler requires this for resolving JS imports on EAS. If this is missing from `package.json`, the JS bundling phase will fail.
   - **`expo-asset`**: Required by Expo SDK 52's internal Metro configuration. Even if you don't explicitly import it in your TSX files, removing it will crash the build at `createBundleReleaseJsAndAssets`.

4. **Node 24 Compatibility:**
   - You are running Node `v24`. The `expo-web-browser` config plugin is currently incompatible with Node 24's strict module stripping rules. 
   - **Do not add `"expo-web-browser"` to the `plugins` array in `app.json`.** Leaving it out prevents the `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` crash.

---

## 🛠️ How to Build the App (Step-by-Step)

Whenever you make new code changes and want to generate a fresh APK, follow these exact steps:

### Step 1: Install Dependencies Safely
If you have added new packages, always run an install to ensure your lockfile is updated and the `node-linker=hoisted` rule is applied.
```bash
# Recommended
pnpm install

# Alternatively, if you switch to npm:
npm install
```

### Step 2: Test the Bundler Locally (Optional but Recommended)
Before sending the build to the cloud, you can test if your JavaScript code has any Metro Bundler errors (this takes only a few seconds and saves you a 10-minute wait on EAS):
```bash
npx tsc --noEmit
npx expo export:embed --platform android --dev false
```
*If the second command succeeds, you are 100% safe from missing Babel or Asset errors.*

### Step 3: Commit Your Changes
EAS Build requires all changes to be committed to Git.
```bash
git add .
git commit -m "your commit message"
```

### Step 4: Run the EAS Build
Trigger the EAS build for Android. The `preview` profile will generate a standard `.apk` file that you can install directly on your phone.
```bash
eas build --platform android --profile preview
```

### Step 5: Download the APK
Once the build completes in the terminal, it will provide a link (e.g., `https://expo.dev/accounts/...`). Click the link to download your `build.apk` file.
