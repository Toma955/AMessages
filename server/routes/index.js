const fs = require("fs");
const path = require("path");

module.exports = (app) => {
  const routesDir = __dirname; // Definira direktorij u kojem se nalaze sve route datoteke

  fs.readdirSync(routesDir).forEach((file) => {
    // Preskače glavnu index datoteku i sve datoteke koje nisu JavaScript
    if (file === "index.js" || !file.endsWith(".js")) return;

    const route = require(path.join(routesDir, file));
    
    // Preskače datoteke koje ne izvoze funkciju
    if (typeof route !== "function") return;

    // Dobiva osnovno ime datoteke bez ekstenzije
    const baseName = path.basename(file, ".js");

    // Generira URL prefix uklanjanjem "Routes" i pretvaranjem u mala slova
    const prefix = baseName.replace("Routes", "").toLowerCase();

    // Montira rutu na Express aplikaciju pod definiranim API prefixom
    app.use(`/api/${prefix}`, route);

    // Ispisuje informaciju o montiranoj ruti u konzolu
    console.log(`Mounted /api/${prefix} → ${file}`);
  });
};
