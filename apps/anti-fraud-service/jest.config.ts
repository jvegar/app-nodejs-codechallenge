/* eslint-disable */
import { readFileSync } from 'fs';

// Reading the NX_VERSION from the workspace root
const { nx } = JSON.parse(
  readFileSync('/Users/josevega/repos/projects/app-nodejs-codechallenge/nx.json', 'utf-8')
);

export default {
  displayName: 'anti-fraud-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/anti-fraud-service',
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/test/**/*.test.ts'
  ]
};