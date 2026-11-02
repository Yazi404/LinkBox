// Puts the online Link Box address (GitHub Pages) into the app, so SHARE can send tap-to-add links.
// Usage: node scripts/set-web-url.js <github-owner> <repository-name>
// Or set LINKBOX_WEB_URL to use a different address.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "www", "index.html");
const owner = String(process.argv[2] || "").toLowerCase();
const repo = String(process.argv[3] || "");

let url = process.env.LINKBOX_WEB_URL || "";
if (!url && owner && repo) {
  url = repo.toLowerCase() === owner + ".github.io"
    ? "https://" + owner + ".github.io/"
    : "https://" + owner + ".github.io/" + repo + "/";
}
if (!url) {
  console.log("No web address given. Share links will use linkbox:// instead.");
  process.exit(0);
}
if (!/^https:\/\/[^\s"'<>]+\/$/.test(url)) {
  console.error("The web address must start with https:// and end with /. Got: " + url);
  process.exit(1);
}
const text = fs.readFileSync(file, "utf8");
if (!text.includes("__LINKBOX_WEB_URL__")) {
  console.log("Web address is already set in www/index.html.");
  process.exit(0);
}
fs.writeFileSync(file, text.replace("__LINKBOX_WEB_URL__", url));
console.log("Share links will use " + url);
