module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" }, modules: "auto" }]],
  plugins: ["@babel/plugin-syntax-import-assertions"],
}; 