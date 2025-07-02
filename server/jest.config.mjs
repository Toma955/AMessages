import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.cjs') }],
  },
  testEnvironment: "node",
  // Force all test files to be treated as CommonJS for compatibility
  extensionsToTreatAsEsm: [],
}; 