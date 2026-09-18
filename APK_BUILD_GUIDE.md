# 📱 Mumbai Zaika POS - Android APK Build Guide (via GitHub Actions)

This repository is pre-configured with **Capacitor Android** and **GitHub Actions** CI/CD to automatically compile a ready-to-install Android `.apk` file without requiring Android Studio or Gradle installed on your computer.

---

## Method 1: Automatic Build via GitHub Actions (Recommended)

### Step 1: Export or Push this Repository to GitHub
1. In Google AI Studio Build, click the **Settings / Export** menu in the top right.
2. Select **Export to GitHub** (or connect your GitHub repository).
3. If using standard Git CLI:
   ```bash
   git add .
   git commit -m "feat: configure Capacitor and Android APK workflow"
   git push origin main
   ```

### Step 2: Automated Cloud Compilation
1. Go to your GitHub repository in your browser (`https://github.com/<your-username>/<repo-name>`).
2. Click the **Actions** tab at the top.
3. You will see the workflow **"Build & Package Android APK"** running automatically.
   *(You can also manually click **"Run workflow"** at any time).*
4. The build typically completes in **2–3 minutes** on GitHub's cloud runners.

### Step 3: Download Your APK File
1. Click on the completed workflow run (green checkmark ✅).
2. Scroll down to the **Artifacts** section at the bottom of the summary page.
3. Click **`mumbai-zaika-pos-apk`** to download the ZIP file containing `mumbai-zaika-pos.apk`.
4. Unzip and transfer the `.apk` file to your Android phone, tablet, or POS terminal!

### Step 4: Install on Android Phone / Tablet
1. Open the downloaded `.apk` file on your Android device.
2. If prompted, allow **"Install from unknown sources"** in your device settings.
3. Tap **Install** and open **Mumbai Zaika POS**!

---

## Method 2: Build Locally Using Android Studio (Optional)

If you have **Android Studio** installed on your computer:

1. Clone your GitHub repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. Install dependencies and compile web assets:
   ```bash
   npm install
   npm run cap:build
   ```

3. Open the Android project in Android Studio:
   ```bash
   npm run cap:open
   # or: npx cap open android
   ```

4. In Android Studio:
   - Go to menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Once completed, click **locate** to find `app-debug.apk` in `android/app/build/outputs/apk/debug/`.

---

## Project Configuration Details

- **App Name**: `Mumbai Zaika POS`
- **Application ID / Package**: `com.mumbaizaika.pos`
- **Minimum Android SDK**: Android 7.0 (API 24)
- **Target Android SDK**: Android 14+ (API 36)
- **Permissions**: Internet Access enabled for Google Sheets synchronization
- **Capacitor Configuration**: `capacitor.config.ts`
- **Workflow File**: `.github/workflows/build-apk.yml`
