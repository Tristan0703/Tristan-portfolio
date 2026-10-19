/** @type {import('cypress'). defineConfig} */

const { defineConfig } = require("cypress");
module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{ts,js}',
    setupNodeEvents(on) {
      // implement node event listeners here
    },
    allowCypressEnv: false,
    supportFile: false,
    baseUrl: 'http://localhost:3001',
  },
  experimental: {
    tsconfig: true
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});