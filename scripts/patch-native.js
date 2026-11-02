// Lets the installed Android / iPhone app open linkbox:// share links.
// Run after "npx cap add android" or "npx cap add ios":  node scripts/patch-native.js android|ios
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const platform = process.argv[2];

function patchAndroid() {
  const file = path.join(root, "android", "app", "src", "main", "AndroidManifest.xml");
  let xml = fs.readFileSync(file, "utf8");
  if (xml.includes('android:scheme="linkbox"')) return console.log("Android: already set up.");
  const filter =
    "\n            <intent-filter>\n" +
    '                <action android:name="android.intent.action.VIEW" />\n' +
    '                <category android:name="android.intent.category.DEFAULT" />\n' +
    '                <category android:name="android.intent.category.BROWSABLE" />\n' +
    '                <data android:scheme="linkbox" />\n' +
    "            </intent-filter>\n        ";
  const re = /(<activity\b[^>]*android:name="[^"]*MainActivity"[\s\S]*?)(\s*<\/activity>)/;
  if (!re.test(xml)) throw new Error("Couldn't find MainActivity in AndroidManifest.xml");
  xml = xml.replace(re, (_m, body, end) => body + filter + end.trimStart());
  fs.writeFileSync(file, xml);
  console.log("Android: linkbox:// links now open Link Box.");
}

function patchIos() {
  const file = path.join(root, "ios", "App", "App", "Info.plist");
  let plist = fs.readFileSync(file, "utf8");
  if (plist.includes("<string>linkbox</string>")) return console.log("iOS: already set up.");
  const block =
    "\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n" +
    "\t\t\t<key>CFBundleURLName</key>\n\t\t\t<string>com.linkbox.app</string>\n" +
    "\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>linkbox</string>\n\t\t\t</array>\n" +
    "\t\t</dict>\n\t</array>\n";
  const idx = plist.lastIndexOf("</dict>");
  if (idx < 0) throw new Error("Couldn't read Info.plist");
  plist = plist.slice(0, idx) + block + plist.slice(idx);
  fs.writeFileSync(file, plist);
  console.log("iOS: linkbox:// links now open Link Box.");
}

if (platform === "android") patchAndroid();
else if (platform === "ios") patchIos();
else { console.error("Usage: node scripts/patch-native.js android|ios"); process.exit(1); }
