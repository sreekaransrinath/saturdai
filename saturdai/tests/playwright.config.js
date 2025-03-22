const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  use: {
    // Launch Chrome with the extension
    launchOptions: {
      args: [
        `--disable-extensions-except=${process.cwd()}/saturdai`,
        `--load-extension=${process.cwd()}/saturdai`
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
}); 