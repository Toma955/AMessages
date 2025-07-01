import fs from "fs";
import path from "path";

export default (app) => {
  const routesDir = __dirname; 

  fs.readdirSync(routesDir).forEach((file) => {
  
    if (file === "index.js" || !file.endsWith(".js")) return;

    const route = require(path.join(routesDir, file));
    
    if (typeof route !== "function") return;
    const baseName = path.basename(file, ".js");

    const prefix = baseName.replace("Routes", "").toLowerCase();

    app.use(`/api/${prefix}`, route);

    console.log(`Mounted /api/${prefix} → ${file}`);
  });
};
