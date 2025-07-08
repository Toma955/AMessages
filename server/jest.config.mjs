import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.cjs') }],
  },
  testEnvironment: "node",
  // Treat .js files as ES modules
  extensionsToTreatAsEsm: ['.js'],
  // Enable ES modules support
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  // Set module type to ES modules
  preset: undefined,
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
}; 