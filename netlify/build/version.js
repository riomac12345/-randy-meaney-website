// Runs during Netlify build — writes version.json to the publish directory.
// Version number = total git commit count, so it auto-increments on every deploy.
const { execSync } = require('child_process');
const fs = require('fs');

const count = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);
fs.writeFileSync('version.json', JSON.stringify({ version: count }));
console.log(`Site version: ${count}`);
