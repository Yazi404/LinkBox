# Link Box

Save links with an English and an Omani Arabic title, then copy them, open them in your default browser, or move them to the Archive. Everything is stored on the device and works offline.

Each device keeps its own list of links; they don't sync between devices. Uninstalling the app removes its saved links.

---

## Easiest way: let GitHub build everything (no Android Studio, no Mac needed)

This gives you the Android `.apk`, the Windows `.exe`, the Mac `.dmg`, and a web address for iPhone.

1. Create a free account at https://github.com and click **New repository**. Name it `LinkBox`, choose **Public**, and create it.
2. On the new repository page, click **uploading an existing file**. Drag in **everything inside this LinkBox folder**, including the hidden `.github` folder (on Mac press Cmd+Shift+. in Finder to show it; on Windows turn on View → Hidden items). Click **Commit changes**.
3. Go to **Settings → Pages**. Under **Source**, choose **GitHub Actions**.
4. Go to the **Actions** tab. Open **Build Link Box apps** and click **Run workflow** (it also runs by itself after every upload). It takes about 10 minutes.
5. When it shows a green tick, open the run. At the bottom, under **Artifacts**, download:
   - **LinkBox-Android** → contains `LinkBox.apk`
   - **LinkBox-Windows** → installer and portable `.exe`
   - **LinkBox-Mac** → `.dmg`
   The **web** step shows the iPhone address, like `https://YOUR-NAME.github.io/LinkBox/`.

### Install on Android
Copy `LinkBox.apk` to the phone and open it. Allow **Install unknown apps** for your file manager or browser when asked. Android may warn that the app is from an unknown developer; choose **Install anyway**.

### Install on iPhone / iPad
1. Open the web address from step 5 in **Safari**.
2. Tap **Share → Add to Home Screen → Add**.
3. Open Link Box once from the home screen while online. After that it works fully offline, opens full-screen like an app, and OPEN LINK opens Safari.

### Install on Windows / Mac
Windows: run the `.exe`. If SmartScreen appears, choose **More info → Run anyway** (the app isn't code-signed).
Mac: open the `.dmg` and drag Link Box into Applications. The first time, right-click the app and choose **Open**.

---

## Sharing links with other people

Sharing works through WhatsApp, email, Teams or any other app, so the other person can be anywhere in the world.

- **SHARE (on each link)** sends a message with both titles, the link, and an "Add to Link Box" line. The other person can open the link straight away, even without Link Box. On phones this opens the normal share menu; on Windows / Mac you choose WhatsApp, Email or Copy.
- **SHARE LIST / Share links** lets you tick several links (or all of them) and sends them as one small `.json` file. On Windows / Mac the file is saved first so you can attach it.
- **IMPORT / Import links** opens a file you were sent. Links you already have are skipped.
- **Tap-to-add:** tapping the "Add to Link Box" line opens the online Link Box with the link ready to save. To save it in the installed app instead, tap OPEN IN APP, or copy the line and paste it into the Link box of ADD NEW LINK — the titles fill in by themselves.

The "Add to Link Box" line uses your GitHub Pages address, which the GitHub build fills in automatically. Pages must be switched on (Settings → Pages → Source: GitHub Actions). If you build on your own computer instead, run `node scripts/set-web-url.js <github-name> <repository-name>` first, or the line will use a `linkbox://` address that only works when pasted into Link Box.

---

## Try it right now
Double-click `www/index.html` on Windows or Mac. It works offline in your browser.

---

## Building on your own computer instead

Install **Node.js 22 (LTS)** from https://nodejs.org, open a terminal in this folder, and run `npm install` once.

**Windows** (on a Windows PC): `npm run build:win` → files appear in `dist`.

**Mac** (on a Mac): `npm run build:mac` → `.dmg` appears in `dist`.

**Android** (needs Android Studio): `npm run android:setup`, then `npm run android:open`. In Android Studio choose **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

**iPhone as a real App Store-style app** (needs a Mac with Xcode):
1. `npm run ios:setup`, then `npm run ios:open`. Xcode opens the project.
2. In Xcode, select the **App** target → **Signing & Capabilities** → choose your Apple ID as the Team.
3. Plug in the iPhone, select it at the top of Xcode, and press **Run**.

With a free Apple ID, the app stops opening after 7 days and has to be run from Xcode again. To install it permanently, or share it through TestFlight or the App Store, you need a paid Apple Developer Program membership.

---

## Updating the app
Change `www/index.html`. If you use the iPhone/web version, also raise the number in `www/sw.js` (for example `linkbox-v2` → `linkbox-v3`) so phones pick up the change. Upload the files to GitHub again and the workflow rebuilds everything.

Installing a new version over the old one keeps your saved links (Android: install the new .apk over the old app, don't uninstall first).

## Files
- `www/` – the app itself (`index.html`), plus offline files for the iPhone/web version
- `main.js`, `preload.js` – Windows / Mac wrapper
- `capacitor.config.json`, `assets/` – Android and iOS wrapper and icons
- `build/icon.png` – Windows / Mac icon
- `scripts/` – fills in the share-link address, and lets the Android / iPhone apps open `linkbox://` links
- `.github/workflows/build-apps.yml` – the GitHub cloud build
