const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, "testConfig.json");

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} catch (err) {
  throw new Error(" Ne mogu učitati testConfig.json: " + err.message);
}

module.exports = config;
